import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, radius, shadow } from '../theme/tokens'

const RESULTS = [
  { id: 'tiktok', label: 'TikTok', bg: '#000', mark: 'TT', status: 'success' },
  { id: 'zalo', label: 'Zalo OA', bg: '#0068ff', mark: 'Za', status: 'success' },
  {
    id: 'facebook',
    label: 'Facebook',
    bg: '#1877f2',
    mark: 'f',
    status: 'failed',
    error: 'Phiên đăng nhập Facebook đã hết hạn. Kết nối lại để đăng bài này.',
    recover: 'Kết nối lại Facebook',
  },
]

export default function PublishProgress({ navigation }) {
  const doneCount = RESULTS.filter((r) => r.status === 'success').length

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.head}>
        <Text style={styles.title}>Đang đăng bài…</Text>
        <Text style={styles.subtitle}>
          {doneCount}/{RESULTS.length} nền tảng hoàn tất
        </Text>
      </View>

      <View style={styles.list}>
        {RESULTS.map((r) =>
          r.status === 'success' ? (
            <View key={r.id} style={styles.row}>
              <View style={[styles.mark, { backgroundColor: r.bg }]}>
                <Text style={styles.markLabel}>{r.mark}</Text>
              </View>
              <Text style={styles.rowLabel}>{r.label}</Text>
              <View style={styles.successTag}>
                <Ionicons name="checkmark-circle" size={16} color={colors.jade[500]} />
                <Text style={styles.successLabel}>Thành công</Text>
              </View>
            </View>
          ) : (
            <View key={r.id} style={styles.failCard}>
              <View style={styles.row}>
                <View style={[styles.mark, { backgroundColor: r.bg }]}>
                  <Text style={styles.markLabel}>{r.mark}</Text>
                </View>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.failLabel}>Thất bại</Text>
              </View>
              <View style={styles.failMsgBox}>
                <Text style={styles.failMsg}>{r.error}</Text>
              </View>
              <Pressable style={[styles.recoverBtn, { backgroundColor: r.bg }]}>
                <Text style={styles.recoverLabel}>{r.recover}</Text>
              </Pressable>
            </View>
          )
        )}
      </View>

      <View style={styles.sticky}>
        <Pressable style={styles.doneBtn} onPress={() => navigation.popToTop()}>
          <Text style={styles.doneLabel}>Xong</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand[50] },
  head: { alignItems: 'center', marginTop: 20, paddingHorizontal: 24 },
  title: { fontSize: 21, fontFamily: fonts.displayBold, color: colors.sand[900] },
  subtitle: { fontSize: 13, color: colors.sand[600], marginTop: 4 },

  list: { marginTop: 26, paddingHorizontal: 24, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  markLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 12 },
  rowLabel: { flex: 1, fontSize: 14.5, fontFamily: fonts.displaySemiBold, color: colors.sand[900] },
  successTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  successLabel: { fontFamily: fonts.displayBold, fontSize: 12.5, color: colors.jade[600] },
  failLabel: { fontFamily: fonts.displayBold, fontSize: 12.5, color: colors.error },

  failCard: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.error, borderRadius: radius.sheet, padding: 15, ...shadow.e1 },
  failMsgBox: { marginTop: 10, backgroundColor: colors.errorBg, borderRadius: 10, padding: 10 },
  failMsg: { fontSize: 12.5, color: '#a02f2f', lineHeight: 18 },
  recoverBtn: { marginTop: 10, paddingVertical: 11, borderRadius: 11, alignItems: 'center' },
  recoverLabel: { fontFamily: fonts.displayBold, fontSize: 13.5, color: '#fff' },

  sticky: { position: 'absolute', left: 24, right: 24, bottom: 30 },
  doneBtn: { borderWidth: 1, borderColor: colors.sand[300], backgroundColor: '#fff', paddingVertical: 15, borderRadius: radius.sheet, alignItems: 'center' },
  doneLabel: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.sand[700] },
})
