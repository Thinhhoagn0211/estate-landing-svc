// Supabase Edge Function: zalo-oa-oauth-callback
// Public endpoint — this is the redirect_uri Zalo sends the OA admin's browser back
// to after granting OA permission. Looks up the pending oauth_states row by `state`,
// exchanges the code for an OA access token, fetches the OA profile, and stores the
// connection. Shows a simple HTML confirmation page (no app auth context available here).

import { createClient } from 'jsr:@supabase/supabase-js@2'

const ZALO_APP_ID = Deno.env.get('ZALO_APP_ID')
const ZALO_APP_SECRET = Deno.env.get('ZALO_APP_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Fallback for standalone/dev-client builds when the app didn't send a redirectUri.
// Expo Go sessions always send their own exp:// URI.
const DEFAULT_APP_REDIRECT_URL = 'nhanet://zalo-connected'

function page(title: string, message: string, ok: boolean, appRedirectUrl: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  ${ok ? `<meta http-equiv="refresh" content="0;url=${appRedirectUrl}">` : ''}
  <style>
    body{font-family:-apple-system,system-ui,sans-serif;background:#faf8f4;color:#1a1712;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center}
    .card{max-width:360px}
    .icon{width:64px;height:64px;border-radius:32px;background:${ok ? '#1a8a6f' : '#c23b32'};display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:#fff;font-size:32px}
    h1{font-size:20px;margin:0 0 8px}
    p{font-size:14px;color:#6d6153;line-height:1.5}
    a.btn{display:inline-block;margin-top:20px;background:#1a8a6f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;font-size:15px}
  </style>
  ${ok ? `<script>window.location.href=${JSON.stringify(appRedirectUrl)};</script>` : ''}
  </head>
  <body><div class="card"><div class="icon">${ok ? '✓' : '✕'}</div><h1>${title}</h1><p>${message}</p>${
    ok ? `<a class="btn" href="${appRedirectUrl}">Quay lại ứng dụng</a>` : ''
  }</div></body></html>`
}

Deno.serve(async (req) => {
  let appRedirectUrl = DEFAULT_APP_REDIRECT_URL
  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (!code || !state) {
      return new Response(page('Thiếu thông tin', 'Không nhận được mã xác thực từ Zalo.', false, appRedirectUrl), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: stateRow, error: stateError } = await supabaseAdmin
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .single()

    if (stateError || !stateRow) {
      return new Response(page('Liên kết đã hết hạn', 'Vui lòng thử kết nối lại từ ứng dụng.', false, appRedirectUrl), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    appRedirectUrl = stateRow.redirect_uri || DEFAULT_APP_REDIRECT_URL

    const tokenRes = await fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        secret_key: ZALO_APP_SECRET,
      },
      body: new URLSearchParams({
        app_id: ZALO_APP_ID,
        code,
        grant_type: 'authorization_code',
        code_verifier: stateRow.code_verifier,
      }),
    })
    const tokenJson = await tokenRes.json()
    if (!tokenJson.access_token) {
      console.error('zalo oa token exchange failed:', JSON.stringify(tokenJson))
      throw new Error(tokenJson.error_description ?? 'Zalo OA token exchange failed')
    }

    const oaRes = await fetch('https://openapi.zalo.me/v2.0/oa/getoa', {
      headers: { access_token: tokenJson.access_token },
    })
    const oaJson = await oaRes.json()
    const oaInfo = oaJson.data ?? {}

    const { error: upsertError } = await supabaseAdmin.from('connected_channels').upsert(
      {
        user_id: stateRow.user_id,
        platform: 'zalo_oa',
        external_id: oaInfo.oa_id ?? null,
        display_name: oaInfo.name ?? null,
        avatar_url: oaInfo.avatar ?? null,
        access_token: tokenJson.access_token,
        refresh_token: tokenJson.refresh_token ?? null,
        token_expires_at: tokenJson.expires_in ? new Date(Date.now() + Number(tokenJson.expires_in) * 1000).toISOString() : null,
        connected_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,platform' }
    )
    if (upsertError) throw upsertError

    await supabaseAdmin.from('oauth_states').delete().eq('state', state)

    return new Response(page('Kết nối Zalo OA thành công!', `Đã kết nối OA ${oaInfo.name ?? ''}. Bạn có thể quay lại ứng dụng.`, true, appRedirectUrl), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (error) {
    console.error('zalo-oa-oauth-callback error:', error)
    return new Response(page('Kết nối thất bại', String(error.message ?? error), false, appRedirectUrl), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
})
