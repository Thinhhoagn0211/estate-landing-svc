import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { colors, fonts, radius } from '../theme/tokens'

const ITEMS = [
  { key: 'channels', icon: 'share-social-outline', title: 'Kênh đăng', subtitle: 'Quản lý Facebook Page đã kết nối', route: 'ConnectChannels' },
]

export default function Settings({ navigation }) {
  const { logout } = useAuth()

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" style={styles.back} onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={21} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Cài đặt</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.overline}>TÙY CHỌN</Text>
        <Text style={styles.title}>Quản lý không gian làm việc</Text>
        <Text style={styles.subtitle}>Các cài đặt chỉ xuất hiện khi chúng được lưu và áp dụng thật.</Text>

        <Text style={styles.groupLabel}>CÔNG VIỆC</Text>
        <View style={styles.card}>
          {ITEMS.map((item) => (
            <Pressable key={item.key} style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={() => navigation.navigate(item.route)}>
              <View style={styles.rowIcon}><Ionicons name={item.icon} size={21} color={colors.jade[700]} /></View>
              <View style={styles.rowCopy}><Text style={styles.rowTitle}>{item.title}</Text><Text style={styles.rowSubtitle}>{item.subtitle}</Text></View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.groupLabel}>PHIÊN ĐĂNG NHẬP</Text>
        <View style={styles.sessionCard}>
          <View style={styles.sessionIcon}><Ionicons name="shield-checkmark-outline" size={21} color={colors.jade[700]} /></View>
          <View style={styles.sessionCopy}><Text style={styles.sessionTitle}>Tài khoản đang hoạt động</Text><Text style={styles.sessionText}>Bản nháp chưa đồng bộ có thể chỉ tồn tại trên thiết bị này.</Text></View>
        </View>

        <Pressable accessibilityRole="button" style={styles.logout} onPress={logout}><Ionicons name="log-out-outline" size={20} color={colors.error} /><Text style={styles.logoutText}>Đăng xuất</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: 20, paddingTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 15 },
  spacer: { width: 48 },
  content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 40 },
  overline: { color: colors.jade[700], fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1.1 },
  title: { marginTop: 4, color: colors.text, fontFamily: fonts.displayBold, fontSize: 25, lineHeight: 32 },
  subtitle: { marginTop: 6, color: colors.textMuted, fontSize: 12.5, lineHeight: 18 },
  groupLabel: { marginTop: 30, marginBottom: 10, color: colors.textMuted, fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 0.9 },
  card: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  row: { minHeight: 76, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  pressed: { opacity: 0.76 },
  rowIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.jade[50], alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1 },
  rowTitle: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 14 },
  rowSubtitle: { marginTop: 2, color: colors.textMuted, fontSize: 11.5 },
  sessionCard: { padding: 15, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  sessionIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.jade[50], alignItems: 'center', justifyContent: 'center' },
  sessionCopy: { flex: 1 },
  sessionTitle: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 13.5 },
  sessionText: { marginTop: 3, color: colors.textMuted, fontSize: 11.5, lineHeight: 17 },
  logout: { marginTop: 18, minHeight: 52, borderRadius: radius.control, borderWidth: 1, borderColor: '#E7B9B3', backgroundColor: colors.errorBg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoutText: { color: colors.error, fontFamily: fonts.displaySemiBold, fontSize: 14 },
})
