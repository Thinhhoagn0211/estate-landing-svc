import { View, Text, Pressable, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useListingDraft } from '../context/ListingDraftContext'
import { colors, fonts, radius } from '../theme/tokens'

function formatSavedTime(value) {
  if (!value) return 'Đã lưu trên thiết bị'
  return `Đã lưu ${new Date(value).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}`
}

export default function StartCreate({ navigation }) {
  const { hasDraft, details, photos, photoUrls, updatedAt, editingListingId, reset } = useListingDraft()

  const startNew = () => {
    const proceed = async () => {
      await reset()
      navigation.replace('Capture')
    }
    if (!hasDraft) return proceed()
    Alert.alert('Bắt đầu bản mới?', 'Bản nháp hiện tại sẽ bị xóa khỏi thiết bị.', [
      { text: 'Giữ bản nháp', style: 'cancel' },
      { text: 'Xóa và tạo mới', style: 'destructive', onPress: proceed },
    ])
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Đóng" style={styles.close} onPress={() => navigation.goBack()}><Ionicons name="close" size={22} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Tạo nội dung</Text><View style={styles.spacer} />
      </View>
      <View style={styles.content}>
        <Text style={styles.eyebrow}>BẮT ĐẦU</Text>
        <Text style={styles.title}>Bạn muốn làm gì?</Text>
        <Text style={styles.subtitle}>Tạo hồ sơ mới hoặc dùng lại thông tin đã lưu để soạn bài nhanh hơn.</Text>

        {hasDraft && (
          <Pressable style={styles.resume} onPress={() => navigation.navigate(editingListingId ? 'PropertyDetails' : 'Capture')}>
            <View style={styles.resumeIcon}><Ionicons name="document-text-outline" size={23} color={colors.jade[700]} /></View>
            <View style={styles.optionCopy}><Text style={styles.resumeKicker}>TIẾP TỤC BẢN NHÁP</Text><Text style={styles.optionTitle} numberOfLines={1}>{details.title || 'Bất động sản chưa đặt tên'}</Text><Text style={styles.optionMeta}>{photos.length + photoUrls.length} ảnh · {formatSavedTime(updatedAt)}</Text></View>
            <Ionicons name="arrow-forward" size={20} color={colors.jade[700]} />
          </Pressable>
        )}

        <View style={styles.options}>
          <Pressable style={styles.option} onPress={startNew}>
            <View style={styles.optionIcon}><Ionicons name="add" size={23} color="#fff" /></View>
            <View style={styles.optionCopy}><Text style={styles.optionTitle}>Thêm bất động sản mới</Text><Text style={styles.optionMeta}>Bắt đầu bằng ảnh và thông tin tài sản</Text></View>
            <Ionicons name="chevron-forward" size={19} color={colors.textMuted} />
          </Pressable>
          <Pressable style={styles.option} onPress={() => navigation.navigate('Listings', { selectMode: true })}>
            <View style={[styles.optionIcon, styles.optionIconSoft]}><Ionicons name="albums-outline" size={22} color={colors.jade[700]} /></View>
            <View style={styles.optionCopy}><Text style={styles.optionTitle}>Dùng bất động sản đã lưu</Text><Text style={styles.optionMeta}>Soạn nội dung mới mà không nhập lại</Text></View>
            <Ionicons name="chevron-forward" size={19} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: 20, minHeight: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  close: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 15 }, spacer: { width: 48 },
  content: { padding: 20, paddingTop: 28 },
  eyebrow: { color: colors.jade[700], fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1.1 },
  title: { marginTop: 4, color: colors.text, fontFamily: fonts.displayBold, fontSize: 28, lineHeight: 36 },
  subtitle: { marginTop: 7, color: colors.textMuted, fontSize: 14, lineHeight: 21, maxWidth: 330 },
  resume: { marginTop: 28, minHeight: 94, padding: 15, borderRadius: radius.card, backgroundColor: colors.jade[50], borderWidth: 1, borderColor: colors.jade[100], flexDirection: 'row', alignItems: 'center', gap: 12 },
  resumeIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  resumeKicker: { color: colors.jade[700], fontFamily: fonts.displayBold, fontSize: 9.5, letterSpacing: .8 },
  options: { marginTop: 18, gap: 12 },
  option: { minHeight: 88, padding: 15, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionIcon: { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.jade[800], alignItems: 'center', justifyContent: 'center' },
  optionIconSoft: { backgroundColor: colors.jade[50] }, optionCopy: { flex: 1 },
  optionTitle: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 15 },
  optionMeta: { marginTop: 3, color: colors.textMuted, fontSize: 11.5, lineHeight: 17 },
})
