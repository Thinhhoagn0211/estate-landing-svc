// Shared helper: returns a valid (non-expired) Zalo access token for a user,
// refreshing it via Zalo's refresh_token grant if it has expired or is close to it.
// Works for both the personal-login platform ('zalo') and the OA-admin
// platform ('zalo_oa'), which use slightly different refresh endpoints.

const ZALO_APP_ID = Deno.env.get('ZALO_APP_ID')
const ZALO_APP_SECRET = Deno.env.get('ZALO_APP_SECRET')

const REFRESH_ENDPOINTS: Record<string, string> = {
  zalo: 'https://oauth.zaloapp.com/v4/access_token',
  zalo_oa: 'https://oauth.zaloapp.com/v4/oa/access_token',
}

export async function getValidZaloAccessToken(supabaseAdmin: any, userId: string, platform: 'zalo' | 'zalo_oa' = 'zalo'): Promise<string | null> {
  const { data: conn } = await supabaseAdmin
    .from('connected_channels')
    .select('access_token, refresh_token, token_expires_at')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single()

  if (!conn?.access_token) return null

  const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0
  const isExpiringSoon = !expiresAt || expiresAt < Date.now() + 60_000 // refresh if expired or expiring within 60s

  if (!isExpiringSoon) return conn.access_token
  if (!conn.refresh_token) return conn.access_token // nothing we can do, let the caller's API call fail with a clear error

  const refreshRes = await fetch(REFRESH_ENDPOINTS[platform], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      secret_key: ZALO_APP_SECRET,
    },
    body: new URLSearchParams({
      app_id: ZALO_APP_ID,
      grant_type: 'refresh_token',
      refresh_token: conn.refresh_token,
    }),
  })
  const refreshJson = await refreshRes.json()
  if (!refreshJson.access_token) {
    console.error(`zalo (${platform}) token refresh failed:`, JSON.stringify(refreshJson))
    return conn.access_token // fall back to the old (likely still invalid) token; caller's API call will surface the real error
  }

  await supabaseAdmin
    .from('connected_channels')
    .update({
      access_token: refreshJson.access_token,
      refresh_token: refreshJson.refresh_token ?? conn.refresh_token,
      token_expires_at: refreshJson.expires_in ? new Date(Date.now() + Number(refreshJson.expires_in) * 1000).toISOString() : null,
    })
    .eq('user_id', userId)
    .eq('platform', platform)

  return refreshJson.access_token
}

// Retries a Zalo API call with exponential backoff on 429 (rate limited) and
// 5xx (transient) responses. Zalo error responses come back as HTTP 200 with an
// `error` field in the body, so callers pass a predicate to detect those too.
export async function fetchZaloWithRetry(
  url: string,
  init: RequestInit,
  isRetryable: (json: any, status: number) => boolean,
  maxAttempts = 3
): Promise<{ json: any; status: number }> {
  let lastResult: { json: any; status: number } | null = null
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(url, init)
    const json = await res.json()
    lastResult = { json, status: res.status }
    if (!isRetryable(json, res.status)) return lastResult
    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt))
    }
  }
  return lastResult!
}

// Best-effort per-user rate limit backed by post_logs — allows at most `limit`
// posts per platform within `windowMs`. Not a true distributed limiter, but
// enough to stop a runaway client loop from hammering Zalo's API.
export async function isRateLimited(
  supabaseAdmin: any,
  userId: string,
  platform: string,
  limit = 5,
  windowMs = 60_000
): Promise<boolean> {
  const since = new Date(Date.now() - windowMs).toISOString()
  const { count } = await supabaseAdmin
    .from('post_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('platform', platform)
    .gte('created_at', since)
  return (count ?? 0) >= limit
}
