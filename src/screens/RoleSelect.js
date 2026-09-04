import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import Button from '../components/Button'
import { colors, fonts, radius } from '../theme/tokens'

const ROLES = [
  { key: 'broker', icon: 'person-outline', title: 'Môi giới cá nhân', desc: 'Đăng tin hàng tuần, làm việc từ điện thoại' },
  { key: 'agency', icon: 'people-outline', title: 'Đội / Công ty', desc: 'Quản lý nhiều môi giới, cần duyệt bài' },
  { key: 'owner', icon: 'home-outline', title: 'Chủ nhà', desc: 'Đăng cho thuê căn hộ của mình' },
]

export default function RoleSelect({ navigation }) {
  const [role, setRole] = useState('broker')

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Bạn là ai?</Text>
        <Text style={styles.subtitle}>Giúp chúng tôi tuỳ chỉnh trải nghiệm phù hợp.</Text>

        <View style={styles.cards}>
          {ROLES.map((r) => {
            const active = role === r.key
            return (
              <Pressable key={r.key} onPress={() => setRole(r.key)} style={[styles.card, active && styles.cardActive]}>
                <View style={[styles.iconTile, active && styles.iconTileActive]}>
                  <Ionicons name={r.icon} size={22} color={active ? '#fff' : colors.sand[700]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{r.title}</Text>
                  <Text style={styles.cardDesc}>{r.desc}</Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      </View>

      <View style={styles.sticky}>
        <Button variant="primary" block onPress={() => navigation.navigate('OnboardingConnectChannels')}>
          Tiếp tục
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

  cards: { marginTop: 24, gap: 12 },
  card: { borderWidth: 1.5, borderColor: colors.sand[300], borderRadius: radius.sheet, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  cardActive: { borderWidth: 2, borderColor: colors.jade[500], backgroundColor: colors.jade[50] },
  iconTile: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.sand[100], alignItems: 'center', justifyContent: 'center' },
  iconTileActive: { backgroundColor: colors.jade[500] },
  cardTitle: { fontSize: 16, fontFamily: fonts.displayBold, color: colors.sand[900] },
  cardDesc: { fontSize: 12.5, color: colors.sand[600], marginTop: 2 },

  sticky: { padding: 28, paddingTop: 0, paddingBottom: 30 },
})
