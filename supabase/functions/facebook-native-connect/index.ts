import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    const { accessToken } = await req.json()
    if (!accessToken) throw new Error('Thiếu Facebook access token')

    const response = await fetch(`https://graph.facebook.com/v23.0/me/accounts?fields=id,name,access_token,picture&access_token=${encodeURIComponent(accessToken)}`)
    const result = await response.json()
    if (result.error) throw new Error(result.error.message ?? 'Không lấy được danh sách Facebook Page')
    const pages = result.data ?? []
    if (!pages.length) throw new Error('Tài khoản Facebook này chưa quản lý Page nào hoặc chưa cấp quyền Pages.')

    const state = crypto.randomUUID()
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { error } = await admin.from('oauth_states').insert({ state, user_id: user.id, platform: 'facebook', code_verifier: '', provider_data: { pages }, redirect_uri: 'nhanet://facebook-connected' })
    if (error) throw error
    return new Response(JSON.stringify({ state, pages: pages.map((page: any) => ({ id: page.id, name: page.name, avatarUrl: page.picture?.data?.url ?? null })) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('facebook-native-connect error:', error)
    return new Response(JSON.stringify({ error: error.message ?? String(error) }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
