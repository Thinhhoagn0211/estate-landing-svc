import { useCallback, useState } from 'react'
import { View, Text, Pressable, ActivityIndicator, Alert, StyleSheet, Switch, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useFocusEffect } from '@react-navigation/native'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { connectFacebook } from '../lib/facebookAuth'
import { colors, fonts, radius } from '../theme/tokens'

const PLATFORM_META = {
  facebook: { label: 'Facebook Page', mark: 'f', bg: '#1877f2', comingSoon: false },
}
const ORDER = ['facebook']
const CONNECT_HANDLERS = { facebook: connectFacebook }

export default function ConnectChannels({ navigation }) {
  const { needsOnboarding, user } = useAuth()
  const [connections, setConnections] = useState({})
  const [connecting, setConnecting] = useState(null)
  const [disconnecting, setDisconnecting] = useState(null)
  const [error, setError] = useState(null)
  const [autoReply, setAutoReply] = useState({ enabled: false, reply_text: 'Cảm ơn bạn đã quan tâm. Chúng tôi sẽ phản hồi sớm nhất!' })
  const [savingAutoReply, setSavingAutoReply] = useState(false)

  const fetchConnections = useCallback(async () => {
    if (!user) return
    const { data } = await supabase.from('connected_channels_public').select('*').eq('user_id', user.id)
    const map = {}
    for (const row of data ?? []) map[row.platform] = row
    setConnections(map)
    const { data: reply } = await supabase.from('messenger_auto_replies').select('enabled, reply_text').eq('user_id', user.id).maybeSingle()
    if (reply) setAutoReply(reply)
  }, [user])

  useFocusEffect(
    useCallback(() => {
      fetchConnections()
    }, [fetchConnections])
  )

  const canEnter = Object.keys(connections).length > 0

  const handleConnect = async (key) => {
    const connectFn = CONNECT_HANDLERS[key]
    if (!connectFn) return
    setError(null)
    setConnecting(key)
    try {
      await connectFn()
      await fetchConnections()
    } catch (e) {
      setError(e.message ?? 'Không kết nối được, thử lại sau.')
    } finally {
      setConnecting(null)
    }
  }

  const doDisconnect = async (key) => {
    setError(null)
    setDisconnecting(key)
    try {
      const { error: deleteError } = await supabase.from('connected_channels').delete().eq('user_id', user.id).eq('platform', key)
      if (deleteError) throw deleteError
      await fetchConnections()
    } catch (e) {
      setError(e.message ?? 'Không ngắt kết nối được, thử lại sau.')
    } finally {
      setDisconnecting(null)
    }
  }

  const handleDisconnect = (key) => {
    const meta = PLATFORM_META[key]
    Alert.alert('Ngắt kết nối', `Ngắt kết nối ${meta.label}?`, [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Ngắt kết nối', style: 'destructive', onPress: () => doDisconnect(key) },
    ])
  }

  const saveAutoReply = async (patch) => {
    if (!user || !connections.facebook) return
    const next = { ...autoReply, ...patch }
    setAutoReply(next)
    setSavingAutoReply(true)
    try {
      const { error: saveError } = await supabase.from('messenger_auto_replies').upsert({ user_id: user.id, ...next, updated_at: new Date().toISOString() })
      if (saveError) throw saveError
    } catch (e) {
      setError(e.message ?? 'Không lưu được cài đặt trả lời tự động.')
    } finally {
      setSavingAutoReply(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Kết nối kênh đăng bài</Text>
        <Text style={styles.subtitle}>Kết nối ít nhất 1 kênh để bắt đầu đăng bài.</Text>

        <View style={styles.list}>
          {ORDER.map((key) => {
            const meta = PLATFORM_META[key]
            const conn = connections[key]
            const isConnecting = connecting === key
            const isDisconnecting = disconnecting === key
            return (
              <View key={key} style={[styles.row, conn && styles.rowConnected]}>
                <View style={[styles.mark, { backgroundColor: meta.bg }]}>
                  <Text style={styles.markLabel}>{meta.mark}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{meta.label}</Text>
                  <Text style={[styles.rowStatus, conn && { color: colors.jade[600] }]}>
                    {meta.comingSoon
                        ? 'Sắp ra mắt'
                        : conn
                          ? `${conn.display_name ?? ''} · Đã kết nối`
                          : 'Chưa kết nối'}
                  </Text>
                </View>
                {conn ? (
                  isDisconnecting ? (
                    <ActivityIndicator color={colors.error} />
                  ) : (
                    <Pressable style={styles.disconnectBtn} onPress={() => handleDisconnect(key)}>
                      <Text style={styles.disconnectBtnLabel}>Ngắt kết nối</Text>
                    </Pressable>
                  )
                ) : meta.comingSoon ? null : isConnecting ? (
                  <ActivityIndicator color={colors.jade[600]} />
                ) : (
                  <Pressable style={styles.connectBtn} onPress={() => handleConnect(key)}>
                    <Text style={styles.connectBtnLabel}>Kết nối</Text>
                  </Pressable>
                )}
              </View>
            )
          })}
        </View>

        {connections.facebook && (
          <View style={styles.autoReplyCard}>
            <View style={styles.autoReplyHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.autoReplyTitle}>Trả lời Messenger tự động</Text>
                <Text style={styles.autoReplySub}>Chỉ phản hồi khi khách chủ động nhắn tin cho Page.</Text>
              </View>
              <Switch value={autoReply.enabled} onValueChange={(enabled) => saveAutoReply({ enabled })} disabled={savingAutoReply} trackColor={{ true: colors.jade[500] }} />
            </View>
            <TextInput
              style={styles.autoReplyInput}
              multiline
              value={autoReply.reply_text}
              onChangeText={(reply_text) => setAutoReply((current) => ({ ...current, reply_text }))}
              onBlur={() => saveAutoReply({})}
              placeholder="Nội dung trả lời tự động"
              maxLength={1000}
            />
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.sticky}>
        <Button
          variant="primary"
          block
          disabled={!canEnter}
          onPress={() => {
            if (needsOnboarding) {
              navigation.navigate('EmptyState')
            } else if (navigation.canGoBack()) {
              navigation.goBack()
            } else {
              navigation.navigate('Settings')
            }
          }}
        >
          {needsOnboarding ? 'Vào ứng dụng' : 'Xong'}
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

  list: { marginTop: 24, gap: 12 },
  row: { borderWidth: 1.5, borderColor: colors.sand[300], borderRadius: radius.sheet, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowConnected: { borderColor: colors.jade[100], backgroundColor: colors.jade[50] },
  mark: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  markLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 13 },
  rowLabel: { fontSize: 15, fontFamily: fonts.displayBold, color: colors.sand[900] },
  rowStatus: { fontSize: 12, color: colors.sand[500], marginTop: 1 },
  connectBtn: { borderWidth: 1, borderColor: colors.jade[500], paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.full },
  connectBtnLabel: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.jade[600] },
  disconnectBtn: { borderWidth: 1, borderColor: colors.sand[300], paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.full },
  disconnectBtnLabel: { fontFamily: fonts.displaySemiBold, fontSize: 12, color: colors.error },

  error: { marginTop: 16, fontSize: 13, color: colors.error, fontFamily: fonts.displayMedium },
  autoReplyCard: { marginTop: 20, borderRadius: radius.sheet, padding: 16, backgroundColor: colors.sand[100] },
  autoReplyHead: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  autoReplyTitle: { fontSize: 15, fontFamily: fonts.displayBold, color: colors.sand[900] },
  autoReplySub: { marginTop: 3, fontSize: 12, lineHeight: 17, color: colors.sand[600] },
  autoReplyInput: { minHeight: 76, marginTop: 14, padding: 12, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.sand[300], fontSize: 13, lineHeight: 18, color: colors.sand[900], textAlignVertical: 'top' },

  sticky: { padding: 28, paddingTop: 0, paddingBottom: 30 },
})
