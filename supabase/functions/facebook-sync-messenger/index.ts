import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GRAPH_VERSION = 'v23.0'
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

async function getSenderProfile(senderId: string, accessToken: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(senderId)}?fields=name,first_name,last_name,profile_pic`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const profile = await response.json()
    if (!response.ok || profile.error) return null
    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim()
    return {
      name: typeof profile.name === 'string' ? profile.name : fullName || null,
      avatarUrl: typeof profile.profile_pic === 'string' ? profile.profile_pic : null,
    }
  } catch {
    return null
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Unauthorized' }, 401)
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: channel } = await admin.from('connected_channels').select('external_id,access_token').eq('user_id', user.id).eq('platform', 'facebook').maybeSingle()
    if (!channel?.external_id || !channel.access_token) return json({ error: 'Chưa kết nối Facebook Page.' }, 400)

    const query = new URLSearchParams({
      fields: 'id,updated_time,messages.limit(100){id,message,created_time,from{id,name},attachments}',
      limit: '50',
    })
    const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${channel.external_id}/conversations?${query}`, { headers: { Authorization: `Bearer ${channel.access_token}` } })
    const payload = await response.json()
    if (!response.ok || payload.error) return json({ error: payload.error?.message ?? 'Facebook không tải được hội thoại cũ.' }, 400)

    let conversations = 0
    let messages = 0
    const profiles = new Map<string, { name: string | null, avatarUrl: string | null } | null>()
    for (const item of payload.data ?? []) {
      const rows = item.messages?.data ?? []
      const foreign = rows.find((message: any) => message.from?.id && message.from.id !== channel.external_id)?.from
      if (!foreign?.id) continue
      const senderId = String(foreign.id)
      let senderName = typeof foreign.name === 'string' && foreign.name.trim() ? foreign.name.trim() : null
      if (!profiles.has(senderId)) profiles.set(senderId, await getSenderProfile(senderId, channel.access_token))
      const senderProfile = profiles.get(senderId)
      senderName = senderName ?? senderProfile?.name ?? null
      const last = rows[0] ?? {}
      const { data: conversation, error: conversationError } = await admin.from('messenger_conversations')
        .upsert({
          user_id: user.id,
          page_id: channel.external_id,
          sender_id: senderId,
          external_conversation_id: String(item.id),
          sender_name: senderName,
          sender_avatar_url: senderProfile?.avatarUrl ?? null,
          last_message: String(last.message ?? '[Tin nhắn đính kèm]'),
          last_message_at: last.created_time ?? item.updated_time ?? new Date().toISOString(),
          synced_at: new Date().toISOString(),
        }, { onConflict: 'user_id,page_id,sender_id' })
        .select('id')
        .single()
      if (conversationError || !conversation) continue
      conversations += 1
      const records = rows.map((message: any) => {
        const attachment = message.attachments?.data?.[0]
        const attachmentUrl = attachment?.image_data?.url ?? attachment?.file_url ?? attachment?.video_data?.url ?? null
        return {
          external_id: String(message.id),
          conversation_id: conversation.id,
          user_id: user.id,
          direction: message.from?.id === channel.external_id ? 'outgoing' : 'incoming',
          body: String(message.message ?? '[Tin nhắn đính kèm]'),
          message_type: attachment?.mime_type?.startsWith('image/') ? 'image' : attachment ? 'attachment' : 'text',
          attachment_url: attachmentUrl,
          attachment_name: attachment?.name ?? null,
          metadata: { attachment_type: attachment?.mime_type ?? null },
          sent_at: message.created_time ?? new Date().toISOString(),
        }
      })
      if (records.length) {
        const { error } = await admin.from('messenger_messages').upsert(records, { onConflict: 'external_id', ignoreDuplicates: true })
        if (!error) messages += records.length
      }
    }
    await admin.rpc('prune_expired_app_data')
    return json({ success: true, conversations, messages })
  } catch (error) {
    console.error('facebook-sync-messenger error:', error)
    return json({ error: error?.message ?? String(error) }, 500)
  }
})
