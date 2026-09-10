import { useState } from 'react'
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { colors, fonts, radius } from '../theme/tokens'

const OPTIONS = [
  { key: 'active', label: 'Đang chào', detail: 'Tài sản đang được giới thiệu', icon: 'radio-button-on' },
  { key: 'paused', label: 'Tạm ngưng', detail: 'Giữ hồ sơ nhưng dừng chào bán hoặc cho thuê', icon: 'pause-circle-outline' },
  { key: 'sold', label: 'Đã bán', detail: 'Đánh dấu giao dịch bán đã hoàn tất', icon: 'checkmark-circle-outline' },
  { key: 'rented', label: 'Đã cho thuê', detail: 'Đánh dấu giao dịch thuê đã hoàn tất', icon: 'key-outline' },
  { key: 'archived', label: 'Lưu trữ', detail: 'Ẩn khỏi danh sách làm việc chính', icon: 'archive-outline' },
]

export default function ManageListing({ navigation, route }) {
  const { user } = useAuth()
  const { id, currentStatus = 'active', title = 'Bất động sản' } = route.params ?? {}
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const save = async (nextStatus) => {
    if (saving || nextStatus === status) return
    setSaving(true); setError(null)
    const { error: updateError } = await supabase.from('listings').update({ property_status: nextStatus, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id)
    if (updateError) setError(updateError.message.includes('property_status') ? 'Cơ sở dữ liệu chưa áp dụng migration trạng thái tài sản.' : 'Chưa thể cập nhật trạng thái.')
    else { setStatus(nextStatus); navigation.goBack() }
    setSaving(false)
  }

  const remove = () => Alert.alert('Xóa vĩnh viễn?', `“${title}” và lịch sử liên kết sẽ bị xóa. Hành động này không gỡ bài đã đăng trên mạng xã hội.`, [
    { text: 'Hủy', style: 'cancel' },
    { text: 'Xóa vĩnh viễn', style: 'destructive', onPress: async () => {
      setSaving(true); setError(null)
      const { data, error: deleteError } = await supabase.functions.invoke('delete-listing', { body: { listingId: id } })
      if (deleteError || data?.error) { setError(data?.error || 'Chưa thể xóa bất động sản.'); setSaving(false) }
      else navigation.popTo('Listings')
    } },
  ])

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <StatusBar style="dark" />
    <View style={styles.header}><Pressable accessibilityLabel="Quay lại" style={styles.back} onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={21} color={colors.text} /></Pressable><Text style={styles.headerTitle}>Quản lý tài sản</Text><View style={styles.spacer} /></View>
    <View style={styles.content}>
      <Text style={styles.eyebrow}>TRẠNG THÁI TÀI SẢN</Text><Text style={styles.title} numberOfLines={2}>{title}</Text>
      <Text style={styles.subtitle}>Trạng thái này chỉ dùng để quản lý hồ sơ. Thay đổi tại đây không tự sửa hoặc gỡ bài đã đăng.</Text>
      <View style={styles.list}>{OPTIONS.map((option) => {
        const active = status === option.key
        return <Pressable key={option.key} disabled={saving} style={[styles.option, active && styles.optionActive]} onPress={() => save(option.key)}>
          <View style={[styles.icon, active && styles.iconActive]}><Ionicons name={option.icon} size={21} color={active ? '#fff' : colors.jade[700]} /></View>
          <View style={styles.copy}><Text style={styles.optionTitle}>{option.label}</Text><Text style={styles.optionDetail}>{option.detail}</Text></View>
          {saving && !active ? null : <Ionicons name={active ? 'checkmark-circle' : 'chevron-forward'} size={20} color={active ? colors.success : colors.textMuted} />}
        </Pressable>
      })}</View>
      {saving && <ActivityIndicator color={colors.jade[700]} style={styles.loading} />}
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable disabled={saving} style={styles.deleteButton} onPress={remove}><Ionicons name="trash-outline" size={19} color={colors.error} /><Text style={styles.deleteText}>Xóa bất động sản</Text></Pressable>
    </View>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas }, header: { minHeight: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, headerTitle: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 15 }, spacer: { width: 48 },
  content: { padding: 20, paddingTop: 22 }, eyebrow: { color: colors.jade[700], fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1 }, title: { marginTop: 5, color: colors.text, fontFamily: fonts.displayBold, fontSize: 24, lineHeight: 31 }, subtitle: { marginTop: 7, color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  list: { marginTop: 22, gap: 9 }, option: { minHeight: 76, padding: 13, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 12 }, optionActive: { borderColor: colors.jade[200], backgroundColor: colors.jade[50] },
  icon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.jade[50], alignItems: 'center', justifyContent: 'center' }, iconActive: { backgroundColor: colors.jade[700] }, copy: { flex: 1 }, optionTitle: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 14 }, optionDetail: { marginTop: 2, color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  loading: { marginTop: 14 }, error: { marginTop: 14, color: colors.error, fontSize: 12.5 }, deleteButton: { marginTop: 24, minHeight: 52, borderRadius: radius.control, borderWidth: 1, borderColor: colors.error, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, deleteText: { color: colors.error, fontFamily: fonts.displaySemiBold, fontSize: 14 },
})
