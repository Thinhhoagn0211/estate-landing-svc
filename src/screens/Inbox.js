import { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import TabBar from '../components/TabBar'
import { colors, fonts, radius, shadow } from '../theme/tokens'

const FILTERS = ['Tất cả · 9', 'Mới · 3', 'Đã liên hệ', 'Hẹn xem nhà']

const LEADS = [
  {
    id: 1,
    name: 'Thu Hà',
    initials: 'TH',
    avatarColors: ['#dd9426', '#a86410'],
    time: '2 phút',
    message: 'Chào anh, căn này còn thương lượng giá không ạ?',
    platform: 'TikTok',
    platformBg: '#000',
    status: 'Mới',
    statusBg: colors.amber[50],
    statusColor: colors.amber[700],
  },
  {
    id: 2,
    name: 'Đức Long',
    initials: 'DL',
    avatarColors: ['#1877f2', '#0d5b49'],
    time: '1 giờ',
    message: 'Mai mình xem nhà lúc 10h được không?',
    platform: 'Facebook',
    platformBg: '#1877f2',
    status: 'Hẹn xem nhà',
    statusBg: colors.jade[50],
    statusColor: colors.jade[600],
  },
  {
    id: 3,
    name: 'Ngọc Vy',
    initials: 'NV',
    time: 'Hôm qua',
    message: 'Cảm ơn anh, em đã thuê chỗ khác rồi ạ.',
    platform: 'Zalo',
    platformBg: '#0068ff',
    status: 'Đã đóng',
    statusBg: colors.sand[100],
    statusColor: colors.sand[600],
    closed: true,
  },
]

export default function Inbox({ navigation }) {
  const [filter, setFilter] = useState(FILTERS[0])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.head}>
        <Text style={styles.title}>Tin nhắn</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
              <Text style={[styles.filterLabel, filter === f && styles.filterLabelActive]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {LEADS.map((l) => (
          <View key={l.id} style={[styles.card, l.closed && { opacity: 0.7 }]}>
            <View style={[styles.avatar, { backgroundColor: l.avatarColors ? l.avatarColors[0] : colors.sand[500] }]}>
              <Text style={styles.avatarLabel}>{l.initials}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.rowTop}>
                <Text style={styles.name}>{l.name}</Text>
                <Text style={styles.time}>{l.time}</Text>
              </View>
              <Text style={styles.message} numberOfLines={1}>
                {l.message}
              </Text>
              <View style={styles.tagRow}>
                <View style={[styles.platformTag, { backgroundColor: l.platformBg }]}>
                  <Text style={styles.platformTagLabel}>{l.platform}</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: l.statusBg }]}>
                  <Text style={[styles.statusTagLabel, { color: l.statusColor }]}>{l.status}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.aiSuggestion}>
          <Ionicons name="star" size={16} color={colors.jade[600]} style={{ marginTop: 1 }} />
          <Text style={styles.aiSuggestionText}>
            <Text style={styles.aiSuggestionStrong}>Gợi ý trả lời từ AI: </Text>
            "Chào Thu Hà, giá vẫn có thể thương lượng một chút, mình nhắn riêng nhé!"
          </Text>
        </View>
      </ScrollView>

      <TabBar active="chat" onNavigate={(k) => navigateTab(navigation, k)} onCreate={() => navigation.navigate('Capture')} />
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
  safe: { flex: 1, backgroundColor: colors.sand[50] },
  head: { paddingHorizontal: 20 },
  title: { fontSize: 26, fontFamily: fonts.displayBold, color: colors.sand[900] },
  filterRow: { marginTop: 12 },
  filterChip: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.sand[300], paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.full, marginRight: 8 },
  filterChipActive: { backgroundColor: colors.sand[900], borderColor: colors.sand[900] },
  filterLabel: { fontFamily: fonts.displayMedium, fontSize: 12.5, color: colors.sand[700] },
  filterLabelActive: { color: '#fff', fontFamily: fonts.displaySemiBold },

  list: { padding: 20, paddingTop: 12, paddingBottom: 120, gap: 10 },
  card: { backgroundColor: '#fff', borderRadius: radius.sheet, padding: 13, flexDirection: 'row', gap: 12, ...shadow.e1 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 15 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 14.5, fontFamily: fonts.displayBold, color: colors.sand[900] },
  time: { fontSize: 11, color: colors.sand[500] },
  message: { fontSize: 13, color: colors.sand[600], marginTop: 2 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  platformTag: { paddingVertical: 2, paddingHorizontal: 5, borderRadius: 4 },
  platformTagLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 8 },
  statusTag: { paddingVertical: 2, paddingHorizontal: 7, borderRadius: 5 },
  statusTagLabel: { fontFamily: fonts.displayBold, fontSize: 10 },

  aiSuggestion: { marginTop: 4, backgroundColor: colors.jade[50], borderWidth: 1, borderColor: colors.jade[100], borderStyle: 'dashed', borderRadius: radius.sheet, padding: 13, flexDirection: 'row', gap: 10 },
  aiSuggestionText: { flex: 1, fontSize: 12.5, lineHeight: 18, color: colors.jade[600] },
  aiSuggestionStrong: { fontFamily: fonts.displaySemiBold },
})
