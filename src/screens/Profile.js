import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import TabBar from '../components/TabBar'
import { colors, fonts, radius, shadow } from '../theme/tokens'

const MENU = [
  { key: 'subscription', label: 'Gói & tín dụng', route: 'Subscription' },
  { key: 'channels', label: 'Kênh đã kết nối', route: 'ConnectChannels' },
  { key: 'settings', label: 'Cài đặt', route: 'Settings' },
]

export default function Profile({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLabel}>MT</Text>
          </View>
          <Text style={styles.name}>Minh Trần</Text>
          <Text style={styles.role}>Môi giới cá nhân · Bình Thạnh</Text>
        </View>

        <Text style={styles.sectionTitle}>Thương hiệu trên video</Text>
        <Pressable style={styles.logoCard}>
          <View style={styles.logoTile}>
            <Ionicons name="add" size={20} color={colors.sand[500]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.logoTitle}>Thêm logo</Text>
            <Text style={styles.logoSub}>Hiện ở góc video đã tạo</Text>
          </View>
        </Pressable>
        <View style={styles.watermarkRow}>
          <Text style={styles.watermarkLabel}>Watermark cuối video</Text>
          <View style={[styles.toggle, styles.toggleOn]}>
            <View style={[styles.toggleKnob, styles.toggleKnobOn]} />
          </View>
        </View>

        <View style={styles.menu}>
          {MENU.map((m, i) => (
            <Pressable key={m.key} style={[styles.menuItem, i < MENU.length - 1 && styles.menuItemBorder]} onPress={() => navigation.navigate(m.route)}>
              <Text style={styles.menuLabel}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.sand[500]} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <TabBar active="profile" onNavigate={(k) => navigateTab(navigation, k)} onCreate={() => navigation.navigate('Capture')} />
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
  scroll: { padding: 20, paddingBottom: 120 },
  identity: { alignItems: 'center' },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.jade[600], alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 26 },
  name: { fontSize: 19, fontFamily: fonts.displayBold, color: colors.sand[900], marginTop: 10 },
  role: { fontSize: 12.5, color: colors.sand[600] },

  sectionTitle: { marginTop: 22, fontSize: 13, fontFamily: fonts.displayBold, color: colors.sand[900], marginBottom: 10 },
  logoCard: { backgroundColor: '#fff', borderRadius: radius.sheet, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, ...shadow.e1 },
  logoTile: { width: 48, height: 48, borderRadius: 10, backgroundColor: colors.sand[100], borderWidth: 1.5, borderColor: colors.sand[300], borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  logoTitle: { fontSize: 14, fontFamily: fonts.displaySemiBold, color: colors.sand[900] },
  logoSub: { fontSize: 11.5, color: colors.sand[500] },

  watermarkRow: { marginTop: 10, backgroundColor: '#fff', borderRadius: radius.sheet, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...shadow.e1 },
  watermarkLabel: { fontSize: 14, fontFamily: fonts.displaySemiBold, color: colors.sand[900] },
  toggle: { width: 38, height: 22, borderRadius: 11, backgroundColor: colors.sand[300], justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.jade[500] },
  toggleKnob: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff', marginLeft: 2 },
  toggleKnobOn: { marginLeft: 18 },

  menu: { marginTop: 16, backgroundColor: '#fff', borderRadius: radius.sheet, overflow: 'hidden' },
  menuItem: { paddingVertical: 15, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.sand[100] },
  menuLabel: { fontSize: 14.5, fontFamily: fonts.displayMedium, color: colors.sand[900] },
})
