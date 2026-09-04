import http from 'node:http'
import process from 'node:process'
import fs from 'node:fs'

function loadDotEnv(path = new URL('./.env.local', import.meta.url)) {
  try {
    const text = fs.readFileSync(path, 'utf8')
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '')
    }
  } catch {}
}

loadDotEnv()

const PORT = Number(process.env.PORT || 8787)
const ZALO_APP_ID = process.env.ZALO_APP_ID
const ZALO_APP_SECRET = process.env.ZALO_APP_SECRET
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DEFAULT_APP_REDIRECT_URL = process.env.APP_REDIRECT_URL || 'nhanet://zalo-connected'

function required(name, value) {
  if (!value) throw new Error(`Missing ${name}. Copy it into local-zalo-relay/.env.local.`)
}

function html(title, message, ok, redirectUrl = DEFAULT_APP_REDIRECT_URL) {
  const safeRedirect = JSON.stringify(redirectUrl)
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${ok ? `<script>window.location.href=${safeRedirect}</script>` : ''}<style>body{font-family:system-ui,sans-serif;padding:40px;text-align:center;color:#211}h1{font-size:22px}p{line-height:1.5;color:#665}</style></head><body><h1>${ok ? 'Kết nối Zalo thành công' : 'Kết nối Zalo thất bại'}</h1><p>${message}</p>${ok ? `<p>Nếu app chưa tự mở, <a href="${redirectUrl}">bấm vào đây để quay lại</a>.</p>` : ''}</body></html>`
}

async function supabase(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  const text = await response.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`)
  return data
}

async function callback(url) {
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (!code || !state) return html('Thiếu thông tin', 'Zalo không trả về code/state.', false)

  const rows = await supabase(`oauth_states?state=eq.${encodeURIComponent(state)}&platform=eq.zalo&select=*`)
  const stateRow = rows?.[0]
  if (!stateRow) return html('Liên kết đã hết hạn', 'Vui lòng thử kết nối lại từ app.', false)
  const appRedirectUrl = stateRow.redirect_uri || DEFAULT_APP_REDIRECT_URL

  const tokenResponse = await fetch('https://oauth.zaloapp.com/v4/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', secret_key: ZALO_APP_SECRET },
    body: new URLSearchParams({
      app_id: ZALO_APP_ID,
      code,
      grant_type: 'authorization_code',
      code_verifier: stateRow.code_verifier,
    }),
  })
  const token = await tokenResponse.json()
  if (!token.access_token) throw new Error(token.error_description || token.message || `Zalo token error ${token.error || tokenResponse.status}`)

  const profileResponse = await fetch('https://graph.zalo.me/v2.0/me?fields=id,name,picture', {
    headers: { access_token: token.access_token },
  })
  const profile = await profileResponse.json()
  if (!profileResponse.ok || !profile.id) throw new Error(profile.message || profile.error_description || 'Không lấy được profile Zalo')

  await supabase('connected_channels?on_conflict=user_id%2Cplatform', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      user_id: stateRow.user_id,
      platform: 'zalo',
      external_id: profile.id,
      display_name: profile.name,
      avatar_url: profile.picture?.data?.url || null,
      access_token: token.access_token,
      refresh_token: token.refresh_token || null,
      token_expires_at: token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000).toISOString() : null,
      connected_at: new Date().toISOString(),
    }),
  })
  await supabase(`oauth_states?state=eq.${encodeURIComponent(state)}`, { method: 'DELETE' })
  return html('Kết nối thành công', `Đã kết nối ${profile.name || 'tài khoản Zalo'}.`, true, appRedirectUrl)
}

const server = http.createServer(async (request, response) => {
  if (request.url?.startsWith('/health')) {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ ok: true, service: 'local-zalo-relay' }))
    return
  }
  if (!request.url?.startsWith('/zalo-callback')) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
    return
  }
  try {
    required('ZALO_APP_ID', ZALO_APP_ID)
    required('ZALO_APP_SECRET', ZALO_APP_SECRET)
    required('SUPABASE_URL', SUPABASE_URL)
    required('SUPABASE_SERVICE_ROLE_KEY', SUPABASE_SERVICE_ROLE_KEY)
    const result = await callback(new URL(request.url, `http://${request.headers.host}`))
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    response.end(result)
  } catch (error) {
    console.error('[local-zalo-relay]', error)
    response.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
    response.end(html('Kết nối thất bại', error.message || String(error), false))
  }
})

server.listen(PORT, '127.0.0.1', () => console.log(`Local Zalo relay listening on http://127.0.0.1:${PORT}`))
