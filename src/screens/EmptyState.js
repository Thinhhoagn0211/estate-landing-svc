import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
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
        <LinearGradient colors={[colors.jade[500], colors.jade[700]]} style={styles.iconTile}>
          <Ionicons name="camera" size={52} color="#fff" />
        </LinearGradient>
        <Text style={styles.title}>Chưa có tin đăng nào</Text>
        <Text style={styles.subtitle}>
          Chụp vài tấm ảnh căn hộ — AI sẽ lo phần caption, video và đăng bài. Bài đầu tiên chỉ mất khoảng 3 phút.
        </Text>
        <Pressable style={styles.cta} onPress={finish}>
          <Text style={styles.ctaLabel}>Tạo bài đăng đầu tiên</Text>
        </Pressable>
        <View style={styles.tutorial}>
          <Ionicons name="help-circle-outline" size={15} color={colors.sand[500]} />
          <Text style={styles.tutorialLabel}>Xem video hướng dẫn 40 giây</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand[50] },
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 40, alignItems: 'center' },
  iconTile: { width: 120, height: 120, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: 36 },
  title: { fontSize: 22, fontFamily: fonts.displayBold, color: colors.sand[900], marginTop: 26 },
  subtitle: { fontSize: 14, lineHeight: 21, color: colors.sand[600], marginTop: 8, textAlign: 'center', maxWidth: 270 },
  cta: { marginTop: 26, backgroundColor: colors.jade[500], paddingVertical: 15, paddingHorizontal: 26, borderRadius: radius.sheet },
  ctaLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 16 },
  tutorial: { marginTop: 30, flexDirection: 'row', alignItems: 'center', gap: 8 },
  tutorialLabel: { fontSize: 12.5, color: colors.sand[500] },
})
