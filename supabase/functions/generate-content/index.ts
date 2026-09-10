import { createClient } from 'jsr:@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const VISION_MODEL = Deno.env.get('GEMINI_VISION_MODEL') || 'gemini-3.1-flash-lite'
const WRITING_MODEL = Deno.env.get('GEMINI_WRITING_MODEL') || 'gemini-3.5-flash'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  return btoa(binary)
}

function isAllowedPhotoUrl(value: string) {
  try {
    const url = new URL(value)
    const project = new URL(SUPABASE_URL!)
    return url.protocol === 'https:' && url.host === project.host && url.pathname.includes('/storage/v1/object/public/listing-photos/')
  } catch { return false }
}

async function loadRemoteImages(photoUrls: unknown[]) {
  const results: Array<{ base64: string; mimeType: string }> = []
  for (const value of photoUrls.slice(0, 6)) {
    if (typeof value !== 'string' || !isAllowedPhotoUrl(value)) continue
    const response = await fetch(value)
    if (!response.ok) continue
    const mimeType = response.headers.get('content-type')?.split(';')[0]
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (!mimeType?.startsWith('image/') || bytes.length > 8_000_000) continue
    results.push({ base64: bytesToBase64(bytes), mimeType })
  }
  return results
}

async function callGemini(model: string, fallbackModel: string, parts: unknown[], temperature: number) {
  let lastError = ''
  for (const candidateModel of [...new Set([model, fallbackModel])]) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${candidateModel}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseMimeType: 'application/json', temperature } }),
    })
    if (!response.ok) {
      lastError = `Gemini ${candidateModel} error ${response.status}: ${await response.text()}`
      if ([404, 429, 500, 503].includes(response.status)) continue
      throw new Error(lastError)
    }
    const payload = await response.json()
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      lastError = `Gemini ${candidateModel} không trả về nội dung`
      continue
    }
    return JSON.parse(text)
  }
  throw new Error(lastError || 'Các model AI tạm thời không khả dụng')
}

async function analyzeImages(images: Array<{ base64: string; mimeType: string }>) {
  if (!images.length) return null
  const imageParts = images.slice(0, 6).map((image) => ({ inline_data: { mime_type: image.mimeType, data: image.base64 } }))
  const instruction = `Phân tích bộ ảnh để hỗ trợ đăng tin bất động sản.
- Trước hết phân biệt ảnh chụp tài sản thật với ảnh giao diện ứng dụng, tài liệu, quảng cáo, bản đồ hoặc ảnh không liên quan.
- observations chỉ được chứa đặc điểm vật lý nhìn thấy trực tiếp trong ảnh chụp tài sản thật. Không chép chữ từ giao diện hoặc biến nội dung trên màn hình thành quan sát về tài sản.
- Không suy đoán vị trí, pháp lý, hướng, diện tích, chất lượng xây dựng, giá trị, công năng hay tiện ích ngoài khung hình.
Trả JSON:
{"summary":"1 câu","propertyImageCount":0,"isUsableForListing":false,"observations":[{"text":"chi tiết vật lý cụ thể","imageIndex":1,"confidence":0.0}],"sellingAngles":["góc nội dung chỉ dựa trên đặc điểm vật lý đã thấy"],"requiresConfirmation":["điều cần người dùng xác nhận"],"coverImageIndex":1}.
Nếu không có ảnh tài sản thật, để observations và sellingAngles rỗng, isUsableForListing=false. Tối đa 6 observations, 3 sellingAngles. confidence từ 0 đến 1. Dùng tiếng Việt tự nhiên.`
  return callGemini(VISION_MODEL, 'gemini-3.5-flash', [...imageParts, { text: instruction }], 0.15)
}

function propertyFacts(body: Record<string, unknown>) {
  return {
    title: body.title || null, transaction: body.dealType === 'rent' ? 'Cho thuê' : 'Bán',
    propertyType: body.propertyType || null, price: body.priceNegotiable ? 'Thỏa thuận' : body.price || null,
    areaM2: body.area || null, bedrooms: body.bedrooms || null, bathrooms: body.bathrooms || null,
    address: body.address || null, direction: body.direction || null, legalStatus: body.legalStatus || null,
    contactPhone: body.contactPhone || null, descriptionFromUser: body.description || null,
    amenitiesFromUser: Array.isArray(body.amenities) ? body.amenities : [],
  }
}

