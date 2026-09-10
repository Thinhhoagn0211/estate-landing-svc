import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, radius, shadow } from '../theme/tokens'

export default function Schedule({ navigation }) {
  return (
    <View style={styles.overlay}>
      <Pressable accessibilityLabel="Đóng" style={styles.backdrop} onPress={() => navigation.goBack()} />
      <SafeAreaView edges={['bottom']} style={styles.sheet}>
        <StatusBar style="dark" />
        <View style={styles.grabber} />
        <View style={styles.icon}><Ionicons name="calendar-outline" size={24} color={colors.jade[700]} /></View>
        <Text style={styles.overline}>LỊCH ĐĂNG</Text>
        <Text style={styles.title}>Chưa có lịch được thiết lập</Text>
        <Text style={styles.description}>Tính năng lên lịch chỉ xuất hiện khi hệ thống có thể lưu và thực thi lịch đăng. Nội dung hiện tại chưa bị thay đổi.</Text>
        <Pressable style={styles.button} onPress={() => navigation.goBack()}><Text style={styles.buttonText}>Quay lại nội dung</Text></Pressable>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(16,23,19,0.42)' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingTop: 14, ...shadow.e4 },
  grabber: { width: 38, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 22 },
  icon: { width: 50, height: 50, borderRadius: 16, backgroundColor: colors.jade[50], alignItems: 'center', justifyContent: 'center' },
  overline: { marginTop: 18, color: colors.jade[700], fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1 },
  title: { marginTop: 5, color: colors.text, fontFamily: fonts.displayBold, fontSize: 21, lineHeight: 28 },
  description: { marginTop: 7, color: colors.textMuted, fontSize: 12.5, lineHeight: 19 },
  button: { marginTop: 22, minHeight: 52, borderRadius: radius.control, backgroundColor: colors.jade[700], alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontFamily: fonts.displaySemiBold, fontSize: 15 },
})
