import { useCallback, useMemo, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import TabBar from '../components/TabBar'
import ListingCard from '../components/ListingCard'
import { useAuth } from '../context/AuthContext'
import { useListingDraft } from '../context/ListingDraftContext'
import { supabase } from '../lib/supabase'
import { colors, fonts, radius } from '../theme/tokens'

const FILTERS = [
  { key: 'all', label: 'Tất cả' }, { key: 'active', label: 'Đang chào' },
  { key: 'draft', label: 'Bản nháp' }, { key: 'closed', label: 'Đã giao dịch' },
  { key: 'archived', label: 'Lưu trữ' },
]
const SORTS = [
  { key: 'updated', label: 'Mới cập nhật' }, { key: 'created', label: 'Mới tạo' },
  { key: 'priceAsc', label: 'Giá tăng' }, { key: 'priceDesc', label: 'Giá giảm' },
]

function normalize(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase()
}

function numericPrice(value) {
  const normalized = String(value ?? '').replace(',', '.').replace(/[^\d.]/g, '')
  return Number.parseFloat(normalized) || 0
}

export default function Listings({ navigation, route }) {
  const { user } = useAuth()
  const { loadFromListing } = useListingDraft()
  const selectMode = !!route.params?.selectMode
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('updated')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    if (!user) return
    setError(null)
    const { data, error: queryError } = await supabase.from('listings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (queryError) setError('Chưa thể tải danh sách bất động sản.')
    if (data) setListings(data)
    setLoading(false)
  }, [user])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const filtered = useMemo(() => {
    const needle = normalize(query.trim())
    const result = listings.filter((item) => {
      const propertyStatus = item.property_status || 'active'
      if (filter === 'active' && propertyStatus !== 'active') return false
      if (filter === 'draft' && item.status !== 'draft') return false
      if (filter === 'closed' && !['sold', 'rented'].includes(propertyStatus)) return false
      if (filter === 'archived' && propertyStatus !== 'archived') return false
      return !needle || normalize(`${item.title ?? ''} ${item.address ?? ''} ${item.id ?? ''}`).includes(needle)
    })
    return result.sort((a, b) => {
      if (sort === 'priceAsc' || sort === 'priceDesc') {
        if (a.deal_type !== b.deal_type) return a.deal_type.localeCompare(b.deal_type)
        const difference = numericPrice(a.price) - numericPrice(b.price)
        return sort === 'priceAsc' ? difference : -difference
      }
      const field = sort === 'created' ? 'created_at' : 'updated_at'
      return new Date(b[field] || b.created_at) - new Date(a[field] || a.created_at)
    })
  }, [filter, listings, query, sort])

  const selectListing = (item) => {
    if (!selectMode) return navigation.navigate('ListingDetail', { id: item.id })
    loadFromListing(item)
    navigation.navigate('AiGeneration')
  }

  const cycleSort = () => {
    const index = SORTS.findIndex((item) => item.key === sort)
    setSort(SORTS[(index + 1) % SORTS.length].key)
  }

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <StatusBar style="dark" />
    <View style={styles.header}>
      <View style={styles.titleRow}>
        {selectMode && <Pressable accessibilityLabel="Quay lại" style={styles.back} onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={21} color={colors.text} /></Pressable>}
        <View style={styles.titleCopy}><Text style={styles.overline}>{selectMode ? 'CHỌN HỒ SƠ' : 'DANH MỤC CỦA BẠN'}</Text><Text style={styles.title}>{selectMode ? 'Dùng tài sản đã lưu' : 'Bất động sản'}</Text><Text style={styles.subtitle}>{loading ? 'Đang cập nhật' : `${listings.length} tài sản`}</Text></View>
        {!selectMode && <Pressable accessibilityRole="button" accessibilityLabel="Tạo bất động sản mới" style={styles.createButton} onPress={() => navigation.navigate('StartCreate')}><Ionicons name="add" size={22} color="#fff" /></Pressable>}
      </View>
      <View style={styles.search}><Ionicons name="search-outline" size={19} color={colors.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Tìm tên, địa chỉ hoặc mã tài sản" placeholderTextColor={colors.textMuted} style={styles.searchInput} />{!!query && <Pressable accessibilityLabel="Xóa tìm kiếm" onPress={() => setQuery('')} style={styles.clear}><Ionicons name="close-circle" size={19} color={colors.textMuted} /></Pressable>}</View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{FILTERS.map((item) => { const active = filter === item.key; return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} key={item.key} onPress={() => setFilter(item.key)} style={[styles.filter, active && styles.filterActive]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text></Pressable> })}</ScrollView>
    </View>
    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      <View style={styles.resultRow}><Text style={styles.resultText}>{loading ? 'Đang tải…' : `${filtered.length} kết quả`}</Text><Pressable style={styles.sortButton} onPress={cycleSort}><Ionicons name="swap-vertical-outline" size={17} color={colors.jade[700]} /><Text style={styles.sortText}>{SORTS.find((item) => item.key === sort)?.label}</Text></Pressable></View>
      {selectMode && !loading && <Text style={styles.selectHint}>Chọn một tài sản để mở lại nội dung đã lưu và tiếp tục biên tập.</Text>}
      {loading && <ActivityIndicator color={colors.jade[700]} style={styles.loading} />}
      {!loading && error && <Pressable style={styles.error} onPress={load}><Text style={styles.errorText}>{error}</Text><Text style={styles.retry}>Thử lại</Text></Pressable>}
      {!loading && !error && filtered.map((item) => <ListingCard key={item.id} listing={item} onPress={() => selectListing(item)} />)}
      {!loading && !error && filtered.length === 0 && <View style={styles.empty}><View style={styles.emptyIcon}><Ionicons name={query || filter !== 'all' ? 'options-outline' : 'business-outline'} size={24} color={colors.jade[700]} /></View><Text style={styles.emptyTitle}>{query || filter !== 'all' ? 'Không có tài sản phù hợp' : 'Chưa có bất động sản'}</Text><Text style={styles.emptyText}>{query || filter !== 'all' ? 'Thử từ khóa khác hoặc xóa bộ lọc đang dùng.' : 'Lưu tài sản đầu tiên để bắt đầu tạo nội dung.'}</Text><Pressable style={styles.emptyButton} onPress={() => query || filter !== 'all' ? (setQuery(''), setFilter('all')) : navigation.navigate('StartCreate')}><Text style={styles.emptyButtonText}>{query || filter !== 'all' ? 'Xóa bộ lọc' : 'Tạo tin mới'}</Text></Pressable></View>}
    </ScrollView>
    {!selectMode && <TabBar active="listings" onNavigate={(key) => navigateTab(navigation, key)} />}
  </SafeAreaView>
}

function navigateTab(navigation, key) {
  if (key === 'home') navigation.navigate('Dashboard')
  if (key === 'listings') navigation.navigate('Listings')
  if (key === 'chat') navigation.navigate('Inbox')
  if (key === 'profile') navigation.navigate('Profile')
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas }, header: { paddingHorizontal: 20, paddingTop: 8 }, titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }, titleCopy: { flex: 1 },
  overline: { color: colors.jade[700], fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1.1 }, title: { marginTop: 2, color: colors.text, fontFamily: fonts.displayBold, fontSize: 27 }, subtitle: { marginTop: 2, color: colors.textMuted, fontSize: 12.5 },
  back: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, createButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.jade[800], alignItems: 'center', justifyContent: 'center' },
  search: { marginTop: 18, minHeight: 52, borderRadius: radius.control, borderWidth: 1, borderColor: colors.borderControl, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 9 }, searchInput: { flex: 1, fontFamily: fonts.display, color: colors.text, fontSize: 15, paddingVertical: 0 }, clear: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  filters: { paddingTop: 12, paddingBottom: 14, gap: 8 }, filter: { minHeight: 44, paddingHorizontal: 16, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, filterActive: { backgroundColor: colors.jade[800], borderColor: colors.jade[800] }, filterText: { color: colors.textMuted, fontFamily: fonts.displayMedium, fontSize: 12.5 }, filterTextActive: { color: '#fff', fontFamily: fonts.displaySemiBold },
  list: { paddingHorizontal: 20, paddingBottom: 110, gap: 14 }, resultRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, resultText: { color: colors.textMuted, fontSize: 12.5 }, sortButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 5 }, sortText: { color: colors.jade[700], fontFamily: fonts.displaySemiBold, fontSize: 12 }, selectHint: { color: colors.textMuted, fontSize: 12.5, lineHeight: 18, marginBottom: 2 },
  loading: { marginTop: 36 }, error: { padding: 16, borderRadius: radius.control, backgroundColor: colors.errorBg, flexDirection: 'row', gap: 10 }, errorText: { flex: 1, color: colors.error, fontSize: 12.5 }, retry: { color: colors.error, fontFamily: fonts.displayBold, fontSize: 12.5 },
  empty: { marginTop: 28, padding: 24, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' }, emptyIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: colors.jade[50], alignItems: 'center', justifyContent: 'center' }, emptyTitle: { marginTop: 15, color: colors.text, fontFamily: fonts.displayBold, fontSize: 16 }, emptyText: { marginTop: 5, color: colors.textMuted, fontSize: 12.5, lineHeight: 18, textAlign: 'center', maxWidth: 270 }, emptyButton: { marginTop: 17, minHeight: 48, borderRadius: radius.control, backgroundColor: colors.jade[700], paddingHorizontal: 17, alignItems: 'center', justifyContent: 'center' }, emptyButtonText: { color: '#fff', fontFamily: fonts.displaySemiBold, fontSize: 13.5 },
})
