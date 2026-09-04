import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { colors, fonts, radius } from '../theme/tokens'

function Toggle({ on, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.toggle, on && styles.toggleOn]}>
      <View style={[styles.toggleKnob, on && styles.toggleKnobOn]} />
    </Pressable>
  )
}

export default function Settings({ navigation }) {
  const { logout } = useAuth()
  const [lang, setLang] = useState('vi')
  const [pushOn, setPushOn] = useState(true)
  const [goldenHourOn, setGoldenHourOn] = useState(true)

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <Pressable style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={20} color={colors.sand[900]} />
      </Pressable>

      <View style={styles.content}>
        <Text style={styles.title}>Cài đặt</Text>

        <Text style={styles.groupLabel}>Ngôn ngữ</Text>
        <View style={styles.segment}>
          <Pressable style={[styles.segmentItem, lang === 'vi' && styles.segmentItemActive]} onPress={() => setLang('vi')}>
            <Text style={[styles.segmentLabel, lang === 'vi' && styles.segmentLabelActive]}>Tiếng Việt</Text>
          </Pressable>
          <Pressable style={[styles.segmentItem, lang === 'en' && styles.segmentItemActive]} onPress={() => setLang('en')}>
            <Text style={[styles.segmentLabel, lang === 'en' && styles.segmentLabelActive]}>English</Text>
          </Pressable>
        </View>

        <Text style={styles.groupLabel}>Kênh & thông báo</Text>
        <View style={styles.card}>
          <Pressable style={[styles.row, styles.rowBorder]} onPress={() => navigation.navigate('ConnectChannels')}>
            <Text style={styles.rowLabel}>Kênh đã kết nối</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.sand[500]} />
          </Pressable>
          <View style={[styles.row, styles.rowBorder]}>
            <Text style={styles.rowLabel}>Thông báo đẩy</Text>
            <Toggle on={pushOn} onPress={() => setPushOn((v) => !v)} />
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Gợi ý giờ vàng</Text>
            <Toggle on={goldenHourOn} onPress={() => setGoldenHourOn((v) => !v)} />
          </View>
        </View>

        <Pressable onPress={logout}>
          <Text style={styles.logout}>Đăng xuất</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand[50] },
  back: { width: 38, height: 38, borderRadius: 19, marginLeft: 20, marginTop: 4, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingTop: 6 },
  title: { fontSize: 24, fontFamily: fonts.displayBold, color: colors.sand[900] },

  groupLabel: { marginTop: 18, fontSize: 12, fontFamily: fonts.displaySemiBold, color: colors.sand[500], textTransform: 'uppercase', letterSpacing: 0.5 },
  segment: { marginTop: 8, backgroundColor: '#fff', borderRadius: radius.sheet, padding: 5, flexDirection: 'row' },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10 },
  segmentItemActive: { backgroundColor: colors.sand[900] },
  segmentLabel: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.sand[600] },
  segmentLabelActive: { color: '#fff' },

  card: { marginTop: 8, backgroundColor: '#fff', borderRadius: radius.sheet, overflow: 'hidden' },
  row: { paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.sand[100] },
  rowLabel: { fontSize: 14, fontFamily: fonts.displayMedium, color: colors.sand[900] },

  toggle: { width: 38, height: 22, borderRadius: 11, backgroundColor: colors.sand[300], justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.jade[500] },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', marginLeft: 2 },
  toggleKnobOn: { marginLeft: 18 },

  logout: { marginTop: 20, textAlign: 'center', fontSize: 13, fontFamily: fonts.displaySemiBold, color: colors.error },
})
