import { useCallback, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import TabBar from '../components/TabBar'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { colors, fonts, radius, shadow } from '../theme/tokens'

const FILTERS = ['Tất cả', 'Bán', 'Cho thuê', 'Nháp']

function formatPrice(l) {
  if (!l.price) return '—'
  return l.deal_type === 'rent' ? `${l.price} tr/tháng` : `${l.price} tỷ`
}

function coverUrl(listing) {
  return Array.isArray(listing.photo_urls) ? listing.photo_urls.find(Boolean) : null
}

export default function Listings({ navigation }) {
  const { user } = useAuth()
  const [filter, setFilter] = useState(FILTERS[0])
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchListings = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setListings(data ?? [])
    setLoading(false)
  }, [user])

  useFocusEffect(
    useCallback(() => {
      fetchListings()
    }, [fetchListings])
  )

  const filtered = listings.filter((l) => {
    if (filter === 'Bán') return l.deal_type === 'sale'
    if (filter === 'Cho thuê') return l.deal_type === 'rent'
    if (filter === 'Nháp') return l.status === 'draft'
    return true
  })

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.head}>
        <View style={styles.headRow}>
          <Text style={styles.title}>Tin đăng</Text>
          <Pressable style={styles.statsBtn} onPress={() => navigation.navigate('Analytics')}>
            <Ionicons name="stats-chart-outline" size={18} color={colors.sand[700]} />
          </Pressable>
        </View>
        <View style={styles.search}>
          <Ionicons name="search" size={16} color={colors.sand[500]} />
          <Text style={styles.searchPlaceholder}>Tìm theo khu vực, giá, mã tin…</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
              <Text style={[styles.filterLabel, filter === f && styles.filterLabelActive]}>
                {f === 'Tất cả' ? `${f} · ${listings.length}` : f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {!loading && filtered.length === 0 && <Text style={styles.emptyText}>Không có tin đăng nào.</Text>}
        {filtered.map((l) => {
          const isDraft = l.status === 'draft'
          return (
            <Pressable
              key={l.id}
              style={[styles.card, isDraft && { opacity: 0.65 }]}
              onPress={() => navigation.navigate('ListingDetail', { id: l.id })}
            >
              <View style={[styles.thumb, { backgroundColor: colors.sand[200] }]}>
                {coverUrl(l) && <Image source={{ uri: coverUrl(l) }} style={styles.thumbImage} contentFit="cover" cachePolicy="disk" />}
                <View style={[styles.badge, { backgroundColor: isDraft ? colors.sand[500] : colors.jade[500] }]}>
                  <Text style={styles.badgeLabel}>{isDraft ? 'NHÁP' : 'LIVE'}</Text>
                </View>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.price}>{formatPrice(l)}</Text>
                <Text style={styles.loc} numberOfLines={1}>
                  {[l.address, l.area ? `${l.area}m²` : null, l.bedrooms ? `${l.bedrooms}PN` : null].filter(Boolean).join(' · ') || '—'}
                </Text>
                {isDraft && <Text style={styles.hint}>Chưa hoàn tất thông tin</Text>}
              </View>
            </Pressable>
          )
        })}
      </ScrollView>

      <TabBar active="listings" onNavigate={(k) => navigateTab(navigation, k)} onCreate={() => navigation.navigate('Capture')} />
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
  head: { paddingHorizontal: 20 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26, fontFamily: fonts.displayBold, color: colors.sand[900] },
  statsBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow.e1 },

  search: { marginTop: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.sand[300], borderRadius: radius.card, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchPlaceholder: { fontSize: 13, color: colors.sand[500] },

  filterRow: { marginTop: 12 },
  filterChip: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.sand[300], paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.full, marginRight: 8 },
  filterChipActive: { backgroundColor: colors.sand[900], borderColor: colors.sand[900] },
  filterLabel: { fontFamily: fonts.displayMedium, fontSize: 12.5, color: colors.sand[700] },
  filterLabelActive: { color: '#fff', fontFamily: fonts.displaySemiBold },

  list: { padding: 20, paddingTop: 14, paddingBottom: 120, gap: 12 },
  emptyText: { fontSize: 13, color: colors.sand[500], textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: radius.sheet, padding: 12, flexDirection: 'row', gap: 12, ...shadow.e1 },
  thumb: { width: 76, height: 76, borderRadius: 12, overflow: 'hidden' },
  thumbImage: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 5, left: 5, paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
  badgeLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 8 },
  price: { fontSize: 15, fontFamily: fonts.displayBold, color: colors.sand[900] },
  loc: { fontSize: 12, color: colors.sand[600], marginTop: 1 },
  hint: { fontSize: 11.5, color: colors.sand[500], marginTop: 6 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11.5, color: colors.sand[500] },
})
