import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { colors, fonts, radius } from '../theme/tokens'

const FRAMES = [
  { title: 'Chụp ảnh. AI lo phần còn lại.', sub: 'Bài đăng, video ngắn và caption tự động tạo từ ảnh căn hộ của bạn.' },
  { title: 'Video dựng sẵn trong vài phút.', sub: 'Chọn mẫu, AI ghép cảnh, thêm nhạc và giọng đọc tiếng Việt tự nhiên.' },
  { title: 'Đăng cùng lúc lên 3 nền tảng.', sub: 'TikTok, Facebook, Zalo — xem trước từng nền tảng trước khi đăng.' },
]

export default function Splash({ navigation }) {
  const [frame, setFrame] = useState(0)

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.eyebrow}>
        <Text style={styles.eyebrowLabel}>ẢNH THẬT · ĐẦU RA THẬT, KHÔNG MINH HOẠ</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.dots}>
          {FRAMES.map((_, i) => (
            <Pressable key={i} onPress={() => setFrame(i)} style={[styles.dot, i === frame && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.title}>{FRAMES[frame].title}</Text>
        <Text style={styles.sub}>{FRAMES[frame].sub}</Text>

        <Pressable
          style={styles.cta}
          onPress={() => (frame < FRAMES.length - 1 ? setFrame(frame + 1) : navigation.navigate('PhoneAuth'))}
        >
          <Text style={styles.ctaLabel}>Tiếp tục</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate('PhoneAuth')}>
          <Text style={styles.loginHint}>
            Đã có tài khoản? <Text style={styles.loginHintStrong}>Đăng nhập</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.darkCanvas },
  eyebrow: { marginTop: 64, paddingHorizontal: 24 },
  eyebrowLabel: { fontFamily: fonts.mono, fontSize: 10, color: 'rgba(255,255,255,0.7)' },

  content: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 28, paddingBottom: 8 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 22 },
  dot: { width: 10, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { width: 26, backgroundColor: '#fff' },

  title: { fontSize: 30, fontFamily: fonts.displayBold, color: '#fff', lineHeight: 35 },
  sub: { fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.75)', marginTop: 10, maxWidth: 300 },

  cta: { marginTop: 26, backgroundColor: colors.jade[500], paddingVertical: 16, borderRadius: radius.sheet, alignItems: 'center' },
  ctaLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 16 },
  loginHint: { textAlign: 'center', marginTop: 14, fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  loginHintStrong: { color: '#fff', fontFamily: fonts.displaySemiBold },
})
