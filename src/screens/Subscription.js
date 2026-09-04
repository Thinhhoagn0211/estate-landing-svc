import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, radius } from '../theme/tokens'

const PLANS = [
  { key: 'basic', name: 'Cơ bản', price: '199k/tháng', desc: '20 bài/tháng · 1 kênh' },
  { key: 'pro', name: 'Chuyên nghiệp', price: '399k/tháng', desc: '60 bài/tháng · 3 kênh · watermark riêng', current: true },
  { key: 'agency', name: 'Đại lý', price: '1,2 tr/tháng', desc: '200 bài/tháng · 10 người dùng · duyệt bài' },
]

export default function Subscription({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <Pressable style={styles.back} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={20} color={colors.sand[900]} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Gói & tín dụng</Text>
        <Text style={styles.subtitle}>48/60 tín dụng còn lại tháng này — mỗi bài đăng dùng 1 tín dụng.</Text>

        <View style={styles.plans}>
          {PLANS.map((p) => (
            <View key={p.key} style={[styles.plan, p.current && styles.planCurrent]}>
              {p.current && (
                <View style={styles.currentTag}>
                  <Text style={styles.currentTagLabel}>ĐANG DÙNG</Text>
                </View>
              )}
              <View style={styles.planHead}>
                <Text style={styles.planName}>{p.name}</Text>
                <Text style={styles.planPrice}>{p.price}</Text>
              </View>
              <Text style={[styles.planDesc, p.current && { color: colors.jade[600] }]}>{p.desc}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.disclaimer}>Huỷ bất cứ lúc nào. Không tự động lên gói cao hơn. Tín dụng không dùng hết sẽ không cộng dồn.</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  back: { width: 38, height: 38, borderRadius: 19, marginLeft: 20, marginTop: 4, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, paddingTop: 6, paddingBottom: 40 },
  title: { fontSize: 24, fontFamily: fonts.displayBold, color: colors.sand[900] },
  subtitle: { fontSize: 13, color: colors.sand[600], marginTop: 4 },

  plans: { marginTop: 18, gap: 12 },
  plan: { borderWidth: 1.5, borderColor: colors.sand[300], borderRadius: radius.sheet, padding: 16 },
  planCurrent: { borderWidth: 2, borderColor: colors.jade[500], backgroundColor: colors.jade[50], position: 'relative' },
  currentTag: { position: 'absolute', top: -10, left: 16, backgroundColor: colors.jade[500], paddingVertical: 3, paddingHorizontal: 9, borderRadius: radius.full },
  currentTagLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 10 },
  planHead: { flexDirection: 'row', justifyContent: 'space-between' },
  planName: { fontSize: 16, fontFamily: fonts.displayBold, color: colors.sand[900] },
  planPrice: { fontSize: 15, fontFamily: fonts.displayBold, color: colors.sand[900] },
  planDesc: { fontSize: 12.5, color: colors.sand[600], marginTop: 4 },

  disclaimer: { marginTop: 14, fontSize: 11.5, color: colors.sand[500], lineHeight: 17 },
})
