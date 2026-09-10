import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, radius } from '../theme/tokens'

export default function Splash({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.brand}>
        <View style={styles.logo}><Ionicons name="scan-outline" size={24} color="#fff" /></View>
        <Text style={styles.brandName}>NHÀ NÉT</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.kicker}>STUDIO NỘI DUNG CHO MÔI GIỚI</Text>
        <Text style={styles.title}>Từ bất động sản đến bài đăng chỉn chu.</Text>
        <Text style={styles.sub}>Quản lý hình ảnh, biên tập nội dung và đăng lên tài khoản đã kết nối trong một không gian làm việc.</Text>

        <Pressable
          style={styles.cta}
          onPress={() => navigation.navigate('PhoneAuth')}
        >
          <Text style={styles.ctaLabel}>Bắt đầu</Text>
          <Ionicons name="arrow-forward" size={19} color={colors.jade[900]} />
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.darkCanvas },
  brand: { marginTop: 64, paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  brandName: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 14, letterSpacing: 1.4 },
  content: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 28, paddingBottom: 18 },
  kicker: { color: colors.jade[200], fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1.2 },
  title: { marginTop: 9, fontSize: 32, fontFamily: fonts.displayBold, color: '#fff', lineHeight: 40 },
  sub: { fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.72)', marginTop: 12, maxWidth: 330 },
  cta: { marginTop: 28, minHeight: 56, backgroundColor: '#fff', borderRadius: radius.control, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ctaLabel: { color: colors.jade[900], fontFamily: fonts.displayBold, fontSize: 16 },
})
