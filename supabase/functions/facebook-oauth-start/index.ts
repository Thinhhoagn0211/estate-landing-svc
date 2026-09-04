import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FACEBOOK_APP_ID = Deno.env.get('FACEBOOK_APP_ID')!
const FACEBOOK_CONFIG_ID = Deno.env.get('FACEBOOK_CONFIG_ID')!
const CALLBACK_URL = `${SUPABASE_URL}/functions/v1/facebook-oauth-callback`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    let appRedirectUri = 'nhanet://facebook-connected'
    try {
      const body = await req.json()
      if (typeof body?.redirectUri === 'string') appRedirectUri = body.redirectUri
    } catch { /* use standalone fallback */ }

    const state = crypto.randomUUID()
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { error } = await admin.from('oauth_states').insert({
      state,
      user_id: user.id,
      platform: 'facebook',
      code_verifier: '',
      redirect_uri: appRedirectUri,
    })
    if (error) throw error

    const params = new URLSearchParams({
      client_id: FACEBOOK_APP_ID,
      redirect_uri: CALLBACK_URL,
      state,
      response_type: 'code',
      config_id: FACEBOOK_CONFIG_ID,
    })
    const authUrl = `https://www.facebook.com/dialog/oauth?${params.toString()}`
    return new Response(JSON.stringify({ authUrl }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('facebook-oauth-start error:', error)
    return new Response(JSON.stringify({ error: error.message ?? String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
