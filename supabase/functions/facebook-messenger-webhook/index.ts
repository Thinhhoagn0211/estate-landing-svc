import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const META_APP_SECRET = Deno.env.get('FACEBOOK_APP_SECRET')!
const VERIFY_TOKEN = Deno.env.get('META_MESSENGER_VERIFY_TOKEN')!
const GRAPH_VERSION = 'v23.0'

function response(body: string, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}

async function validSignature(rawBody: string, signature: string | null) {
  if (!signature?.startsWith('sha256=')) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(META_APP_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody))
  const expected = `sha256=${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')}`
  if (expected.length !== signature.length) return false
  let difference = 0
  for (let index = 0; index < expected.length; index += 1) difference |= expected.charCodeAt(index) ^ signature.charCodeAt(index)
  return difference === 0
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    return mode === 'subscribe' && token === VERIFY_TOKEN && challenge ? response(challenge) : response('Forbidden', 403)
  }
  if (req.method !== 'POST') return response('Method Not Allowed', 405)

  const rawBody = await req.text()
  if (!(await validSignature(rawBody, req.headers.get('x-hub-signature-256')))) return response('Invalid signature', 403)

  try {
    const payload = JSON.parse(rawBody)
    if (payload.object !== 'page') return response('Ignored')
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    for (const entry of payload.entry ?? []) {
      const pageId = String(entry.id ?? '')
      const { data: channel } = await admin.from('connected_channels').select('user_id, access_token').eq('platform', 'facebook').eq('external_id', pageId).maybeSingle()
      if (!channel?.access_token) continue
      const { data: setting } = await admin.from('messenger_auto_replies').select('enabled, reply_text').eq('user_id', channel.user_id).maybeSingle()
      if (!setting?.enabled || !setting.reply_text) continue

      for (const event of entry.messaging ?? []) {
        const messageId = event.message?.mid
        const senderId = event.sender?.id
        if (!messageId || !senderId || event.message?.is_echo) continue
        const { error: claimError } = await admin.from('messenger_auto_reply_events').insert({ message_id: messageId, user_id: channel.user_id, page_id: pageId, sender_id: senderId })
        if (claimError) continue // Meta can retry deliveries; reply once per message ID.

        const sendResponse = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipient: { id: senderId }, messaging_type: 'RESPONSE', message: { text: setting.reply_text }, access_token: channel.access_token }),
        })
        if (!sendResponse.ok) console.error('Messenger auto-reply failed:', await sendResponse.text())
      }
    }
  } catch (error) {
    console.error('facebook-messenger-webhook error:', error)
  }
  return response('EVENT_RECEIVED')
})
