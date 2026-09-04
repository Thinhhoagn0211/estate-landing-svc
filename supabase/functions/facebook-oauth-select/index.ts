import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const DEFAULT_REDIRECT = 'nhanet://facebook-connected'

Deno.serve(async (req) => {
  let redirect = DEFAULT_REDIRECT
  try {
    const url = new URL(req.url)
    const body = req.method === 'POST' ? await req.json() : null
    const state = body?.state ?? url.searchParams.get('state')
    const pageId = body?.pageId ?? url.searchParams.get('page_id')
    if (!state || !pageId) throw new Error('Thiếu thông tin chọn Page')

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: stateRow } = await admin.from('oauth_states').select('*').eq('state', state).eq('platform', 'facebook').single()
    if (!stateRow) throw new Error('Phiên kết nối đã hết hạn')
    redirect = stateRow.redirect_uri || DEFAULT_REDIRECT

    const page = (stateRow.provider_data?.pages ?? []).find((item: any) => item.id === pageId)
    if (!page?.access_token) throw new Error('Facebook Page không hợp lệ')

    const { error } = await admin.from('connected_channels').upsert({
      user_id: stateRow.user_id,
      platform: 'facebook',
      external_id: page.id,
      display_name: page.name,
      avatar_url: page.picture?.data?.url ?? null,
      access_token: page.access_token,
      connected_at: new Date().toISOString(),
    }, { onConflict: 'user_id,platform' })
    if (error) throw error
    await admin.from('oauth_states').delete().eq('state', state)

    return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${redirect}"></head><body><p>Đã kết nối Facebook Page. Bạn có thể quay lại ứng dụng.</p><script>window.location.href=${JSON.stringify(redirect)}</script></body></html>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  } catch (error) {
    return new Response(`<html><body><h1>Kết nối Facebook thất bại</h1><p>${error.message ?? String(error)}</p><p><a href="${redirect}">Quay lại ứng dụng</a></p></body></html>`, { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }
})
