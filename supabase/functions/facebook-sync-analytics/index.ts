import { createClient } from 'jsr:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GRAPH_VERSION = 'v23.0'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

type FacebookPost = {
  id: string
  message?: string
  created_time: string
  permalink_url?: string
  comments?: { summary?: { total_count?: number } }
  reactions?: { summary?: { total_count?: number } }
  shares?: { count?: number }
}

type FacebookComment = {
  id: string
  message?: string
  created_time: string
  like_count?: number
  comment_count?: number
  permalink_url?: string
  from?: { id?: string; name?: string }
}

async function graph(path: string, params: Record<string, string>, token: string) {
  const query = new URLSearchParams(params)
  const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${path}?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const payload = await response.json()
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? 'Facebook Graph API không phản hồi.')
  }
  return payload
}

async function graphPost(path: string, params: Record<string, string>, token: string) {
  const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
  })
  const payload = await response.json()
  if (!response.ok || payload.error) throw new Error(payload.error?.message ?? 'Facebook Graph API không phản hồi.')
  return payload
}

async function loadPublishedPosts(pageId: string, token: string) {
  const since = new Date()
  since.setDate(since.getDate() - 89)
  const posts: FacebookPost[] = []
  let after: string | undefined

  for (let page = 0; page < 3; page += 1) {
    const payload = await graph(`${pageId}/posts`, {
      fields: 'id,message,created_time,permalink_url,comments.limit(0).summary(true),reactions.limit(0).summary(true),shares',
      since: String(Math.floor(since.getTime() / 1000)),
      limit: '100',
      ...(after ? { after } : {}),
    }, token)
    posts.push(...(payload.data ?? []))
    after = payload.paging?.cursors?.after
    if (!after || !payload.paging?.next) break
  }
  return posts
}

async function loadPostViews(postId: string, token: string) {
  for (const metric of [
    'post_media_view',
    'post_video_views',
    'post_video_views_unique',
    'post_impressions',
    'post_impressions_unique',
  ]) {
    try {
      const payload = await graph(`${postId}/insights`, { metric, period: 'lifetime' }, token)
      const value = payload.data?.[0]?.values?.[0]?.value
      if (typeof value === 'number') return { value: Math.max(0, Math.round(value)), available: true }
    } catch (error) {
      console.warn(`Facebook insight ${metric} unavailable for ${postId}:`, error)
    }
  }
  return { value: 0, available: false }
}

async function loadComments(postId: string, token: string) {
  const payload = await graph(`${postId}/comments`, {
    fields: 'id,message,created_time,like_count,comment_count,permalink_url,from{id,name}',
    filter: 'stream',
    limit: '100',
  }, token)
  return (payload.data ?? []) as FacebookComment[]
}

async function loadReactionBreakdown(postId: string, token: string) {
  const result: Record<string, number> = {}
  for (const type of ['LIKE', 'LOVE', 'CARE', 'HAHA', 'WOW', 'SAD', 'ANGRY']) {
    try {
      const payload = await graph(`${postId}/reactions`, { type, limit: '0', summary: 'true' }, token)
      result[type.toLowerCase()] = Math.max(0, payload.summary?.total_count ?? 0)
    } catch (error) {
      console.warn(`Facebook reaction ${type} unavailable for ${postId}:`, error)
    }
  }
  return result
}

