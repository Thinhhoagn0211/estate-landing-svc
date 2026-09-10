import { useCallback, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import TabBar from '../components/TabBar'
import ListingCard from '../components/ListingCard'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useListingDraft } from '../context/ListingDraftContext'
import { colors, fonts, radius } from '../theme/tokens'

const SHORTCUTS = [
  { key: 'channels', label: 'Kênh đăng', icon: 'share-social-outline', route: 'ConnectChannels' },
  { key: 'analytics', label: 'Hiệu quả', icon: 'analytics-outline', route: 'Analytics' },
  { key: 'messages', label: 'Tin nhắn', icon: 'chatbubble-outline', route: 'Inbox' },
]

function displayName(user) {
  return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Bạn'
}

export default function Dashboard({ navigation }) {
  const { user } = useAuth()
  const { hasDraft } = useListingDraft()
  const userName = displayName(user)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [failedPosts, setFailedPosts] = useState([])

  const load = useCallback(async () => {
    if (!user) return
    setError(null)
    const [listingResult, failedResult] = await Promise.all([
      supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('post_logs').select('id, listing_id, error_message, created_at').eq('user_id', user.id).eq('status', 'error').order('created_at', { ascending: false }).limit(3),
    ])
    if (listingResult.error || failedResult.error) setError('Chưa cập nhật được toàn dữ liệu. Bạn có thể thử lại.')
    if (listingResult.data) setListings(listingResult.data)
    if (failedResult.data) setFailedPosts(failedResult.data)
    setLoading(false)
  }, [user])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const live = listings.filter((item) => item.status === 'live' && (item.property_status || 'active') === 'active')
  const drafts = listings.filter((item) => item.status === 'draft')
  const attention = failedPosts

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.overline}>KHÔNG GIAN LÀM VIỆC</Text>
            <Text style={styles.name} numberOfLines={1}>{userName}</Text>
            <Text style={styles.day}>Công việc hôm nay</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Mở tài khoản" style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.avatarText}>{userName === 'Bạn' ? 'NN' : userName.slice(0, 2).toUpperCase()}</Text>
          </Pressable>
        </View>

        {error && (
          <Pressable style={styles.errorBanner} onPress={load}>
            <Ionicons name="cloud-offline-outline" size={18} color={colors.warning} />
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.retry}>Thử lại</Text>
          </Pressable>
        )}

        <View style={styles.hero}>
          <View style={styles.heroMark}><Ionicons name="scan-outline" size={24} color={colors.jade[100]} /></View>
          <Text style={styles.heroKicker}>STUDIO NHÀ NÉT</Text>
          <Text style={styles.heroTitle}>Tin mới, sẵn sàng lên sóng</Text>
          <Text style={styles.heroBody}>Chọn ảnh, thêm thông tin và hoàn thiện nội dung trước khi đăng.</Text>
          {hasDraft && <View style={styles.draftNotice}><Ionicons name="document-text-outline" size={15} color={colors.jade[100]} /><Text style={styles.draftNoticeText}>Bạn có một bản nháp trên thiết bị</Text></View>}
          <Pressable accessibilityRole="button" style={({ pressed }) => [styles.heroButton, pressed && styles.pressed]} onPress={() => navigation.navigate('StartCreate')}>
            <Ionicons name="add" size={20} color={colors.jade[800]} />
            <Text style={styles.heroButtonText}>Tạo tin mới</Text>
          </Pressable>
        </View>

        <View style={styles.shortcutRow}>
          {SHORTCUTS.map((item) => (
            <Pressable key={item.key} accessibilityRole="button" style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]} onPress={() => navigation.navigate(item.route)}>
              <View style={styles.shortcutIcon}><Ionicons name={item.icon} size={21} color={colors.jade[700]} /></View>
              <Text style={styles.shortcutLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statValue}>{loading ? '—' : live.length}</Text><Text style={styles.statLabel}>Đang chào</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statValue}>{loading ? '—' : drafts.length}</Text><Text style={styles.statLabel}>Bản nháp</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.stat}><Text style={styles.statValue}>{loading ? '—' : attention.length}</Text><Text style={styles.statLabel}>Cần xử lý</Text></View>
        </View>

        {attention.length > 0 && (
          <>
            <View style={styles.sectionHeader}><View><Text style={styles.sectionKicker}>ƯU TIÊN</Text><Text style={styles.sectionTitle}>Cần bạn xử lý</Text></View></View>
            <Pressable style={styles.attentionCard} onPress={() => attention[0]?.listing_id ? navigation.navigate('ListingDetail', { id: attention[0].listing_id }) : navigation.navigate('Listings')}>
              <View style={styles.attentionIcon}><Ionicons name="alert-circle-outline" size={20} color={colors.warning} /></View>
              <View style={styles.attentionCopy}><Text style={styles.attentionTitle}>{attention.length} lần đăng cần xem lại</Text><Text style={styles.attentionBody}>Mở tài sản để xem lỗi từ kênh đăng.</Text></View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          </>
        )}

        <View style={styles.sectionHeader}>
          <View><Text style={styles.sectionKicker}>CẬP NHẬT GẦN ĐÂY</Text><Text style={styles.sectionTitle}>Bất động sản</Text></View>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Listings')} style={styles.seeAllButton}><Text style={styles.seeAll}>Xem tất cả</Text></Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingCard}><ActivityIndicator color={colors.jade[700]} /></View>
        ) : listings.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {listings.slice(0, 5).map((item) => <ListingCard compact key={item.id} listing={item} onPress={() => navigation.navigate('ListingDetail', { id: item.id })} />)}
          </ScrollView>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Ionicons name="business-outline" size={23} color={colors.jade[700]} /></View>
            <Text style={styles.emptyTitle}>Lưu bất động sản đầu tiên</Text>
            <Text style={styles.emptyText}>Bắt đầu bằng hình ảnh và những thông tin cơ bản của tài sản.</Text>
            <Pressable style={styles.emptyButton} onPress={() => navigation.navigate('StartCreate')}><Text style={styles.emptyButtonText}>Tạo tin mới</Text></Pressable>
          </View>
        )}
      </ScrollView>
      <TabBar active="home" onNavigate={(key) => navigateTab(navigation, key)} />
    </SafeAreaView>
  )
}

