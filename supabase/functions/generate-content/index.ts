// Supabase Edge Function: generate-content
// Calls Gemini (server-side, key never reaches the client) to generate
// captions, hashtags, and a short video script from listing photos + details.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_MODEL = 'gemini-flash-lite-latest'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('generate-content invoked, has GEMINI_API_KEY =', !!GEMINI_API_KEY)

  try {
    // Require a logged-in Supabase user (checked via their JWT) so this
    // function can't be hammered anonymously.
    const authHeader = req.headers.get('Authorization') ?? ''
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const {
      images = [],
      title,
      dealType,
      price,
      area,
      bedrooms,
      address,
      direction,
      legalStatus,
      contactPhone,
      description,
      amenities = [],
      tone = 'Chuyên nghiệp',
    } = body

    const propertyLine = [
      title ? `tiêu đề: ${title}` : null,
      dealType === 'rent' ? 'Cho thuê' : 'Bán',
      price ? `giá ${price}` : null,
      area ? `${area} m²` : null,
      bedrooms ? `${bedrooms} phòng ngủ` : null,
      address ? `tại ${address}` : null,
      direction ? `hướng ${direction}` : null,
      legalStatus ? `pháp lý: ${legalStatus}` : null,
      amenities.length ? `tiện ích: ${amenities.join(', ')}` : null,
      description ? `ghi chú thêm: ${description}` : null,
      contactPhone ? `liên hệ: ${contactPhone}` : null,
    ]
      .filter(Boolean)
      .join(' · ')

    const prompt = `Bạn là chuyên gia marketing bất động sản tại Việt Nam, chuyên viết caption đăng mạng xã hội (TikTok, Facebook, Zalo) để tối đa lượt tương tác. Dựa trên các ảnh căn nhà và thông tin sau: ${propertyLine}.
Giọng văn yêu cầu: ${tone}.
Hãy viết nội dung theo phong cách bài đăng phổ biến, dễ viral: mở đầu gây chú ý (hook), nhấn mạnh điểm nổi bật, có lời kêu gọi hành động rõ ràng${contactPhone ? ' kèm số điện thoại liên hệ' : ''}.
Hãy trả về DUY NHẤT một JSON object (không markdown, không giải thích thêm) đúng cấu trúc:
{
  "captionPrimary": "caption chính bằng tiếng Việt, giọng văn ${tone}, có emoji phù hợp, mở đầu gây chú ý, 3-5 câu",
  "hashtags": "7 hashtag tiếng Việt không dấu cách nhau bởi khoảng trắng, bắt đầu bằng #, ưu tiên hashtag đang thịnh hành cho bất động sản",
  "captionFriendly": "một caption thay thế, giọng văn thân thiện, gần gũi, 2-3 câu",
  "videoScript": {
    "0-5s": "mô tả cảnh mở đầu gây chú ý",
    "6-18s": "mô tả cảnh giữa, làm nổi bật không gian & tiện ích",
    "19-30s": "mô tả cảnh kết, kèm giá & lời kêu gọi liên hệ"
  }
}`

    const parts = [{ text: prompt }]
    for (const img of images.slice(0, 6)) {
      if (img?.base64 && img?.mimeType) {
        parts.push({ inline_data: { mime_type: img.mimeType, data: img.base64 } })
      }
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      throw new Error(`Gemini error ${geminiRes.status}: ${errText}`)
    }

    const geminiJson = await geminiRes.json()
    const text = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Gemini returned no content')

    const generated = JSON.parse(text)

    return new Response(JSON.stringify(generated), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('generate-content error:', error)
    return new Response(JSON.stringify({ error: error.message ?? String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
