import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GRAPH_VERSION = 'v23.0'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Unauthorized' }, 401)

    const { listingId, message, imageUrls = [] } = await req.json()
    if (!listingId) return json({ error: 'Thiếu listingId' }, 400)
    if (!message && !imageUrls.length) return json({ error: 'Bài đăng cần có nội dung hoặc hình ảnh' }, 400)

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: channel, error: channelError } = await admin
      .from('connected_channels')
      .select('external_id, access_token, display_name')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .single()
    if (channelError || !channel?.external_id || !channel?.access_token) {
      return json({ error: 'Chưa kết nối Facebook Page. Vui lòng kết nối Page trước.' }, 400)
    }

    const { data: listing } = await admin
      .from('listings')
      .select('id, user_id')
      .eq('id', listingId)
      .eq('user_id', user.id)
      .single()
    if (!listing) return json({ error: 'Tin đăng không hợp lệ' }, 400)

    const urls = (Array.isArray(imageUrls) ? imageUrls : []).filter((url) => typeof url === 'string' && url.startsWith('http')).slice(0, 10)
    const baseUrl = `https://graph.facebook.com/${GRAPH_VERSION}`
    const pageToken = channel.access_token
    const uploadedPhotoIds: string[] = []

    for (const url of urls) {
      const params = new URLSearchParams({
        url,
        published: 'false',
        access_token: pageToken,
      })
      const response = await fetch(`${baseUrl}/${channel.external_id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params,
      })
      const result = await response.json()
      if (!response.ok || result.error || !result.id) {
        console.error('facebook photo upload failed:', response.status, JSON.stringify(result))
        return json({ error: result.error?.message ?? 'Facebook không tải được hình ảnh' }, 400)
      }
      uploadedPhotoIds.push(result.id)
    }

    const feedParams = new URLSearchParams({ access_token: pageToken })
    if (message) feedParams.set('message', message)
    uploadedPhotoIds.forEach((id, index) => {
      feedParams.set(`attached_media[${index}]`, JSON.stringify({ media_fbid: id }))
    })

    const feedResponse = await fetch(`${baseUrl}/${channel.external_id}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: feedParams,
    })
    const feedResult = await feedResponse.json()
    if (!feedResponse.ok || feedResult.error || !feedResult.id) {
      console.error('facebook feed publish failed:', feedResponse.status, JSON.stringify(feedResult))
      return json({ error: feedResult.error?.message ?? 'Facebook đăng bài thất bại' }, 400)
    }

    return json({ success: true, postId: feedResult.id, pageName: channel.display_name, imageCount: uploadedPhotoIds.length })
  } catch (error) {
    console.error('facebook-publish error:', error)
    return json({ error: error?.message ?? String(error) }, 500)
  }
})
