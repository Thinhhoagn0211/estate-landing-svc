import { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, radius, shadow } from '../theme/tokens'

const RANGES = ['7 ngày', '30 ngày', 'Tất cả']

const DAILY = [
  { day: 'T2', h: 0.4 },
  { day: 'T3', h: 0.55 },
  { day: 'T4', h: 0.35 },
  { day: 'T5', h: 0.7 },
  { day: 'T6', h: 1, highlight: true },
  { day: 'T7', h: 0.6 },
  { day: 'CN', h: 0.45 },
]

const PLATFORM_BREAKDOWN = [
  { label: 'TikTok', value: '5 100', pct: 70, color: colors.sand[900] },
  { label: 'Facebook', value: '2 460', pct: 34, color: '#1877f2' },
  { label: 'Zalo', value: '680', pct: 12, color: '#0068ff' },
]

export default function Analytics({ navigation }) {
  const [range, setRange] = useState(RANGES[0])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.head}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.sand[700]} />
        </Pressable>
        <Text style={styles.title}>Thống kê</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.rangeRow}>
          {RANGES.map((r) => (
            <Pressable key={r} onPress={() => setRange(r)} style={[styles.rangeChip, range === r && styles.rangeChipActive]}>
              <Text style={[styles.rangeLabel, range === r && styles.rangeLabelActive]}>{r}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Lượt xem</Text>
            <Text style={styles.statValue}>8 240</Text>
            <Text style={styles.statDelta}>↑ 18% so với tuần trước</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Khách hàng tiềm năng</Text>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statDelta}>↑ 6 mới</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Lượt xem theo ngày</Text>
          <View style={styles.bars}>
            {DAILY.map((d) => (
              <View key={d.day} style={styles.barTrack}>
                <View style={[styles.bar, { height: `${d.h * 100}%` }, d.highlight && { backgroundColor: colors.jade[500] }]} />
              </View>
            ))}
          </View>
          <View style={styles.barLabels}>
            {DAILY.map((d) => (
              <Text key={d.day} style={styles.barLabel}>
                {d.day}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Theo nền tảng</Text>
          <View style={{ gap: 10 }}>
            {PLATFORM_BREAKDOWN.map((p) => (
              <View key={p.label}>
                <View style={styles.platformRow}>
                  <Text style={styles.platformLabel}>{p.label}</Text>
                  <Text style={styles.platformValue}>{p.value}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${p.pct}%`, backgroundColor: p.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand[50] },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow.e1 },
  title: { fontSize: 16, fontFamily: fonts.displayBold, color: colors.sand[900] },

  scroll: { padding: 20, paddingBottom: 40 },
  rangeRow: { flexDirection: 'row', gap: 8 },
  rangeChip: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.sand[300], paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.full },
  rangeChipActive: { backgroundColor: colors.sand[900], borderColor: colors.sand[900] },
  rangeLabel: { fontFamily: fonts.displayMedium, fontSize: 12.5, color: colors.sand[700] },
  rangeLabelActive: { color: '#fff', fontFamily: fonts.displaySemiBold },

  statRow: { marginTop: 14, flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: radius.sheet, padding: 14 },
  statLabel: { fontSize: 11.5, fontFamily: fonts.displaySemiBold, color: colors.sand[500] },
  statValue: { fontSize: 22, fontFamily: fonts.displayBold, color: colors.sand[900], marginTop: 4 },
  statDelta: { fontSize: 11, color: colors.jade[600], marginTop: 2 },

  chartCard: { marginTop: 12, backgroundColor: '#fff', borderRadius: radius.sheet, padding: 16 },
  chartTitle: { fontSize: 13, fontFamily: fonts.displayBold, color: colors.sand[900], marginBottom: 12 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 110 },
  barTrack: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { borderRadius: 5, backgroundColor: colors.sand[200] },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  barLabel: { fontSize: 10, color: colors.sand[500] },

  platformRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  platformLabel: { fontSize: 12.5, color: colors.sand[700] },
  platformValue: { fontSize: 12.5, fontFamily: fonts.displaySemiBold, color: colors.sand[700] },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.sand[100] },
  fill: { height: '100%', borderRadius: 4 },
})
