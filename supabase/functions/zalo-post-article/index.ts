// Supabase Edge Function: zalo-post-article
// Creates a Zalo OA Article (bài viết) using the connected OA's access token.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { getValidZaloAccessToken, fetchZaloWithRetry, isRateLimited } from '../_shared/zalo.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { title, description, coverUrl } = await req.json()
    if (!title) {
      return new Response(JSON.stringify({ error: 'Thiếu tiêu đề bài viết' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    if (await isRateLimited(supabaseAdmin, user.id, 'zalo_oa')) {
      return new Response(JSON.stringify({ error: 'Bạn đăng bài quá nhanh, vui lòng thử lại sau ít phút.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const accessToken = await getValidZaloAccessToken(supabaseAdmin, user.id, 'zalo_oa')

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Chưa kết nối Zalo OA. Vui lòng kết nối trong Cài đặt.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const payload = {
      type: 'normal',
      title,
      description: description ?? '',
      author: '',
      body: [
        description ? { type: 'text', data: { text: description } } : null,
        coverUrl ? { type: 'photo', data: { url: coverUrl } } : null,
      ].filter(Boolean),
      cover: coverUrl ? { type: 'photo', url: coverUrl } : undefined,
    }

    const { json: articleJson, status: articleStatus } = await fetchZaloWithRetry(
      'https://openapi.zalo.me/v2.0/article/create',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: accessToken,
        },
        body: JSON.stringify(payload),
      },
      (json, status) => status === 429 || status >= 500 || json?.error === -32 /* rate limited per Zalo error codes */
    )

    if (articleJson.error) {
      console.error(`zalo article create failed (http ${articleStatus}):`, JSON.stringify(articleJson))
      return new Response(
        JSON.stringify({ error: articleJson.message ?? 'Đăng bài viết Zalo OA thất bại', errorCode: articleJson.error, raw: articleJson }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(JSON.stringify({ success: true, data: articleJson }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('zalo-post-article error:', error)
    return new Response(JSON.stringify({ error: error.message ?? String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
