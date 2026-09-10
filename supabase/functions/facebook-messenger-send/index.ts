import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GRAPH_VERSION = 'v23.0'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method Not Allowed' }, 405)

  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Unauthorized' }, 401)

    const { conversationId, text } = await req.json()
    const body = typeof text === 'string' ? text.trim() : ''
    if (!conversationId || !body) return json({ error: 'Nội dung tin nhắn không hợp lệ.' }, 400)
    if (body.length > 2000) return json({ error: 'Tin nhắn tối đa 2.000 ký tự.' }, 400)

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: conversation, error: conversationError } = await admin
      .from('messenger_conversations')
      .select('id, page_id, sender_id')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()
    if (conversationError || !conversation) return json({ error: 'Không tìm thấy hội thoại.' }, 404)

    const { data: channel, error: channelError } = await admin
      .from('connected_channels')
      .select('access_token')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .eq('external_id', conversation.page_id)
      .limit(1)
      .maybeSingle()
    if (channelError || !channel?.access_token) return json({ error: 'Facebook Page chưa được kết nối.' }, 400)

    const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${conversation.page_id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: { id: conversation.sender_id }, messaging_type: 'RESPONSE', message: { text: body }, access_token: channel.access_token }),
    })
    const result = await response.json()
    if (!response.ok || result.error) {
      console.error('Messenger send failed:', JSON.stringify(result))
      return json({ error: result.error?.message ?? 'Meta không gửi được tin nhắn.' }, 400)
    }

    const sentAt = new Date().toISOString()
    const externalId = result.message_id ?? `outgoing-${crypto.randomUUID()}`
    await admin.from('messenger_messages').upsert(
      { external_id: externalId, conversation_id: conversation.id, user_id: user.id, direction: 'outgoing', body, message_type: 'text', delivery_status: 'sent', sent_at: sentAt },
      { onConflict: 'external_id', ignoreDuplicates: true },
    )
    await admin.from('messenger_conversations').update({ last_message: body, last_message_at: sentAt }).eq('id', conversation.id)
    return json({ success: true, message: { externalId, body, sentAt } })
  } catch (error) {
    console.error('facebook-messenger-send error:', error)
    return json({ error: error?.message ?? String(error) }, 500)
  }
})
