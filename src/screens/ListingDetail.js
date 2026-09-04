import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, radius } from '../theme/tokens'

const PLATFORMS = [
  { id: 'tiktok', label: 'TikTok', bg: '#000', mark: 'TT', views: '1 920 views' },
  { id: 'facebook', label: 'Facebook', bg: '#1877f2', mark: 'f', views: '740 views' },
  { id: 'zalo', label: 'Zalo', bg: '#0068ff', mark: 'Za', views: '180 views' },
]

export default function ListingDetail({ navigation }) {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroRow}>
            <Pressable style={styles.back} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={20} color={colors.sand[900]} />
            </Pressable>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeLabel}>LIVE</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.price}>2,5 tỷ</Text>
          <Text style={styles.subtitle}>Vinhomes Central Park · 68m² · 2PN2WC</Text>

          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>2 840</Text>
              <Text style={styles.statLabel}>Lượt xem</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>312</Text>
              <Text style={styles.statLabel}>Lượt lưu</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statLabel}>Tin nhắn</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Hiệu suất theo nền tảng</Text>
          <View style={styles.platformList}>
            {PLATFORMS.map((p) => (
              <View key={p.id} style={styles.platformRow}>
                <View style={[styles.platformMark, { backgroundColor: p.bg }]}>
                  <Text style={styles.platformMarkLabel}>{p.mark}</Text>
                </View>
                <Text style={styles.platformLabel}>{p.label}</Text>
                <Text style={styles.platformViews}>{p.views}</Text>
              </View>
            ))}
          </View>

        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand[200] },
  hero: { height: 260, backgroundColor: colors.sand[200] },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  liveBadge: { backgroundColor: colors.jade[500], paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.full },
  liveBadgeLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 11 },

  sheet: { flex: 1, marginTop: -24, backgroundColor: colors.sand[50], borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetContent: { padding: 20, paddingBottom: 40 },
  price: { fontSize: 24, fontFamily: fonts.displayBold, color: colors.sand[900] },
  subtitle: { fontSize: 13.5, color: colors.sand[600], marginTop: 2 },

  statRow: { marginTop: 16, flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: radius.card, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 18, fontFamily: fonts.displayBold, color: colors.sand[900] },
  statLabel: { fontSize: 10.5, color: colors.sand[500], marginTop: 2 },

  sectionTitle: { marginTop: 16, fontSize: 14, fontFamily: fonts.displayBold, color: colors.sand[900] },
  platformList: { marginTop: 10, gap: 8 },
  platformRow: { backgroundColor: '#fff', borderRadius: radius.card, paddingVertical: 11, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  platformMark: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  platformMarkLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 9 },
  platformLabel: { flex: 1, fontSize: 13, fontFamily: fonts.displaySemiBold, color: colors.sand[900] },
  platformViews: { fontSize: 13, color: colors.sand[600] },

})
