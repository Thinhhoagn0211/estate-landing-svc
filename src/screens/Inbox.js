import { useCallback, useMemo, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, TextInput, Linking, Alert, Image, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import * as IntentLauncher from 'expo-intent-launcher'
import { useFocusEffect } from '@react-navigation/native'
import TabBar from '../components/TabBar'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { colors, fonts, radius, shadow } from '../theme/tokens'

function timeAgo(iso) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000))
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ`
  const days = Math.floor(hours / 24)
  return days < 7 ? `${days} ngày` : new Date(iso).toLocaleDateString('vi-VN')
}

function initials(senderId) {
  return senderId.slice(-2).toUpperCase()
}

export default function Inbox({ navigation }) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: queryError } = await supabase
      .from('messenger_conversations')
      .select('id, page_id, sender_id, sender_name, sender_avatar_url, external_conversation_id, last_message, last_message_at')
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false })
    setConversations(data ?? [])
    if (queryError) setError('Chưa thể tải tin nhắn Messenger.')
    setLoading(false)
  }, [user])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const syncHistory = async () => {
    setSyncing(true)
    setError(null)
    try {
      const { data, error: syncError } = await supabase.functions.invoke('facebook-sync-messenger')
      if (syncError || data?.error) throw new Error(data?.error ?? syncError.message)
      await load()
    } catch (syncError) {
      setError(syncError.message ?? 'Chưa thể đồng bộ lịch sử Messenger.')
    } finally {
      setSyncing(false)
    }
  }

  const visibleConversations = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return conversations
    return conversations.filter((item) => `${item.sender_name ?? ''} ${item.last_message} ${item.sender_id}`.toLowerCase().includes(needle))
  }, [conversations, query])

  const openConversation = async () => {
    try {
      if (Platform.OS === 'android') {
        IntentLauncher.openApplication('com.facebook.orca')
        return
      }
      await Linking.openURL('https://www.messenger.com/')
    } catch {
      Alert.alert('Chưa mở được Messenger', 'Hãy cài hoặc đăng nhập Messenger rồi thử lại.')
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.head}>
        <View><Text style={styles.eyebrow}>KHÁCH HÀNG</Text><Text style={styles.title}>Tin nhắn</Text><Text style={styles.subtitle}>Facebook Messenger · chạm để mở hộp thư</Text></View>
        <View style={styles.actions}>
          <Pressable style={styles.refresh} onPress={syncHistory} accessibilityLabel="Đồng bộ lịch sử Messenger">
            {syncing ? <ActivityIndicator size="small" color={colors.jade[600]} /> : <Ionicons name="cloud-download-outline" size={18} color={colors.sand[700]} />}
          </Pressable>
          <Pressable style={styles.refresh} onPress={load} accessibilityLabel="Làm mới tin nhắn"><Ionicons name="refresh" size={18} color={colors.sand[700]} /></Pressable>
        </View>
      </View>

      <View style={styles.search}><Ionicons name="search-outline" size={19} color={colors.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Tìm tên hoặc nội dung tin nhắn" placeholderTextColor={colors.textMuted} style={styles.searchInput} />{!!query && <Pressable accessibilityLabel="Xóa tìm kiếm" style={styles.clear} onPress={() => setQuery('')}><Ionicons name="close-circle" size={19} color={colors.textMuted} /></Pressable>}</View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator color={colors.jade[600]} style={{ marginTop: 28 }} />}
        {!loading && visibleConversations.map((conversation) => (
          <Pressable key={conversation.id} style={styles.card} onPress={openConversation} accessibilityLabel="Mở hộp thư Messenger">
            <View style={styles.avatar}>{conversation.sender_avatar_url ? <Image source={{ uri: conversation.sender_avatar_url }} style={styles.avatarImage} /> : <Text style={styles.avatarLabel}>{initials(conversation.sender_name || conversation.sender_id)}</Text>}</View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.rowTop}>
                <Text style={styles.name} numberOfLines={1}>{conversation.sender_name || 'Khách Messenger'}</Text>
                <Text style={styles.time}>{timeAgo(conversation.last_message_at)}</Text>
              </View>
              <Text style={styles.message} numberOfLines={2}>{conversation.last_message}</Text>
              <View style={styles.cardBottom}><View style={styles.tag}><Ionicons name="logo-facebook" size={10} color="#1877f2" /><Text style={styles.tagLabel}>Mở Messenger</Text></View><Ionicons name="open-outline" size={17} color={colors.jade[700]} /></View>
            </View>
          </Pressable>
        ))}

        {!loading && visibleConversations.length === 0 && !error && <View style={styles.empty}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.sand[500]} />
          <Text style={styles.emptyTitle}>{query ? 'Không tìm thấy hội thoại' : 'Chưa có tin nhắn Messenger'}</Text>
          <Text style={styles.emptyText}>{query ? 'Thử một từ khóa khác trong nội dung tin nhắn.' : 'Khi khách nhắn vào Facebook Page, hội thoại sẽ tự xuất hiện ở đây.'}</Text>
        </View>}
        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <TabBar active="chat" onNavigate={(key) => navigateTab(navigation, key)} />
    </SafeAreaView>
  )
}

function navigateTab(navigation, key) {
  if (key === 'home') navigation.navigate('Dashboard')
  if (key === 'listings') navigation.navigate('Listings')
  if (key === 'chat') navigation.navigate('Inbox')
  if (key === 'profile') navigation.navigate('Profile')
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  head: { paddingHorizontal: 20, paddingTop: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: colors.jade[600], letterSpacing: 1.1, fontFamily: fonts.displayBold, fontSize: 10 },
  title: { fontSize: 26, fontFamily: fonts.displayBold, color: colors.sand[900] },
  subtitle: { marginTop: 2, fontSize: 12, color: colors.sand[500] },
  actions: { flexDirection: 'row', gap: 8 }, refresh: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  search: { marginHorizontal: 20, marginTop: 16, minHeight: 52, paddingHorizontal: 14, borderRadius: radius.control, borderWidth: 1, borderColor: colors.borderControl, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 9 }, searchInput: { flex: 1, paddingVertical: 0, color: colors.text, fontFamily: fonts.display, fontSize: 15 }, clear: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20, paddingTop: 16, paddingBottom: 120, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: 14, flexDirection: 'row', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1877f2', overflow: 'hidden' }, avatarImage: { width: '100%', height: '100%' },
  avatarLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 14 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  name: { fontSize: 14.5, fontFamily: fonts.displayBold, color: colors.sand[900] },
  time: { fontSize: 11, color: colors.sand[500] },
  message: { fontSize: 13, color: colors.sand[600], marginTop: 3, lineHeight: 18 },
  cardBottom: { marginTop: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, tag: { alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 7, borderRadius: radius.full, backgroundColor: '#edf4ff', flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagLabel: { color: '#1877f2', fontFamily: fonts.displaySemiBold, fontSize: 9 },
  empty: { marginTop: 18, backgroundColor: '#fff', borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, padding: 28, alignItems: 'center' },
  emptyTitle: { marginTop: 10, fontSize: 14, fontFamily: fonts.displayBold, color: colors.sand[800] },
  emptyText: { marginTop: 4, fontSize: 12, lineHeight: 18, color: colors.sand[500], textAlign: 'center' },
  error: { marginTop: 12, color: colors.error, fontSize: 12 },
})
