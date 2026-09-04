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
        <Text style={styles.title}>{mode === 'signin' ? 'Đăng nhập' : 'Tạo tài khoản'}</Text>
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

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.sand[400]}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[styles.input, { marginTop: 12 }]}
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          placeholderTextColor={colors.sand[400]}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button variant="primary" block disabled={!canSubmit} onPress={submit} style={{ marginTop: 20 }}>
          {loading ? <ActivityIndicator color="#fff" /> : mode === 'signin' ? 'Đăng nhập' : 'Đăng ký'}
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 28, paddingTop: 74 },
  title: { fontSize: 26, fontFamily: fonts.displayBold, color: colors.sand[900] },
  subtitle: { fontSize: 14, color: colors.sand[600], marginTop: 6 },

  segment: { marginTop: 24, backgroundColor: colors.sand[100], borderRadius: radius.sheet, padding: 5, flexDirection: 'row' },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  segmentItemActive: { backgroundColor: colors.sand[900] },
  segmentLabel: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.sand[600] },
  segmentLabelActive: { color: '#fff' },

  input: {
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: colors.sand[300],
    borderRadius: radius.sheet,
    padding: 14,
    fontSize: 16,
    fontFamily: fonts.displaySemiBold,
    color: colors.sand[900],
  },

  error: { marginTop: 12, fontSize: 13, color: colors.error, fontFamily: fonts.displayMedium },
})
