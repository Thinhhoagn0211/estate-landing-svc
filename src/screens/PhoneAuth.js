import { useState } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { colors, fonts, radius } from '../theme/tokens'

export default function PhoneAuth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const canSubmit = email.trim().length > 3 && password.length >= 6 && !loading

  const submit = async () => {
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password)
      } else {
        await signUp(email.trim(), password)
      }
    } catch (e) {
      setError(e.message ?? 'Có lỗi xảy ra, thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>NHÀ NÉT WORKSPACE</Text><Text style={styles.title}>{mode === 'signin' ? 'Chào mừng bạn trở lại' : 'Bắt đầu đăng tin đẹp hơn'}</Text>
        <Text style={styles.subtitle}>
          {mode === 'signin' ? 'Đăng nhập bằng email và mật khẩu.' : 'Tạo tài khoản mới bằng email và mật khẩu.'}
        </Text>

        <View style={styles.segment}>
          <Pressable style={[styles.segmentItem, mode === 'signin' && styles.segmentItemActive]} onPress={() => setMode('signin')}>
            <Text style={[styles.segmentLabel, mode === 'signin' && styles.segmentLabelActive]}>Đăng nhập</Text>
          </Pressable>
          <Pressable style={[styles.segmentItem, mode === 'signup' && styles.segmentItemActive]} onPress={() => setMode('signup')}>
            <Text style={[styles.segmentLabel, mode === 'signup' && styles.segmentLabelActive]}>Đăng ký</Text>
          </Pressable>
        </View>

        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="ten@congty.vn"
          placeholderTextColor={colors.sand[400]}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.inputLabel}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          placeholder="Tối thiểu 6 ký tự"
          placeholderTextColor={colors.sand[400]}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button variant="primary" block loading={loading} disabled={!canSubmit} onPress={submit} style={{ marginTop: 20 }}>
          {mode === 'signin' ? 'Đăng nhập' : 'Đăng ký'}
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 24, paddingTop: 70 }, eyebrow: { color: colors.jade[600], letterSpacing: 1.1, fontFamily: fonts.displayBold, fontSize: 10 },
  title: { fontSize: 26, fontFamily: fonts.displayBold, color: colors.sand[900] },
  subtitle: { fontSize: 14, color: colors.sand[600], marginTop: 6 },

  segment: { marginTop: 24, backgroundColor: colors.sand[100], borderRadius: radius.sheet, padding: 5, flexDirection: 'row' },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  segmentItemActive: { backgroundColor: colors.sand[900] },
  segmentLabel: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.sand[600] },
  segmentLabelActive: { color: '#fff' },

  inputLabel: { marginTop: 18, marginBottom: 7, color: colors.textMuted, fontFamily: fonts.displaySemiBold, fontSize: 12.5 },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: colors.borderControl,
    borderRadius: radius.control,
    padding: 14,
    fontSize: 16,
    fontFamily: fonts.displaySemiBold,
    color: colors.sand[900],
  },

  error: { marginTop: 12, fontSize: 13, color: colors.error, fontFamily: fonts.displayMedium },
})