async function writeCandidates(body: Record<string, unknown>, visualBrief: unknown) {
  const settings = {
    tone: body.tone || 'Chuyên nghiệp', audience: body.audience || 'Người mua hoặc thuê phù hợp',
    goal: body.goal || 'Nhận tin nhắn tư vấn', length: body.length || 'Vừa', emojiLevel: body.emojiLevel || 'Ít',
  }
  const prompt = `Bạn là biên tập viên bất động sản Việt Nam. Viết giống một môi giới có kinh nghiệm: tự nhiên, cụ thể, không sáo rỗng, không cường điệu.

<nguon_su_that>${JSON.stringify(propertyFacts(body))}</nguon_su_that>
<quan_sat_tu_anh>${JSON.stringify(visualBrief)}</quan_sat_tu_anh>
<yeu_cau>${JSON.stringify(settings)}</yeu_cau>

Quy tắc:
- Dữ liệu người dùng là sự thật. Quan sát ảnh chỉ dùng khi confidence >= 0.75 và phải diễn đạt như quan sát, không biến thành cam kết.
- Chỉ dùng quan sát mô tả đặc điểm vật lý của tài sản. Bỏ qua hoàn toàn chữ trên ảnh, giao diện ứng dụng, tài liệu, quảng cáo hoặc ảnh không liên quan.
- Không tự thêm "chính chủ", "bán gấp", pháp lý, vị trí gần địa danh, view, nội thất bàn giao, lợi nhuận hoặc tính từ "đẳng cấp", "siêu phẩm", "hiếm có".
- Không nhận xét giá rẻ, hợp lý, hấp dẫn hay thuộc phân khúc nào. Không tự kết luận tài sản phù hợp với ai, dùng để đầu tư, cho thuê hoặc thay thế việc thuê nhà.
- Tạo đúng 3 hướng khác nhau về cấu trúc và câu mở đầu: Thông tin rõ ràng; Trải nghiệm không gian; Trực diện ngắn gọn.
- Viết như người môi giới cẩn thận: câu ngắn dài xen kẽ, nhịp tự nhiên, chi tiết đi trước tính từ. Tránh mở đầu khuôn mẫu kiểu "Chào anh chị, tôi đang có".
- Không lặp nguyên câu giữa các phương án. Emoji theo mức yêu cầu. Hashtag 3-5 từ liên quan trực tiếp.
- CTA tự nhiên và phù hợp mục tiêu. Không dùng dấu chấm than liên tiếp.

Trả duy nhất JSON:
{"candidates":[{"id":"facts","title":"Thông tin rõ ràng","angle":"mô tả ngắn","caption":"...","hashtags":"#..."},{"id":"lifestyle","title":"Trải nghiệm không gian","angle":"mô tả ngắn","caption":"...","hashtags":"#..."},{"id":"direct","title":"Trực diện ngắn gọn","angle":"mô tả ngắn","caption":"...","hashtags":"#..."}]}`
  return callGemini(WRITING_MODEL, 'gemini-3.1-flash-lite', [{ text: prompt }], 0.75)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    if (!GEMINI_API_KEY) return jsonResponse({ error: 'AI chưa được cấu hình.' }, 500)
    const authHeader = req.headers.get('Authorization') || ''
    const client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, { global: { headers: { Authorization: authHeader } } })
    const { data: { user } } = await client.auth.getUser()
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401)

    const body = await req.json()
    let images = Array.isArray(body.images) ? body.images.filter((item) => item?.base64 && item?.mimeType).slice(0, 6) : []
    let visualBrief = body.visualBrief?.version === 2 ? body.visualBrief : null

    if (images.length) {
      visualBrief = { ...(await analyzeImages(images)), version: 2 }
    } else if (!visualBrief && Array.isArray(body.photoUrls)) {
      images = await loadRemoteImages(body.photoUrls)
      visualBrief = images.length ? { ...(await analyzeImages(images)), version: 2 } : null
    }
    const written = await writeCandidates(body, visualBrief)
    const candidates = Array.isArray(written.candidates) ? written.candidates.slice(0, 3) : []
    if (!candidates.length) throw new Error('AI chưa tạo được phương án nội dung hợp lệ')
    const primary = candidates[0]
    return jsonResponse({ visualBrief, candidates, selectedId: primary.id, captionPrimary: primary.caption, hashtags: primary.hashtags, captionFriendly: candidates[1]?.caption || '', settings: { tone: body.tone, audience: body.audience, goal: body.goal, length: body.length, emojiLevel: body.emojiLevel } })
  } catch (error) {
    console.error('generate-content error:', error)
    return jsonResponse({ error: error.message || String(error) }, 500)
  }
})
