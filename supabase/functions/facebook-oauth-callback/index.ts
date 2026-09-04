import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FACEBOOK_APP_ID = Deno.env.get('FACEBOOK_APP_ID')!
const FACEBOOK_APP_SECRET = Deno.env.get('FACEBOOK_APP_SECRET')!
const CALLBACK_URL = `${SUPABASE_URL}/functions/v1/facebook-oauth-callback`
const DEFAULT_REDIRECT = 'nhanet://facebook-connected'

const html = (title: string, message: string, redirect?: string, links = '') => `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui;background:#faf8f4;color:#1a1712;display:flex;justify-content:center;min-height:100vh;margin:0;padding:24px}.card{max-width:440px;width:100%;margin-top:10vh}h1{font-size:22px}p{color:#6d6153;line-height:1.5}.page{display:block;background:#1877f2;color:#fff;text-decoration:none;padding:13px 16px;border-radius:10px;margin:10px 0;font-weight:600}</style></head><body><main class="card"><h1>${title}</h1><p>${message}</p>${links}${redirect ? `<p><a href="${redirect}">Quay lại ứng dụng</a></p><script>window.location.href=${JSON.stringify(redirect)}</script>` : ''}</main></body></html>`

const escapeHtml = (value: string) => value.replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c] ?? c))

Deno.serve(async (req) => {
  let redirect = DEFAULT_REDIRECT
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    if (!code || !state) return new Response(html('Facebook chưa cấp quyền', 'Không nhận được mã xác thực. Vui lòng thử kết nối lại.'), { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } })

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: stateRow } = await admin.from('oauth_states').select('*').eq('state', state).eq('platform', 'facebook').single()
    if (!stateRow) return new Response(html('Liên kết đã hết hạn', 'Vui lòng bắt đầu lại từ ứng dụng.'), { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    redirect = stateRow.redirect_uri || DEFAULT_REDIRECT

    const tokenParams = new URLSearchParams({ client_id: FACEBOOK_APP_ID, client_secret: FACEBOOK_APP_SECRET, redirect_uri: CALLBACK_URL, code })
    const tokenRes = await fetch(`https://graph.facebook.com/v23.0/oauth/access_token?${tokenParams}`)
    const token = await tokenRes.json()
    if (!token.access_token) throw new Error(token.error?.message ?? 'Facebook token exchange failed')

    const pagesRes = await fetch(`https://graph.facebook.com/v23.0/me/accounts?fields=id,name,access_token,picture&access_token=${encodeURIComponent(token.access_token)}`)
    const pagesJson = await pagesRes.json()
    if (pagesJson.error) throw new Error(pagesJson.error.message ?? 'Không lấy được danh sách Facebook Page')
    const pages = pagesJson.data ?? []
    if (!pages.length) throw new Error('Tài khoản Facebook này chưa quản lý Page nào hoặc chưa cấp quyền Pages.')

    await admin.from('oauth_states').update({ provider_data: { pages } }).eq('state', state)
    const links = pages.map((page: any) => `<a class="page" href="${SUPABASE_URL}/functions/v1/facebook-oauth-select?state=${encodeURIComponent(state)}&page_id=${encodeURIComponent(page.id)}">${escapeHtml(page.name ?? 'Facebook Page')}</a>`).join('')
    return new Response(html('Chọn Facebook Page', 'Chọn Page mà Upload Post được phép đăng bài:', undefined, links), { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  } catch (error) {
    console.error('facebook-oauth-callback error:', error)
    return new Response(html('Kết nối Facebook thất bại', error.message ?? String(error)), { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }
})
