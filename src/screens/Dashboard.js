import { useCallback, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useFocusEffect } from '@react-navigation/native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import TabBar from '../components/TabBar'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { colors, fonts, shadow, radius } from '../theme/tokens'

function formatPrice(l) {
  if (!l.price) return '—'
  return l.deal_type === 'rent' ? `${l.price} tr/tháng` : `${l.price} tỷ`
}

function coverUrl(listing) {
  return Array.isArray(listing.photo_urls) ? listing.photo_urls.find(Boolean) : null
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  return `${Math.floor(hours / 24)} ngày trước`
}

export default function Dashboard({ navigation }) {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchListings = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    setListings(data ?? [])
    setLoading(false)
  }, [user])

  useFocusEffect(
    useCallback(() => {
      fetchListings()
    }, [fetchListings])
  )

  const startCreate = () => navigation.navigate('Capture')
  const liveListings = listings.filter((l) => l.status === 'live')

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.greetRow}>
          <View>
            <Text style={styles.greetSmall}>Chào buổi tối 🌙</Text>
            <Text style={styles.greetName}>{user?.email?.split('@')[0] ?? 'Bạn'}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>{(user?.email?.[0] ?? 'U').toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.creditsCard}>
          <View style={styles.creditsLeft}>
            <View style={styles.creditsIcon}>
              <View style={styles.creditsDiamond} />
            </View>
            <View>
              <Text style={styles.creditsValue}>48 tín dụng</Text>
              <Text style={styles.creditsSub}>còn lại tháng này</Text>
            </View>
          </View>
          <Pressable onPress={() => navigation.navigate('Subscription')}>
            <Text style={styles.upgrade}>Nâng cấp</Text>
          </Pressable>
        </View>

        <Pressable onPress={startCreate}>
          <LinearGradient colors={[colors.jade[600], colors.jade[800]]} start={{ x: 0, y: 0 }} end={{ x: 0.7, y: 1 }} style={styles.hero}>
            <Text style={styles.heroTitle}>Tạo bài đăng mới</Text>
            <Text style={styles.heroSub}>Chụp ảnh → bài đăng trực tiếp trên 3 nền tảng trong vài phút.</Text>
            <View style={styles.heroBtn}>
              <Ionicons name="camera" size={18} color={colors.jade[700]} />
              <Text style={styles.heroBtnLabel}>Bắt đầu</Text>
            </View>
          </LinearGradient>
        </Pressable>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Tin đang đăng</Text>
          <Pressable onPress={() => navigation.navigate('Listings')}>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.listingRow}>
          {liveListings.slice(0, 5).map((l) => (
            <Pressable key={l.id} style={styles.listingCard} onPress={() => navigation.navigate('ListingDetail', { id: l.id })}>
              <View style={[styles.listingPhoto, { backgroundColor: colors.sand[200] }]}>
                {coverUrl(l) && (
                  <Image source={{ uri: coverUrl(l) }} style={styles.coverImage} contentFit="cover" cachePolicy="disk" />
                )}
                <View style={[styles.listingBadge, { backgroundColor: l.deal_type === 'sale' ? 'rgba(13,91,73,.92)' : 'rgba(131,77,13,.92)' }]}>
                  <Text style={styles.listingBadgeLabel}>{l.deal_type === 'sale' ? 'BÁN' : 'THUÊ'}</Text>
                </View>
              </View>
              <View style={styles.listingBody}>
                <Text style={styles.listingPrice}>{formatPrice(l)}</Text>
                <Text style={styles.listingLoc} numberOfLines={1}>
                  {[l.address, l.area ? `${l.area}m²` : null].filter(Boolean).join(' · ') || '—'}
                </Text>
              </View>
            </Pressable>
          ))}
          <Pressable style={styles.addTile} onPress={startCreate}>
            <View style={styles.addCircle}>
              <Ionicons name="add" size={20} color={colors.sand[400]} />
            </View>
            <Text style={styles.addLabel}>Thêm</Text>
          </Pressable>
        </ScrollView>

        <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Bài đăng gần đây</Text>
        {!loading && liveListings.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có bài đăng nào. Nhấn "Bắt đầu" để tạo bài đầu tiên.</Text>
        ) : (
          <View style={styles.postList}>
            {liveListings.slice(0, 5).map((l) => (
              <Pressable key={l.id} style={styles.postCard} onPress={() => navigation.navigate('ListingDetail', { id: l.id })}>
                <View style={styles.postThumb}>
                  {coverUrl(l) && (
                  <Image source={{ uri: coverUrl(l) }} style={styles.postImage} contentFit="cover" cachePolicy="disk" />
                )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.postTitle} numberOfLines={1}>
                    {l.title || l.address || 'Bài đăng'}
                  </Text>
                  <View style={styles.postMeta}>
                    <Text style={styles.postMetaText}>{timeAgo(l.created_at)}</Text>
                    <Text style={styles.postMetaGuests}>{formatPrice(l)}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.insight}>
          <View style={styles.insightIcon}>
            <Ionicons name="bulb-outline" size={16} color={colors.amber[500]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightTitle}>Đăng lúc 20:00 được xem gấp 2,3×</Text>
            <Text style={styles.insightSub}>Dựa trên các bài đăng gần đây của bạn.</Text>
          </View>
        </View>
      </ScrollView>
      <TabBar active="home" onNavigate={(k) => navigateTab(navigation, k)} onCreate={startCreate} />
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
  safe: { flex: 1, backgroundColor: colors.sand[50] },
  scroll: { padding: 20, paddingBottom: 120 },
  greetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greetSmall: { fontSize: 13, color: colors.sand[500], fontFamily: fonts.displayMedium },
  greetName: { fontSize: 26, fontFamily: fonts.displayBold, marginTop: 2, color: colors.sand[900], textTransform: 'capitalize' },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.jade[600], alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 17 },

  creditsCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.e1,
  },
  creditsLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  creditsIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.amber[50], alignItems: 'center', justifyContent: 'center' },
  creditsDiamond: { width: 9, height: 9, backgroundColor: colors.amber[500], transform: [{ rotate: '45deg' }] },
  creditsValue: { fontSize: 18, fontFamily: fonts.displayBold, color: colors.sand[900] },
  creditsSub: { fontSize: 11, color: colors.sand[500] },
  upgrade: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.jade[600] },

  hero: { marginTop: 14, borderRadius: 20, padding: 22, overflow: 'hidden' },
  heroTitle: { fontSize: 22, fontFamily: fonts.displayBold, color: '#fff' },
  heroSub: { fontSize: 13, color: colors.jade[100], marginTop: 4, maxWidth: 240 },
  heroBtn: {
    marginTop: 16,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  heroBtnLabel: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.jade[700] },

  sectionHead: { marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontFamily: fonts.displayBold, color: colors.sand[900] },
  seeAll: { fontFamily: fonts.displayMedium, fontSize: 13, color: colors.jade[600] },

  listingRow: { marginTop: 12 },
  listingCard: { width: 150, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', marginRight: 12, ...shadow.e1 },
  listingPhoto: { height: 96, padding: 8 },
  coverImage: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' },
  listingBadge: { alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 7, borderRadius: 5 },
  listingBadgeLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 9 },
  listingBody: { padding: 10 },
  listingPrice: { fontSize: 15, fontFamily: fonts.displayBold, color: colors.sand[900] },
  listingPriceUnit: { fontSize: 11, color: colors.sand[500], fontFamily: fonts.displayMedium },
  listingLoc: { fontSize: 11, color: colors.sand[600], marginTop: 1 },

  addTile: { width: 88, height: 132, backgroundColor: '#fff', borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 6, ...shadow.e1 },
  addCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: colors.sand[400], borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  addLabel: { fontSize: 11, fontFamily: fonts.displayMedium, color: colors.sand[500] },

  emptyText: { marginTop: 12, fontSize: 13, color: colors.sand[500], lineHeight: 19 },

  postList: { marginTop: 12, gap: 10 },
  postCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, ...shadow.e1 },
  postThumb: { width: 52, height: 52, borderRadius: 10, backgroundColor: colors.sand[200], overflow: 'hidden' },
  postImage: { width: '100%', height: '100%' },
  postTitle: { fontSize: 14, fontFamily: fonts.displaySemiBold, color: colors.sand[900] },
  postMeta: { flexDirection: 'row', gap: 12, marginTop: 5 },
  postMetaText: { fontSize: 12, fontFamily: fonts.displayMedium, color: colors.sand[600] },
  postMetaGuests: { fontSize: 12, fontFamily: fonts.displaySemiBold, color: colors.jade[600] },

  insight: { marginTop: 16, backgroundColor: colors.amber[50], borderRadius: 14, padding: 15, flexDirection: 'row', gap: 12 },
  insightIcon: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  insightTitle: { fontSize: 14, fontFamily: fonts.displaySemiBold, color: colors.amber[800] },
  insightSub: { fontSize: 12, color: colors.amber[700], marginTop: 2, opacity: 0.85 },
})
