import { createClient } from 'jsr:@supabase/supabase-js@2'
const URL = Deno.env.get('SUPABASE_URL')!, ANON = Deno.env.get('SUPABASE_ANON_KEY')!, SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const pathOf = (url: string) => { const marker = '/listing-photos/'; const index = url.indexOf(marker); return index < 0 ? null : decodeURIComponent(url.slice(index + marker.length).split('?')[0]) }
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const client = createClient(URL, ANON, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } })
    const { data: { user } } = await client.auth.getUser()
    if (!user) return json({ error: 'Unauthorized' }, 401)
    const { listingId } = await req.json()
    const admin = createClient(URL, SERVICE)
    const { data: listing } = await admin.from('listings').select('id,photo_urls').eq('id', listingId).eq('user_id', user.id).maybeSingle()
    if (!listing) return json({ error: 'Không tìm thấy bất động sản.' }, 404)
    const paths = (listing.photo_urls ?? []).map(pathOf).filter(Boolean)
    if (paths.length) { const { error } = await admin.storage.from('listing-photos').remove(paths); if (error) throw error }
    const { error } = await admin.from('listings').delete().eq('id', listing.id).eq('user_id', user.id)
    if (error) throw error
    return json({ success: true })
  } catch (error) { return json({ error: error?.message ?? String(error) }, 500) }
})
