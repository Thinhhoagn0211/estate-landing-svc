import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts } from '../theme/tokens'

export default function FlowHeader({ step, totalSteps = 5, label, onBack, onCancel }) {
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" style={styles.back} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={colors.sand[700]} />
        </Pressable>
        <Text style={styles.step}>
          Bước {step}/{totalSteps} · {label}
        </Text>
        <Pressable accessibilityRole="button" style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancel}>Đóng</Text>
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
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10, backgroundColor: colors.canvas },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  step: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.textMuted },
  cancelButton: { minWidth: 48, minHeight: 48, alignItems: 'flex-end', justifyContent: 'center' },
  cancel: { fontFamily: fonts.displaySemiBold, fontSize: 14, color: colors.textMuted },
  rail: { marginTop: 12, flexDirection: 'row', gap: 5 },
  segment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  segmentDone: { backgroundColor: colors.jade[700] },
})
