import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import Button from '../components/Button'
import { colors, fonts, radius, shadow } from '../theme/tokens'

const OPTIONS = [
  { key: 'now', title: 'Đăng ngay' },
  { key: 'optimal', title: 'Giờ vàng — 20:00 hôm nay', sub: 'Đăng lúc 20:00 được xem gấp 2,3×' },
  { key: 'custom', title: 'Chọn thời gian khác' },
]

export default function Schedule({ navigation }) {
  const [choice, setChoice] = useState('optimal')
  const [recurring, setRecurring] = useState(false)

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={() => navigation.goBack()} />
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <StatusBar style="dark" />
        <View style={styles.grabber} />
        <Text style={styles.title}>Chọn thời gian đăng</Text>

        <View style={styles.options}>
          {OPTIONS.map((o) => {
            const isActive = choice === o.key
            return (
              <Pressable key={o.key} onPress={() => setChoice(o.key)} style={[styles.option, isActive && styles.optionActive]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{o.title}</Text>
                  {o.sub && <Text style={styles.optionSub}>{o.sub}</Text>}
                </View>
                <View style={[styles.radio, isActive && styles.radioActive]} />
              </Pressable>
            )
          })}

          <Pressable style={styles.option} onPress={() => setRecurring((r) => !r)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>Lặp lại hàng tuần</Text>
              <Text style={styles.optionSubMuted}>Đăng lại tự động mỗi thứ 6</Text>
            </View>
            <View style={[styles.toggle, recurring && styles.toggleOn]}>
              <View style={[styles.toggleKnob, recurring && styles.toggleKnobOn]} />
            </View>
          </Pressable>
        </View>

        <Button variant="primary" block onPress={() => navigation.goBack()} style={{ marginTop: 8 }}>
          Xác nhận lịch đăng
        </Button>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(26,23,18,0.4)' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingTop: 14, ...shadow.e4 },
  grabber: { width: 38, height: 5, borderRadius: 3, backgroundColor: colors.sand[300], alignSelf: 'center', marginBottom: 18 },
  title: { fontSize: 19, fontFamily: fonts.displayBold, color: colors.sand[900] },

  options: { marginTop: 14, gap: 10 },
  option: { borderWidth: 1.5, borderColor: colors.sand[300], borderRadius: radius.sheet, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionActive: { borderColor: colors.jade[500], backgroundColor: colors.jade[50] },
  optionTitle: { fontSize: 14.5, fontFamily: fonts.displaySemiBold, color: colors.sand[900] },
  optionSub: { fontSize: 12, color: colors.jade[600], marginTop: 2 },
  optionSubMuted: { fontSize: 12, color: colors.sand[500], marginTop: 2 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.sand[300] },
  radioActive: { borderWidth: 6, borderColor: colors.jade[500] },

  toggle: { width: 38, height: 22, borderRadius: 11, backgroundColor: colors.sand[300], justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.jade[500] },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', marginLeft: 2 },
  toggleKnobOn: { marginLeft: 18 },
})
