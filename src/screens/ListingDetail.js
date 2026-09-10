import { useCallback, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import { supabase } from '../lib/supabase'
import { useListingDraft } from '../context/ListingDraftContext'
import { formatPrice, listingTitle } from '../components/ListingCard'
import { colors, fonts, radius } from '../theme/tokens'

const TABS = [
  { key: 'details', label: 'Thông tin' },
  { key: 'content', label: 'Nội dung' },
  { key: 'history', label: 'Lịch sử đăng' },
]

function formatDate(iso) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function statusLabel(listing) {
  const labels = { paused: 'Tạm ngưng', sold: 'Đã bán', rented: 'Đã cho thuê', archived: 'Lưu trữ' }
  return labels[listing?.property_status] || (listing?.status === 'draft' ? 'Bản nháp' : 'Đang chào')
}

export default function ListingDetail({ navigation, route }) {
  const { width } = useWindowDimensions()
  const { loadFromListing } = useListingDraft()
  const [listing, setListing] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')
  const [photoIndex, setPhotoIndex] = useState(0)
  const id = route.params?.id

  useFocusEffect(useCallback(() => {
    let active = true
    async function load() {
      setLoading(true)
      const [listingResult, logsResult] = await Promise.all([
        supabase.from('listings').select('*').eq('id', id).maybeSingle(),
        supabase.from('post_logs').select('id, platform, method, status, error_message, created_at').eq('listing_id', id).order('created_at', { ascending: false }),
      ])
      if (active) {
        setListing(listingResult.data ?? null)
        setLogs(logsResult.data ?? [])
        setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [id]))

  const photos = Array.isArray(listing?.photo_urls) ? listing.photo_urls.filter(Boolean) : []
  const facts = [
    listing?.area ? { icon: 'resize-outline', label: listing.area + ' m²' } : null,
    listing?.bedrooms ? { icon: 'bed-outline', label: listing.bedrooms + ' phòng ngủ' } : null,
    listing?.bathrooms ? { icon: 'water-outline', label: listing.bathrooms + ' phòng tắm' } : null,
    listing?.direction ? { icon: 'compass-outline', label: 'Hướng ' + listing.direction } : null,
  ].filter(Boolean)

  const editInformation = () => {
    loadFromListing(listing)
    navigation.navigate('PropertyDetails')
  }

  const createContent = () => {
    loadFromListing(listing)
    navigation.navigate('AiGeneration')
  }

  if (!loading && !listing) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.notFound}><View style={styles.notFoundIcon}><Ionicons name="business-outline" size={28} color={colors.jade[700]} /></View><Text style={styles.notFoundTitle}>Không tìm thấy bất động sản</Text><Text style={styles.notFoundText}>Tài sản có thể đã bị xóa hoặc bạn không còn quyền truy cập.</Text><Pressable style={styles.returnButton} onPress={() => navigation.goBack()}><Text style={styles.returnText}>Quay lại danh sách</Text></Pressable></View>
      </SafeAreaView>
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar style={photos.length ? 'light' : 'dark'} />
      <View style={styles.hero}>
        {photos[0] ? <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={StyleSheet.absoluteFill} onMomentumScrollEnd={(event) => setPhotoIndex(Math.round(event.nativeEvent.contentOffset.x / width))}>{photos.map((photo) => <Image key={photo} source={{ uri: photo }} style={[styles.heroImage, { width }]} contentFit="cover" transition={180} />)}</ScrollView> : <View style={styles.heroFallback}><Ionicons name="image-outline" size={38} color={colors.textMuted} /><Text style={styles.heroFallbackText}>Chưa có ảnh</Text></View>}
        <SafeAreaView edges={['top']}>
          <View style={styles.heroHeader}>
            <Pressable accessibilityLabel="Quay lại" style={styles.heroButton} onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={21} color={colors.text} /></Pressable>
            <View style={styles.heroActions}>
              {photos.length > 0 && <View style={styles.photoCount}><Ionicons name="images-outline" size={14} color="#fff" /><Text style={styles.photoCountText}>{photoIndex + 1}/{photos.length}</Text></View>}
              <View style={[styles.stateBadge, (listing?.status === 'draft' || listing?.property_status !== 'active') && styles.draftBadge]}><View style={styles.stateDot} /><Text style={styles.stateText}>{statusLabel(listing)}</Text></View>
              <Pressable accessibilityLabel="Quản lý bất động sản" style={styles.heroButton} onPress={() => navigation.navigate('ManageListing', { id: listing.id, currentStatus: listing.property_status || 'active', title: listingTitle(listing) })}><Ionicons name="ellipsis-horizontal" size={21} color={colors.text} /></Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.sheet}>
        {loading ? <ActivityIndicator color={colors.jade[700]} style={styles.loading} /> : (
          <>
            <View style={styles.summary}>
              <Text style={styles.overline}>{listing.deal_type === 'rent' ? 'CHO THUÊ' : 'ĐANG BÁN'}</Text>
              <Text style={styles.title}>{listingTitle(listing)}</Text>
              <Text style={styles.price}>{formatPrice(listing)}</Text>
              <View style={styles.addressRow}><Ionicons name="location-outline" size={16} color={colors.textMuted} /><Text style={styles.address}>{listing.address || 'Chưa có địa chỉ'}</Text></View>
            </View>

            <View style={styles.tabs}>
              {TABS.map((tab) => <Pressable key={tab.key} accessibilityRole="tab" accessibilityState={{ selected: activeTab === tab.key }} style={[styles.tab, activeTab === tab.key && styles.tabActive]} onPress={() => setActiveTab(tab.key)}><Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text></Pressable>)}
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {activeTab === 'details' && (
                <>
                  {facts.length > 0 && <View style={styles.facts}>{facts.map((fact) => <View key={fact.label} style={styles.fact}><Ionicons name={fact.icon} size={20} color={colors.jade[700]} /><Text style={styles.factText}>{fact.label}</Text></View>)}</View>}
                  <Text style={styles.sectionLabel}>THÔNG TIN BỔ SUNG</Text>
                  <View style={styles.infoCard}>
                    <InfoRow label="Loại tài sản" value={listing.property_type || 'Chưa cập nhật'} />
                    <InfoRow label="Pháp lý" value={listing.legal_status || 'Chưa cập nhật'} />
                    <InfoRow label="Tiện ích" value={listing.amenities?.length ? listing.amenities.join(', ') : 'Chưa cập nhật'} last />
                  </View>
                  {!!listing.description && <><Text style={styles.sectionLabel}>GHI CHÚ CÔNG KHAI</Text><View style={styles.textCard}><Text style={styles.bodyText}>{listing.description}</Text></View></>}
                </>
              )}

              {activeTab === 'content' && (
                listing.caption_primary ? <View style={styles.textCard}><View style={styles.draftLabel}><Ionicons name="create-outline" size={16} color={colors.ai} /><Text style={styles.draftLabelText}>Nội dung đã lưu</Text></View><Text style={styles.bodyText}>{listing.caption_primary}</Text>{!!listing.hashtags && <Text style={styles.hashtags}>{listing.hashtags}</Text>}</View> : <EmptySection icon="document-text-outline" title="Chưa có nội dung" text="Tài sản này chưa có caption được lưu." />
              )}

              {activeTab === 'history' && (
                logs.length ? <View style={styles.history}>{logs.map((log) => {
                  const success = log.status === 'success' || log.status === 'user_confirmed'
                  return <View style={styles.log} key={log.id}><View style={[styles.logIcon, success ? styles.logSuccess : styles.logError]}><Ionicons name={success ? 'checkmark' : 'alert-outline'} size={17} color={success ? colors.success : colors.error} /></View><View style={styles.logCopy}><Text style={styles.logTitle}>{log.platform === 'facebook' ? 'Facebook' : log.platform}</Text><Text style={styles.logMeta}>{log.method === 'auto' ? 'Đăng trực tiếp' : 'Chia sẻ thủ công'} · {formatDate(log.created_at)}</Text>{!!log.error_message && <Text style={styles.logErrorText}>{log.error_message}</Text>}</View><Text style={[styles.logState, { color: success ? colors.success : colors.error }]}>{success ? 'Đã đăng' : 'Lỗi'}</Text></View>
                })}</View> : <EmptySection icon="time-outline" title="Chưa có lịch sử đăng" text="Kết quả theo từng kênh sẽ xuất hiện tại đây." />
              )}
            </ScrollView>
            <View style={styles.footer}>
              <Pressable style={styles.secondaryButton} onPress={editInformation}><Ionicons name="pencil-outline" size={18} color={colors.jade[700]} /><Text style={styles.secondaryText}>Sửa thông tin</Text></Pressable>
              <Pressable style={styles.primaryButton} onPress={createContent}><Ionicons name="sparkles-outline" size={18} color="#fff" /><Text style={styles.primaryText}>Tạo nội dung</Text></Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  )
}

function InfoRow({ label, value, last }) {
  return <View style={[styles.infoRow, !last && styles.infoBorder]}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>
}

function EmptySection({ icon, title, text }) {
  return <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name={icon} size={23} color={colors.jade[700]} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyText}>{text}</Text></View>
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceSubtle },
  safe: { flex: 1, backgroundColor: colors.canvas },
  hero: { height: 300, backgroundColor: colors.surfaceSubtle },
  heroImage: { height: 300 },
  heroFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  heroFallbackText: { color: colors.textMuted, fontSize: 12 },
  heroHeader: { paddingHorizontal: 20, paddingTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center' },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  photoCount: { minHeight: 36, paddingHorizontal: 11, borderRadius: radius.full, backgroundColor: 'rgba(16,23,19,0.72)', flexDirection: 'row', alignItems: 'center', gap: 5 },
  photoCountText: { color: '#fff', fontFamily: fonts.displaySemiBold, fontSize: 11 },
  stateBadge: { minHeight: 36, paddingHorizontal: 12, borderRadius: radius.full, backgroundColor: 'rgba(16,58,42,0.9)', flexDirection: 'row', alignItems: 'center', gap: 6 },
  draftBadge: { backgroundColor: 'rgba(23,33,27,0.82)' },
  stateDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  stateText: { color: '#fff', fontFamily: fonts.displaySemiBold, fontSize: 11 },
  sheet: { flex: 1, marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.canvas, overflow: 'hidden' },
  loading: { marginTop: 60 },
  summary: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 18 },
  overline: { color: colors.jade[700], fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1 },
  title: { marginTop: 5, color: colors.text, fontFamily: fonts.displayBold, fontSize: 22, lineHeight: 29 },
  price: { marginTop: 10, color: colors.jade[800], fontFamily: fonts.displayBold, fontSize: 26 },
  addressRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  address: { flex: 1, color: colors.textMuted, fontSize: 12.5 },
  tabs: { marginHorizontal: 20, padding: 4, borderRadius: radius.control, backgroundColor: colors.surfaceSubtle, flexDirection: 'row' },
  tab: { flex: 1, minHeight: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.surface },
  tabText: { color: colors.textMuted, fontFamily: fonts.displayMedium, fontSize: 11.5 },
  tabTextActive: { color: colors.text, fontFamily: fonts.displaySemiBold },
  content: { padding: 20, paddingBottom: 48 },
  footer: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', gap: 10 },
  secondaryButton: { flex: 1, minHeight: 52, borderRadius: radius.control, borderWidth: 1, borderColor: colors.borderControl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  secondaryText: { color: colors.jade[700], fontFamily: fonts.displaySemiBold, fontSize: 13 },
  primaryButton: { flex: 1, minHeight: 52, borderRadius: radius.control, backgroundColor: colors.jade[700], flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  primaryText: { color: '#fff', fontFamily: fonts.displaySemiBold, fontSize: 13 },
  facts: { flexDirection: 'row', gap: 8 },
  fact: { flex: 1, minHeight: 76, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 12, justifyContent: 'space-between' },
  factText: { color: colors.text, fontFamily: fonts.displayMedium, fontSize: 11.5, lineHeight: 16 },
  sectionLabel: { marginTop: 24, marginBottom: 9, color: colors.textMuted, fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 0.9 },
  infoCard: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  infoRow: { minHeight: 58, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 15 },
  infoBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { width: 80, color: colors.textMuted, fontSize: 12 },
  infoValue: { flex: 1, color: colors.text, fontFamily: fonts.displayMedium, fontSize: 12.5, textAlign: 'right' },
  textCard: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 16 },
  draftLabel: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 7 },
  draftLabelText: { color: colors.ai, fontFamily: fonts.displaySemiBold, fontSize: 12 },
  bodyText: { color: colors.text, fontSize: 13.5, lineHeight: 21 },
  hashtags: { marginTop: 12, color: colors.jade[700], fontSize: 13, lineHeight: 20 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: colors.jade[50], alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: 13, color: colors.text, fontFamily: fonts.displayBold, fontSize: 15 },
  emptyText: { marginTop: 4, color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  history: { gap: 10 },
  log: { padding: 14, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  logIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logSuccess: { backgroundColor: colors.jade[50] },
  logError: { backgroundColor: colors.errorBg },
  logCopy: { flex: 1 },
  logTitle: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 13 },
  logMeta: { marginTop: 2, color: colors.textMuted, fontSize: 10.5 },
  logErrorText: { marginTop: 5, color: colors.error, fontSize: 11, lineHeight: 16 },
  logState: { fontFamily: fonts.displaySemiBold, fontSize: 11 },
  notFound: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center' },
  notFoundIcon: { width: 58, height: 58, borderRadius: 19, backgroundColor: colors.jade[50], alignItems: 'center', justifyContent: 'center' },
  notFoundTitle: { marginTop: 16, color: colors.text, fontFamily: fonts.displayBold, fontSize: 18 },
  notFoundText: { marginTop: 5, color: colors.textMuted, fontSize: 12.5, lineHeight: 18, textAlign: 'center' },
  returnButton: { marginTop: 18, minHeight: 50, paddingHorizontal: 18, borderRadius: radius.control, backgroundColor: colors.jade[700], alignItems: 'center', justifyContent: 'center' },
  returnText: { color: '#fff', fontFamily: fonts.displaySemiBold, fontSize: 13.5 },
})