function navigateTab(navigation, key) {
  if (key === 'home') navigation.navigate('Dashboard')
  if (key === 'listings') navigation.navigate('Listings')
  if (key === 'chat') navigation.navigate('Inbox')
  if (key === 'profile') navigation.navigate('Profile')
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 108 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerCopy: { flex: 1, paddingRight: 16 },
  overline: { fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1.15, color: colors.jade[700] },
  name: { marginTop: 3, fontFamily: fonts.displayBold, fontSize: 27, lineHeight: 34, color: colors.text, textTransform: 'capitalize' },
  day: { marginTop: 1, fontSize: 13, color: colors.textMuted },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.jade[800] },
  avatarText: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 14 },
  errorBanner: { marginTop: 16, minHeight: 52, borderRadius: radius.control, backgroundColor: colors.amber[50], paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9 },
  errorText: { flex: 1, color: colors.warning, fontSize: 12.5, lineHeight: 18 },
  retry: { color: colors.warning, fontFamily: fonts.displayBold, fontSize: 12 },
  hero: { marginTop: 24, borderRadius: 24, padding: 22, backgroundColor: colors.jade[900], overflow: 'hidden' },
  heroMark: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  heroKicker: { marginTop: 18, color: colors.jade[200], fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1.15 },
  heroTitle: { marginTop: 4, color: '#fff', fontFamily: fonts.displayBold, fontSize: 24, lineHeight: 31 },
  heroBody: { marginTop: 7, color: colors.jade[100], fontSize: 13.5, lineHeight: 20, maxWidth: 310 },
  draftNotice: { marginTop: 13, flexDirection: 'row', alignItems: 'center', gap: 6 }, draftNoticeText: { color: colors.jade[100], fontFamily: fonts.displayMedium, fontSize: 11.5 },
  heroButton: { marginTop: 20, minHeight: 52, alignSelf: 'flex-start', paddingHorizontal: 18, borderRadius: radius.control, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroButtonText: { color: colors.jade[800], fontFamily: fonts.displayBold, fontSize: 15 },
  pressed: { opacity: 0.82 },
  shortcutRow: { marginTop: 14, flexDirection: 'row', gap: 10 },
  shortcut: { flex: 1, minHeight: 88, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 8 },
  shortcutIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.jade[50], alignItems: 'center', justifyContent: 'center' },
  shortcutLabel: { fontFamily: fonts.displaySemiBold, color: colors.text, fontSize: 11.5 },
  stats: { marginTop: 14, minHeight: 72, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: fonts.displayBold, color: colors.text, fontSize: 18 },
  statLabel: { marginTop: 3, color: colors.textMuted, fontSize: 10.5 },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border },
  sectionHeader: { marginTop: 30, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionKicker: { color: colors.textMuted, fontFamily: fonts.displayBold, fontSize: 9.5, letterSpacing: 1 },
  sectionTitle: { marginTop: 3, color: colors.text, fontFamily: fonts.displayBold, fontSize: 19 },
  seeAllButton: { minHeight: 44, justifyContent: 'center', paddingLeft: 14 },
  seeAll: { color: colors.jade[700], fontFamily: fonts.displaySemiBold, fontSize: 13 },
  attentionCard: { minHeight: 78, borderRadius: radius.card, backgroundColor: colors.amber[50], borderWidth: 1, borderColor: colors.amber[100], padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  attentionIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  attentionCopy: { flex: 1 },
  attentionTitle: { color: colors.warning, fontFamily: fonts.displaySemiBold, fontSize: 13.5 },
  attentionBody: { marginTop: 2, color: colors.amber[700], fontSize: 11.5 },
  carousel: { paddingRight: 8 },
  loadingCard: { height: 250, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  empty: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 22, alignItems: 'flex-start' },
  emptyIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.jade[50], alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 14, color: colors.text, fontFamily: fonts.displayBold, fontSize: 16 },
  emptyText: { marginTop: 4, color: colors.textMuted, fontSize: 12.5, lineHeight: 18, maxWidth: 280 },
  emptyButton: { marginTop: 16, minHeight: 48, paddingHorizontal: 16, borderRadius: radius.control, backgroundColor: colors.jade[700], alignItems: 'center', justifyContent: 'center' },
  emptyButtonText: { color: '#fff', fontFamily: fonts.displaySemiBold, fontSize: 13.5 },
})
