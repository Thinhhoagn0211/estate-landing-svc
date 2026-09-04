// Supabase Edge Function: zalo-oa-oauth-start
// Prepares the OA-admin authorization flow (distinct from personal Zalo login):
// generates PKCE + state, stores them, and returns the OA authorize URL.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const ZALO_APP_ID = Deno.env.get('ZALO_APP_ID')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// This is the callback URI currently registered in the Zalo app.
// The Vercel route forwards it to the OA callback Edge Function.
const CALLBACK_URL = 'https://zalo-verify-site.vercel.app/zalo-callback'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function base64UrlEncode(bytes: Uint8Array) {
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function makePkcePair() {
  const verifierBytes = new Uint8Array(32)
  crypto.getRandomValues(verifierBytes)
  const codeVerifier = base64UrlEncode(verifierBytes)
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
  const codeChallenge = base64UrlEncode(new Uint8Array(digest))
  return { codeVerifier, codeChallenge }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
    } = await supabaseUser.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const state = crypto.randomUUID()
    const { codeVerifier, codeChallenge } = await makePkcePair()

    // The app passes back its own redirect URI (via expo-linking's Linking.createURL),
    // which differs between Expo Go (exp://...) and standalone/dev-client builds
    // (nhanet://...). We store it here so zalo-oa-oauth-callback can bounce back to
    // whichever one actually launched this flow.
    let appRedirectUri: string | null = null
    try {
      const body = await req.json()
      appRedirectUri = typeof body?.redirectUri === 'string' ? body.redirectUri : null
    } catch {
      // no body sent — fall back to the default in zalo-oa-oauth-callback
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { error } = await supabaseAdmin.from('oauth_states').insert({
      state,
      user_id: user.id,
      platform: 'zalo_oa',
      code_verifier: codeVerifier,
      redirect_uri: appRedirectUri,
    })
    if (error) throw error

    const authUrl =
      `https://oauth.zaloapp.com/v4/oa/permission?app_id=${ZALO_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(CALLBACK_URL)}` +
      `&code_challenge=${codeChallenge}` +
      `&code_challenge_method=S256` +
      `&state=${state}`

    return new Response(JSON.stringify({ authUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('zalo-oa-oauth-start error:', error)
    return new Response(JSON.stringify({ error: error.message ?? String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