async function syncPageProfile(pageId: string, token: string) {
  const profile = await graph(pageId, {
    fields: 'id,name,picture{url},link,about,fan_count,followers_count,verification_status',
  }, token)
  let webhookSubscribed = false
  let webhookError: string | null = null
  try {
    await graphPost(`${pageId}/subscribed_apps`, {
      subscribed_fields: 'messages,messaging_postbacks,message_deliveries,message_reads',
    }, token)
    webhookSubscribed = true
  } catch (error) {
    webhookError = error?.message ?? String(error)
    console.warn('Facebook webhook subscription unavailable:', webhookError)
  }
  return { profile, webhookSubscribed, webhookError }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Unauthorized' }, 401)

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { data: channel } = await admin
      .from('connected_channels')
      .select('external_id, access_token')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .limit(1)
      .maybeSingle()
    if (!channel?.external_id || !channel.access_token) {
      return json({ error: 'Chưa kết nối Facebook Page.' }, 400)
    }

    const pageProfile = await syncPageProfile(channel.external_id, channel.access_token)
    const posts = await loadPublishedPosts(channel.external_id, channel.access_token)
    const postIds = posts.map((post) => post.id)
    const { data: logs } = postIds.length
      ? await admin
          .from('post_logs')
          .select('listing_id, external_post_id')
          .eq('user_id', user.id)
          .eq('platform', 'facebook')
          .in('external_post_id', postIds)
      : { data: [] }
    const listingByPost = new Map((logs ?? []).map((log) => [log.external_post_id, log.listing_id]))

    const views = new Map<string, { value: number; available: boolean }>()
    const commentsByPost = new Map<string, FacebookComment[]>()
    const reactionsByPost = new Map<string, Record<string, number>>()
    for (let index = 0; index < posts.length; index += 5) {
      const group = posts.slice(index, index + 5)
      const results = await Promise.all(group.map(async (post) => ({
        views: await loadPostViews(post.id, channel.access_token),
        comments: await loadComments(post.id, channel.access_token).catch((error) => {
          console.warn(`Facebook comments unavailable for ${post.id}:`, error)
          return []
        }),
        reactions: await loadReactionBreakdown(post.id, channel.access_token),
      })))
      group.forEach((post, resultIndex) => {
        views.set(post.id, results[resultIndex].views)
        commentsByPost.set(post.id, results[resultIndex].comments)
        reactionsByPost.set(post.id, results[resultIndex].reactions)
      })
    }

    const syncedAt = new Date().toISOString()
    const { error: profileError } = await admin.from('facebook_page_profiles').upsert({
      user_id: user.id,
      page_id: channel.external_id,
      name: pageProfile.profile.name ?? null,
      avatar_url: pageProfile.profile.picture?.data?.url ?? null,
      page_url: pageProfile.profile.link ?? null,
      about: pageProfile.profile.about ?? null,
      fan_count: pageProfile.profile.fan_count ?? null,
      followers_count: pageProfile.profile.followers_count ?? null,
      verification_status: pageProfile.profile.verification_status ?? null,
      webhook_subscribed: pageProfile.webhookSubscribed,
      webhook_error: pageProfile.webhookError,
      synced_at: syncedAt,
    })
    if (profileError) throw profileError
    const records = posts.map((post) => {
      const comments = Math.max(0, post.comments?.summary?.total_count ?? 0)
      const reactions = Math.max(0, post.reactions?.summary?.total_count ?? 0)
      const shares = Math.max(0, post.shares?.count ?? 0)
      return {
        user_id: user.id,
        listing_id: listingByPost.get(post.id) ?? null,
        platform: 'facebook',
        external_post_id: post.id,
        post_url: post.permalink_url ?? null,
        message: post.message ?? null,
        published_at: post.created_time,
        views: views.get(post.id)?.value ?? 0,
        engagements: reactions + comments + shares,
        comments,
        reactions,
        shares,
        reactions_by_type: reactionsByPost.get(post.id) ?? {},
        synced_at: syncedAt,
      }
    })

    if (records.length) {
      const { error: upsertError } = await admin
        .from('social_post_metrics')
        .upsert(records, { onConflict: 'user_id,platform,external_post_id' })
      if (upsertError) throw upsertError
      const snapshots = records.map((record) => ({
        user_id: user.id,
        platform: 'facebook',
        external_post_id: record.external_post_id,
        snapshot_date: syncedAt.slice(0, 10),
        views: record.views,
        engagements: record.engagements,
        comments: record.comments,
        reactions: record.reactions,
        shares: record.shares,
      }))
      const { error: snapshotError } = await admin
        .from('social_post_metric_snapshots')
        .upsert(snapshots, { onConflict: 'user_id,platform,external_post_id,snapshot_date' })
      if (snapshotError) throw snapshotError

      const commentRecords = posts.flatMap((post) => (commentsByPost.get(post.id) ?? []).map((comment) => ({
        user_id: user.id,
        platform: 'facebook',
        external_comment_id: comment.id,
        external_post_id: post.id,
        commenter_id: comment.from?.id ?? null,
        commenter_name: comment.from?.name ?? null,
        message: comment.message ?? null,
        like_count: Math.max(0, comment.like_count ?? 0),
        reply_count: Math.max(0, comment.comment_count ?? 0),
        comment_url: comment.permalink_url ?? null,
        commented_at: comment.created_time,
        synced_at: syncedAt,
      })))
      if (commentRecords.length) {
        const { error: commentError } = await admin
          .from('social_post_comments')
          .upsert(commentRecords, { onConflict: 'user_id,platform,external_comment_id' })
        if (commentError) throw commentError
      }
    }

    const totals = records.reduce((sum, row) => ({
      views: sum.views + row.views,
      engagements: sum.engagements + row.engagements,
      comments: sum.comments + row.comments,
    }), { views: 0, engagements: 0, comments: 0 })

    await admin.rpc('prune_expired_app_data')
    return json({
      success: true,
      syncedPosts: records.length,
      missingViews: posts.filter((post) => !views.get(post.id)?.available).length,
      totals,
      syncedAt,
      webhookSubscribed: pageProfile.webhookSubscribed,
    })
  } catch (error) {
    console.error('facebook-sync-analytics error:', error)
    if (error?.message?.includes('pages_read_user_content')) {
      return json({
        error: 'Facebook cần thêm quyền đọc nội dung Page. Vào Kênh đăng và chọn “Cấp lại quyền”, sau đó đồng bộ lại.',
        code: 'facebook_permission_required',
      }, 403)
    }
    return json({ error: error?.message ?? String(error) }, 500)
  }
})
