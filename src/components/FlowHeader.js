import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts } from '../theme/tokens'

export default function FlowHeader({ step, totalSteps = 5, label, onBack, onCancel }) {
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Pressable style={styles.back} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={colors.sand[700]} />
        </Pressable>
        <Text style={styles.step}>
          Bước {step}/{totalSteps} · {label}
        </Text>
        <Pressable onPress={onCancel}>
          <Text style={styles.cancel}>Huỷ</Text>
        </Pressable>
      </View>
      <View style={styles.rail}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View key={i} style={[styles.segment, i < step && styles.segmentDone]} />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.sand[100], alignItems: 'center', justifyContent: 'center' },
  step: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.sand[700] },
  cancel: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.sand[500] },
  rail: { marginTop: 12, flexDirection: 'row', gap: 5 },
  segment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#e0d7c9' },
  segmentDone: { backgroundColor: colors.jade[500] },
})
