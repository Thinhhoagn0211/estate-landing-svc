import { useCallback, useMemo, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { colors, fonts, radius, shadow } from '../theme/tokens'

const PERIODS = [
  { key: 'hour', label: 'Giờ', count: 24 },
  { key: 'day', label: 'Ngày', count: 7 },
  { key: 'month', label: 'Tháng', count: 12 },
  { key: 'year', label: 'Năm', count: 5 },
]

const METRICS = [
  { key: 'views', label: 'Lượt xem', icon: 'eye-outline', color: '#1877f2' },
  { key: 'engagements', label: 'Tương tác', icon: 'heart-outline', color: colors.jade[600] },
  { key: 'comments', label: 'Bình luận', icon: 'chatbubble-outline', color: colors.amber[700] },
]

const formatNumber = (value) =>
  new Intl.NumberFormat('vi-VN', {
    notation: value >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value)

function floorDate(date, period) {
  const result = new Date(date)
  if (period === 'hour') result.setMinutes(0, 0, 0)
  if (period === 'day') result.setHours(0, 0, 0, 0)
  if (period === 'month') { result.setDate(1); result.setHours(0, 0, 0, 0) }
  if (period === 'year') { result.setMonth(0, 1); result.setHours(0, 0, 0, 0) }
  return result
}

function shift(date, period, amount) {
  const result = new Date(date)
  if (period === 'hour') result.setHours(result.getHours() + amount)
  if (period === 'day') result.setDate(result.getDate() + amount)
  if (period === 'month') result.setMonth(result.getMonth() + amount)
  if (period === 'year') result.setFullYear(result.getFullYear() + amount)
  return result
}

function dateKey(date, period) {
  const d = floorDate(date, period)
  if (period === 'hour') return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}-${d.getHours()}`
  if (period === 'day') return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  if (period === 'month') return `${d.getFullYear()}-${d.getMonth()}`
  return String(d.getFullYear())
}

function dateLabel(date, period) {
  if (period === 'hour') return `${String(date.getHours()).padStart(2, '0')}h`
  if (period === 'day') return `${date.getDate()}/${date.getMonth() + 1}`
  if (period === 'month') return `T${date.getMonth() + 1}`
  return String(date.getFullYear())
}

function createBuckets(period) {
  const config = PERIODS.find((item) => item.key === period)
  const latest = floorDate(new Date(), period)
  return Array.from({ length: config.count }, (_, index) => {
    const date = shift(latest, period, index - config.count + 1)
    return { key: dateKey(date, period), label: dateLabel(date, period), value: 0 }
  })
}

async function functionErrorMessage(error) {
  try {
    const payload = await error?.context?.clone?.().json()
    if (payload?.error) return payload.error
  } catch {}
  return error?.message || 'Không thể đồng bộ Facebook.'
}

export default function Analytics({ navigation }) {
  const { user } = useAuth()
  const [period, setPeriod] = useState('day')
  const [activeMetric, setActiveMetric] = useState('views')
  const [posts, setPosts] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [recentComments, setRecentComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [syncInfo, setSyncInfo] = useState(null)

  const readPosts = useCallback(async () => {
    const { data, error: requestError } = await supabase
      .from('social_post_metrics')
      .select('external_post_id, post_url, message, published_at, views, engagements, comments, reactions, shares, reactions_by_type, synced_at')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .order('published_at', { ascending: false })
    if (requestError) throw requestError
    return data ?? []
  }, [user])

  const readComments = useCallback(async () => {
    const { data, error: requestError } = await supabase
      .from('social_post_comments')
      .select('external_comment_id, external_post_id, commenter_name, message, like_count, reply_count, comment_url, commented_at')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .order('commented_at', { ascending: false })
      .limit(10)
    if (requestError) throw requestError
    return data ?? []
  }, [user])

  const readSnapshots = useCallback(async () => {
    const { data, error: requestError } = await supabase
      .from('social_post_metric_snapshots')
      .select('external_post_id, snapshot_date, views, engagements, comments, reactions, shares')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .order('snapshot_date', { ascending: true })
    if (requestError) throw requestError
    return data ?? []
  }, [user])

  const refresh = useCallback(async (forceSync = false) => {
    if (!user) return
    setError(null)
    setLoading(true)
    try {
      let rows = await readPosts()
      setRecentComments(await readComments())
      setSnapshots(await readSnapshots())
      setPosts(rows)
      const lastSync = rows.reduce((latest, row) => Math.max(latest, new Date(row.synced_at).getTime()), 0)
      const stale = !lastSync || Date.now() - lastSync > 15 * 60 * 1000

      if (forceSync || stale) {
        setSyncing(true)
        const { data, error: syncError } = await supabase.functions.invoke('facebook-sync-analytics')
        if (syncError || data?.error) throw new Error(data?.error || await functionErrorMessage(syncError))
        setSyncInfo(data)
        rows = await readPosts()
        setRecentComments(await readComments())
        setSnapshots(await readSnapshots())
      }
      setPosts(rows)
    } catch (refreshError) {
      setError(refreshError.message || 'Chưa thể tải dữ liệu hiệu quả.')
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [readComments, readPosts, readSnapshots, user])

  useFocusEffect(useCallback(() => { refresh(false) }, [refresh]))

  const overview = useMemo(() => {
    const chart = createBuckets(period)
    const chartMap = new Map(chart.map((item) => [item.key, { ...item }]))
    const total = { views: 0, engagements: 0, comments: 0, reactions: 0, shares: 0 }

    posts.forEach((post) => {
      total.views += post.views || 0
      total.engagements += post.engagements || 0
      total.comments += post.comments || 0
      total.reactions += post.reactions || 0
      total.shares += post.shares || 0
    })
    const chartSource = snapshots.length ? snapshots : posts
    chartSource.forEach((item) => {
      const observedAt = item.snapshot_date || item.published_at
      const bucket = chartMap.get(dateKey(new Date(observedAt), period))
      if (bucket) bucket.value += item[activeMetric] || 0
    })

    return {
      chart: [...chartMap.values()],
      total,
      topPosts: [...posts].sort((a, b) => (b[activeMetric] || 0) - (a[activeMetric] || 0)).slice(0, 5),
    }
  }, [activeMetric, period, posts, snapshots])

  const selectedMetric = METRICS.find((item) => item.key === activeMetric)
  const max = Math.max(...overview.chart.map((item) => item.value), 1)
  const periodLabel = PERIODS.find((item) => item.key === period)?.label.toLowerCase()
  const lastSyncedAt = posts.reduce((latest, post) =>
    !latest || new Date(post.synced_at) > new Date(latest) ? post.synced_at : latest, null)

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.head}>
        <Pressable style={styles.circleButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.sand[700]} />
        </Pressable>
        <View>
          <Text style={styles.title}>Hiệu quả</Text>
          <Text style={styles.subtitle}>
            {lastSyncedAt ? `Cập nhật ${new Date(lastSyncedAt).toLocaleString('vi-VN')}` : 'Facebook Page'}
          </Text>
        </View>
        <Pressable style={styles.circleButton} onPress={() => refresh(true)} accessibilityLabel="Đồng bộ Facebook">
          {syncing
            ? <ActivityIndicator size="small" color={colors.jade[600]} />
            : <Ionicons name="sync" size={18} color={colors.sand[700]} />}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.periods}>
          {PERIODS.map((item) => (
            <Pressable key={item.key} onPress={() => setPeriod(item.key)} style={[styles.period, period === item.key && styles.periodActive]}>
              <Text style={[styles.periodText, period === item.key && styles.periodTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.description}>{snapshots.length ? `Diễn biến chỉ số theo ${periodLabel} đồng bộ` : `Chỉ số hiện tại của các bài đăng theo ${periodLabel} đăng bài`}</Text>

        <View style={styles.metricGrid}>
          {METRICS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setActiveMetric(item.key)}
              style={[styles.metricCard, activeMetric === item.key && { borderColor: item.color }]}
            >
              <View style={[styles.metricIcon, { backgroundColor: `${item.color}18` }]}>
                <Ionicons name={item.icon} size={17} color={item.color} />
              </View>
              <Text style={styles.metricNumber}>{formatNumber(overview.total[item.key])}</Text>
              <Text style={styles.metricLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View>
              <Text style={styles.cardTitle}>Xu hướng {selectedMetric.label.toLowerCase()}</Text>
              <Text style={styles.cardSub}>Nhấn một chỉ số phía trên để đổi biểu đồ</Text>
            </View>
            {loading && <ActivityIndicator size="small" color={selectedMetric.color} />}
          </View>
          <View style={styles.bars}>
            {overview.chart.map((item) => (
              <View key={item.key} style={styles.barColumn}>
                <View style={styles.track}>
                  <View style={[styles.bar, {
                    backgroundColor: selectedMetric.color,
                    height: `${item.value ? Math.max((item.value / max) * 100, 3) : 0}%`,
                  }]} />
                </View>
                <Text style={styles.barLabel} numberOfLines={1}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {!!overview.topPosts.length && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bài đăng nổi bật</Text>
            <Text style={styles.cardSub}>Xếp theo {selectedMetric.label.toLowerCase()}</Text>
            <View style={styles.postList}>
              {overview.topPosts.map((post, index) => (
                <Pressable
                  key={post.external_post_id}
                  disabled={!post.post_url}
                  onPress={() => Linking.openURL(post.post_url)}
                  style={styles.postRow}
                >
                  <View style={styles.rank}><Text style={styles.rankText}>{index + 1}</Text></View>
                  <View style={styles.postBody}>
                    <Text style={styles.postTitle} numberOfLines={2}>{post.message || 'Bài đăng Facebook'}</Text>
                    <Text style={styles.postDate}>{new Date(post.published_at).toLocaleDateString('vi-VN')}</Text>
                  </View>
                  <View style={styles.postValue}>
                    <Text style={[styles.postNumber, { color: selectedMetric.color }]}>{formatNumber(post[activeMetric] || 0)}</Text>
                    <Text style={styles.postMetric}>{selectedMetric.label}</Text>
                  </View>
                  {!!post.post_url && <Ionicons name="open-outline" size={15} color={colors.sand[400]} />}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {!!recentComments.length && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bình luận mới</Text>
            <Text style={styles.cardSub}>{formatNumber(overview.total.reactions)} cảm xúc · {formatNumber(overview.total.shares)} lượt chia sẻ</Text>
            <View style={styles.commentList}>
              {recentComments.map((comment) => (
                <Pressable key={comment.external_comment_id} disabled={!comment.comment_url} onPress={() => Linking.openURL(comment.comment_url)} style={styles.commentRow}>
                  <View style={styles.commentAvatar}><Text style={styles.commentAvatarText}>{(comment.commenter_name || '?').slice(0, 1).toUpperCase()}</Text></View>
                  <View style={styles.commentBody}>
                    <Text style={styles.commentName}>{comment.commenter_name || 'Khách Facebook'}</Text>
                    <Text style={styles.commentText} numberOfLines={2}>{comment.message || 'Đã để lại một bình luận'}</Text>
                    <Text style={styles.commentMeta}>{new Date(comment.commented_at).toLocaleString('vi-VN')} · {comment.like_count || 0} thích</Text>
                  </View>
                  {!!comment.comment_url && <Ionicons name="open-outline" size={14} color={colors.sand[400]} />}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {!loading && posts.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="analytics-outline" size={22} color={colors.sand[500]} />
            <View style={styles.emptyBody}>
              <Text style={styles.emptyTitle}>Chưa có dữ liệu bài đăng</Text>
              <Text style={styles.emptyText}>Kết nối Facebook Page rồi nhấn đồng bộ để lấy lượt xem, tương tác và bình luận.</Text>
            </View>
          </View>
        )}
        {!!syncInfo?.missingViews && (
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={18} color={colors.amber[700]} />
            <Text style={styles.noticeText}>
              {syncInfo.missingViews} bài chưa được Facebook trả về lượt xem; tương tác và bình luận vẫn đã đồng bộ.
            </Text>
          </View>
        )}
        {!!error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand[50] },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4 },
  circleButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow.e1 },
  title: { fontSize: 16, fontFamily: fonts.displayBold, color: colors.sand[900], textAlign: 'center' },
  subtitle: { maxWidth: 230, fontSize: 10.5, color: colors.sand[500], textAlign: 'center', marginTop: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  periods: { flexDirection: 'row', gap: 4, borderRadius: radius.full, backgroundColor: colors.sand[100], padding: 4 },
  period: { flex: 1, alignItems: 'center', borderRadius: radius.full, paddingVertical: 8 },
  periodActive: { backgroundColor: '#fff', ...shadow.e1 },
  periodText: { fontSize: 12, color: colors.sand[500], fontFamily: fonts.displayMedium },
  periodTextActive: { color: colors.sand[900], fontFamily: fonts.displayBold },
  description: { marginTop: 12, color: colors.sand[600], fontSize: 12, lineHeight: 17 },
  metricGrid: { flexDirection: 'row', gap: 8, marginTop: 12 },
  metricCard: { flex: 1, backgroundColor: '#fff', borderRadius: radius.sheet, padding: 12, borderWidth: 1.5, borderColor: 'transparent' },
  metricIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  metricNumber: { fontSize: 19, fontFamily: fonts.displayBold, color: colors.sand[900], marginTop: 10 },
  metricLabel: { fontSize: 10.5, color: colors.sand[500], marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: radius.sheet, padding: 16, marginTop: 12 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 13.5, fontFamily: fonts.displayBold, color: colors.sand[900] },
  cardSub: { fontSize: 11, color: colors.sand[500], marginTop: 2 },
  bars: { height: 150, flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 18 },
  barColumn: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  track: { height: 118, width: '100%', borderRadius: 4, justifyContent: 'flex-end', backgroundColor: colors.sand[100], overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { width: 34, textAlign: 'center', fontSize: 8.5, color: colors.sand[500], marginTop: 7 },
  postList: { marginTop: 10 },
  postRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.sand[200], paddingVertical: 10 },
  rank: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.sand[100], alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 11, color: colors.sand[700], fontFamily: fonts.displayBold },
  postBody: { flex: 1 },
  postTitle: { fontSize: 12, lineHeight: 17, color: colors.sand[800], fontFamily: fonts.displaySemiBold },
  postDate: { fontSize: 10.5, color: colors.sand[500], marginTop: 3 },
  postValue: { alignItems: 'flex-end' },
  postNumber: { fontSize: 14, fontFamily: fonts.displayBold },
  postMetric: { fontSize: 9.5, color: colors.sand[500], marginTop: 1 },
  commentList: { marginTop: 10 }, commentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.sand[200], paddingVertical: 11 }, commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.jade[50], alignItems: 'center', justifyContent: 'center' }, commentAvatarText: { color: colors.jade[700], fontFamily: fonts.displayBold, fontSize: 12 }, commentBody: { flex: 1 }, commentName: { color: colors.sand[800], fontFamily: fonts.displaySemiBold, fontSize: 12 }, commentText: { color: colors.sand[700], fontSize: 12, lineHeight: 17, marginTop: 2 }, commentMeta: { color: colors.sand[500], fontSize: 10, marginTop: 3 },
  empty: { flexDirection: 'row', gap: 11, borderRadius: radius.sheet, backgroundColor: colors.amber[50], padding: 15, marginTop: 12 },
  emptyBody: { flex: 1 },
  emptyTitle: { fontSize: 13, fontFamily: fonts.displayBold, color: colors.amber[800] },
  emptyText: { fontSize: 11.5, lineHeight: 17, color: colors.amber[700], marginTop: 3 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: colors.amber[50], padding: 12, borderRadius: radius.md, marginTop: 12 },
  noticeText: { flex: 1, fontSize: 11.5, lineHeight: 17, color: colors.amber[800] },
  error: { color: colors.error, marginTop: 12, fontSize: 12, lineHeight: 18 },
})
