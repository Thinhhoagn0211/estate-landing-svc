import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, radius } from '../theme/tokens'

export function formatPrice(listing) {
  if (!listing?.price) return 'Giá thỏa thuận'
  return listing.deal_type === 'rent' ? `${listing.price} triệu/tháng` : `${listing.price} tỷ`
}

export function listingTitle(listing) {
  return listing?.title || listing?.property_type || (listing?.deal_type === 'rent' ? 'Bất động sản cho thuê' : 'Bất động sản đang bán')
}

function propertyStatus(listing) {
  if (listing?.property_status === 'paused') return { label: 'Tạm ngưng', icon: 'pause-circle-outline', tone: 'warning' }
  if (listing?.property_status === 'sold') return { label: 'Đã bán', icon: 'checkmark-circle-outline', tone: 'closed' }
  if (listing?.property_status === 'rented') return { label: 'Đã cho thuê', icon: 'key-outline', tone: 'closed' }
  if (listing?.property_status === 'archived') return { label: 'Lưu trữ', icon: 'archive-outline', tone: 'draft' }
  if (listing?.status === 'draft') return { label: 'Bản nháp', icon: 'document-text-outline', tone: 'draft' }
  if (listing?.status === 'live') return { label: 'Đang chào', icon: 'radio-button-on', tone: 'live' }
  return { label: 'Cần xử lý', icon: 'alert-circle-outline', tone: 'warning' }
}

export default function ListingCard({ listing, onPress, compact = false }) {
  const photo = Array.isArray(listing.photo_urls) ? listing.photo_urls.find(Boolean) : null
  const status = propertyStatus(listing)
  const facts = [
    listing.area ? `${listing.area} m²` : null,
    listing.bedrooms ? `${listing.bedrooms} phòng ngủ` : null,
  ].filter(Boolean)

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${listingTitle(listing)}, ${formatPrice(listing)}, ${status.label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}
    >
      <View style={styles.media}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.image} contentFit="cover" transition={180} cachePolicy="disk" />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="image-outline" size={28} color={colors.textMuted} />
            <Text style={styles.imageFallbackText}>Chưa có ảnh</Text>
          </View>
        )}
        <View style={styles.dealTag}>
          <Text style={styles.dealTagLabel}>{listing.deal_type === 'rent' ? 'CHO THUÊ' : 'ĐANG BÁN'}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{listingTitle(listing)}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.address} numberOfLines={1}>{listing.address || 'Chưa có địa chỉ'}</Text>
        </View>
        <View style={styles.valueRow}>
          <Text style={styles.price}>{formatPrice(listing)}</Text>
          {facts.length > 0 && <Text style={styles.facts} numberOfLines={1}>{facts.join(' · ')}</Text>}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={[styles.statusDot, styles[`${status.tone}Dot`]]} />
        <Ionicons name={status.icon} size={14} color={status.tone === 'warning' ? colors.warning : colors.textMuted} />
        <Text style={[styles.statusLabel, status.tone === 'warning' && styles.warningLabel]}>{status.label}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, overflow: 'hidden' },
  compact: { width: 276, marginRight: 12 },
  pressed: { opacity: 0.84 },
  media: { width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.surfaceSubtle },
  image: { width: '100%', height: '100%' },
  imageFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 7 },
  imageFallbackText: { color: colors.textMuted, fontFamily: fonts.displayMedium, fontSize: 12 },
  dealTag: { position: 'absolute', top: 12, left: 12, borderRadius: radius.full, backgroundColor: 'rgba(16,23,19,0.82)', paddingHorizontal: 10, paddingVertical: 6 },
  dealTagLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 0.45 },
  content: { padding: 16, paddingBottom: 14 },
  title: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 16, lineHeight: 22 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 },
  address: { color: colors.textMuted, fontSize: 12.5, flex: 1 },
  valueRow: { marginTop: 14, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  price: { color: colors.jade[800], fontFamily: fonts.displayBold, fontSize: 18 },
  facts: { color: colors.textMuted, fontFamily: fonts.displayMedium, fontSize: 11.5, flexShrink: 1, textAlign: 'right' },
  footer: { minHeight: 48, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  liveDot: { backgroundColor: colors.success },
  draftDot: { backgroundColor: colors.textMuted },
  warningDot: { backgroundColor: colors.warning },
  closedDot: { backgroundColor: colors.success },
  statusLabel: { flex: 1, color: colors.textMuted, fontFamily: fonts.displayMedium, fontSize: 12 },
  warningLabel: { color: colors.warning },
})
