import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import FlowHeader from '../components/FlowHeader'
import Button from '../components/Button'
import { useListingDraft } from '../context/ListingDraftContext'
import { colors, fonts, radius } from '../theme/tokens'

const AMENITY_OPTIONS = ['Hồ bơi', 'Gym', 'Bãi đỗ xe', 'Ban công']
const DIRECTION_OPTIONS = ['Đông', 'Tây', 'Nam', 'Bắc', 'Đông Nam', 'Đông Bắc', 'Tây Nam', 'Tây Bắc']
const LEGAL_OPTIONS = ['Sổ đỏ', 'Sổ hồng', 'Đang chờ sổ']

export default function PropertyDetails({ navigation }) {
  const { details, setDetails } = useListingDraft()

  const setField = (key, value) => setDetails((prev) => ({ ...prev, [key]: value }))
  const toggleAmenity = (label) =>
    setDetails((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(label) ? prev.amenities.filter((a) => a !== label) : [...prev.amenities, label],
    }))

  const canContinue = details.price.trim().length > 0 && details.area.trim().length > 0

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <FlowHeader step={2} totalSteps={3} label="Thông tin" onBack={() => navigation.goBack()} onCancel={() => navigation.popToTop()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Thông tin căn hộ</Text>

        <Text style={styles.fieldLabel}>Tiêu đề tin đăng</Text>
        <View style={styles.field}>
          <TextInput
            style={styles.fieldValueFull}
            placeholder="Căn hộ 2PN view sông Vinhomes Central Park"
            placeholderTextColor={colors.sand[400]}
            value={details.title}
            onChangeText={(v) => setField('title', v)}
          />
        </View>

        <View style={styles.segment}>
          <Pressable
            style={[styles.segmentItem, details.dealType === 'sale' && styles.segmentItemActive]}
            onPress={() => setField('dealType', 'sale')}
          >
            <Text style={[styles.segmentLabel, details.dealType === 'sale' && styles.segmentLabelActive]}>Bán</Text>
          </Pressable>
          <Pressable
            style={[styles.segmentItem, details.dealType === 'rent' && styles.segmentItemActive]}
            onPress={() => setField('dealType', 'rent')}
          >
            <Text style={[styles.segmentLabel, details.dealType === 'rent' && styles.segmentLabelActive]}>Cho thuê</Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>{details.dealType === 'sale' ? 'Giá bán' : 'Giá thuê'}</Text>
        <View style={styles.priceField}>
          <TextInput
            style={styles.priceValue}
            placeholder="2,5"
            placeholderTextColor={colors.sand[400]}
            keyboardType="numeric"
            value={details.price}
            onChangeText={(v) => setField('price', v)}
          />
          <Text style={styles.priceUnit}>{details.dealType === 'sale' ? 'tỷ VNĐ' : 'triệu/tháng'}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.rowField}>
            <Text style={styles.fieldLabel}>Diện tích</Text>
            <View style={styles.field}>
              <TextInput
                style={styles.fieldValue}
                placeholder="68 m²"
                placeholderTextColor={colors.sand[400]}
                keyboardType="numeric"
                value={details.area}
                onChangeText={(v) => setField('area', v)}
              />
            </View>
          </View>
          <View style={styles.rowField}>
            <Text style={styles.fieldLabel}>Phòng ngủ</Text>
            <View style={styles.field}>
              <TextInput
                style={styles.fieldValue}
                placeholder="2 PN"
                placeholderTextColor={colors.sand[400]}
                keyboardType="numeric"
                value={details.bedrooms}
                onChangeText={(v) => setField('bedrooms', v)}
              />
            </View>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Địa chỉ</Text>
        <View style={styles.addressField}>
          <Ionicons name="location-outline" size={16} color={colors.jade[600]} />
          <TextInput
            style={styles.addressValue}
            placeholder="208 Nguyễn Hữu Cảnh, Bình Thạnh"
            placeholderTextColor={colors.sand[400]}
            value={details.address}
            onChangeText={(v) => setField('address', v)}
          />
        </View>

        <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Hướng nhà</Text>
        <View style={styles.chipRow}>
          {DIRECTION_OPTIONS.map((d) => {
            const on = details.direction === d
            return (
              <Pressable key={d} onPress={() => setField('direction', on ? '' : d)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{d}</Text>
              </Pressable>
            )
          })}
        </View>

        <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Pháp lý</Text>
        <View style={styles.chipRow}>
          {LEGAL_OPTIONS.map((l) => {
            const on = details.legalStatus === l
            return (
              <Pressable key={l} onPress={() => setField('legalStatus', on ? '' : l)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{l}</Text>
              </Pressable>
            )
          })}
        </View>

        <Text style={styles.fieldLabel}>Số điện thoại liên hệ</Text>
        <View style={styles.field}>
          <TextInput
            style={styles.fieldValueFull}
            placeholder="0912 345 678"
            placeholderTextColor={colors.sand[400]}
            keyboardType="phone-pad"
            value={details.contactPhone}
            onChangeText={(v) => setField('contactPhone', v)}
          />
        </View>

        <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>Tiện ích</Text>
        <View style={styles.chipRow}>
          {AMENITY_OPTIONS.map((label) => {
            const on = details.amenities.includes(label)
            return (
              <Pressable key={label} onPress={() => toggleAmenity(label)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>
                  {on ? '✓ ' : ''}
                  {label}
                </Text>
              </Pressable>
            )
          })}
        </View>

        <Text style={styles.fieldLabel}>Ghi chú thêm</Text>
        <View style={[styles.field, styles.notesField]}>
          <TextInput
            style={[styles.fieldValueFull, styles.notesInput]}
            placeholder="Điểm nổi bật khác: gần trường quốc tế, an ninh 24/7, chủ nhà thiện chí…"
            placeholderTextColor={colors.sand[400]}
            multiline
            value={details.description}
            onChangeText={(v) => setField('description', v)}
          />
        </View>
      </ScrollView>

      <View style={styles.sticky}>
        <Button variant="primary" block disabled={!canContinue} onPress={() => navigation.navigate('AiGeneration')}>
          Tạo nội dung với AI
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 22, fontFamily: fonts.displayBold, color: colors.sand[900] },

  segment: { marginTop: 16, flexDirection: 'row', backgroundColor: colors.sand[100], borderRadius: radius.card, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 9 },
  segmentItemActive: { backgroundColor: colors.sand[900] },
  segmentLabel: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.sand[600] },
  segmentLabelActive: { color: '#fff', fontFamily: fonts.displayBold },

  fieldLabel: { marginTop: 16, fontSize: 12.5, fontFamily: fonts.displaySemiBold, color: colors.sand[600], marginBottom: 6 },
  priceField: { borderWidth: 1.5, borderColor: colors.jade[500], borderRadius: radius.card, padding: 13, flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  priceValue: { fontSize: 20, fontFamily: fonts.displayBold, color: colors.sand[900], padding: 0, minWidth: 40 },
  priceUnit: { fontSize: 14, fontFamily: fonts.displaySemiBold, color: colors.sand[700] },

  row: { flexDirection: 'row', gap: 10 },
  rowField: { flex: 1 },
  field: { borderWidth: 1, borderColor: colors.sand[300], borderRadius: radius.card, padding: 13 },
  fieldValue: { fontSize: 15, fontFamily: fonts.displaySemiBold, color: colors.sand[900], padding: 0 },
  fieldValueFull: { fontSize: 14, fontFamily: fonts.displayMedium, color: colors.sand[900], padding: 0 },
  notesField: { minHeight: 80 },
  notesInput: { minHeight: 60, textAlignVertical: 'top' },

  addressField: { borderWidth: 1, borderColor: colors.sand[300], borderRadius: radius.card, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressValue: { flex: 1, fontSize: 14, fontFamily: fonts.displayMedium, color: colors.sand[900], padding: 0 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: colors.sand[300], paddingVertical: 7, paddingHorizontal: 12, borderRadius: radius.full, backgroundColor: '#fff' },
  chipOn: { borderColor: colors.jade[500], backgroundColor: colors.jade[50] },
  chipLabel: { fontFamily: fonts.displayMedium, fontSize: 12, color: colors.sand[700] },
  chipLabelOn: { color: colors.jade[600], fontFamily: fonts.displaySemiBold },

  sticky: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: 30, backgroundColor: '#fff' },
})
