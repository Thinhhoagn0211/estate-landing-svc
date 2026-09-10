import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import TabBar from '../components/TabBar'
import { useAuth } from '../context/AuthContext'
import { colors, fonts, radius } from '../theme/tokens'

const MENU = [
  { key: 'channels', icon: 'share-social-outline', title: 'Kênh đăng', subtitle: 'Tài khoản và khả năng xuất bản', route: 'ConnectChannels' },
  { key: 'settings', icon: 'options-outline', title: 'Cài đặt', subtitle: 'Kênh đăng và phiên đăng nhập', route: 'Settings' },
]

function nameFor(user) {
  return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Tài khoản của bạn'
}

export default function Profile({ navigation }) {
  const { user } = useAuth()
  const name = nameFor(user)
  const email = user?.email && !user.email.endsWith('@nhanet.local') ? user.email : 'Môi giới cá nhân'

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.overline}>KHÔNG GIAN CỦA BẠN</Text>
        <Text style={styles.title}>Tài khoản</Text>

        <View style={styles.identity}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{name === 'Tài khoản của bạn' ? 'NN' : name.slice(0, 2).toUpperCase()}</Text></View>
          <View style={styles.identityCopy}><Text style={styles.name} numberOfLines={1}>{name}</Text><Text style={styles.role} numberOfLines={1}>{email}</Text></View>
        </View>

        <Text style={styles.sectionLabel}>CÔNG VIỆC</Text>
        <View style={styles.menu}>
          {MENU.map((item, index) => (
            <Pressable accessibilityRole="button" key={item.key} style={({ pressed }) => [styles.menuItem, index < MENU.length - 1 && styles.menuBorder, pressed && styles.pressed]} onPress={() => navigation.navigate(item.route)}>
              <View style={styles.menuIcon}><Ionicons name={item.icon} size={21} color={colors.jade[700]} /></View>
              <View style={styles.menuCopy}><Text style={styles.menuTitle}>{item.title}</Text><Text style={styles.menuSubtitle}>{item.subtitle}</Text></View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <View style={styles.note}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.jade[700]} />
          <View style={styles.noteCopy}><Text style={styles.noteTitle}>Bạn kiểm soát nội dung trước khi đăng</Text><Text style={styles.noteText}>Nhà Nét chỉ gửi bài khi bạn xác nhận ở bước cuối.</Text></View>
        </View>
      </ScrollView>
      <TabBar active="profile" onNavigate={(key) => navigateTab(navigation, key)} />
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
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 108 },
  overline: { color: colors.jade[700], fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1.1 },
  title: { marginTop: 2, color: colors.text, fontFamily: fonts.displayBold, fontSize: 27 },
  identity: { marginTop: 22, borderRadius: 20, backgroundColor: colors.jade[900], padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatar: { width: 58, height: 58, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.13)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 17 },
  identityCopy: { flex: 1 },
  name: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 19 },
  role: { marginTop: 3, color: colors.jade[100], fontSize: 12.5 },
  sectionLabel: { marginTop: 30, marginBottom: 10, color: colors.textMuted, fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1 },
  menu: { backgroundColor: colors.surface, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  menuItem: { minHeight: 76, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.jade[50], alignItems: 'center', justifyContent: 'center' },
  menuCopy: { flex: 1 },
  menuTitle: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 14.5 },
  menuSubtitle: { marginTop: 2, color: colors.textMuted, fontSize: 11.5 },
  pressed: { opacity: 0.76 },
  note: { marginTop: 16, padding: 16, borderRadius: radius.card, backgroundColor: colors.jade[50], flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  noteCopy: { flex: 1 },
  noteTitle: { color: colors.jade[800], fontFamily: fonts.displaySemiBold, fontSize: 13 },
  noteText: { marginTop: 3, color: colors.jade[700], fontSize: 11.5, lineHeight: 17 },
})
