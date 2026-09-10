import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../context/AuthContext'
import { colors, fonts, radius } from '../theme/tokens'

export default function EmptyState({ navigation }) {
  const { completeOnboarding } = useAuth()
  const finish = () => {
    completeOnboarding()
    navigation.replace('Dashboard')
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.iconTile}>
          <Ionicons name="scan-outline" size={42} color="#fff" />
        </View>
        <Text style={styles.eyebrow}>KHÔNG GIAN ĐÃ SẴN SÀNG</Text><Text style={styles.title}>Bắt đầu với bất động sản đầu tiên</Text>
        <Text style={styles.subtitle}>
          Thêm ảnh, nhập thông tin và duyệt nội dung trước khi chọn nơi đăng.
        </Text>
        <Pressable style={styles.cta} onPress={finish}>
          <Text style={styles.ctaLabel}>Vào không gian làm việc</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 40, alignItems: 'center' }, eyebrow: { color: colors.jade[600], fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1.1, marginTop: 26 },
  iconTile: { width: 104, height: 104, borderRadius: 30, backgroundColor: colors.jade[900], alignItems: 'center', justifyContent: 'center', marginTop: 36 },
  title: { fontSize: 22, fontFamily: fonts.displayBold, color: colors.sand[900], marginTop: 6, textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 21, color: colors.sand[600], marginTop: 8, textAlign: 'center', maxWidth: 270 },
  cta: { marginTop: 26, minHeight: 54, justifyContent: 'center', backgroundColor: colors.jade[700], paddingHorizontal: 22, borderRadius: radius.control },
  ctaLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 16 },
})
