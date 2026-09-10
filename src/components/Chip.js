import { Pressable, Text, View, StyleSheet } from 'react-native'
import { colors, fonts, radius } from '../theme/tokens'

export default function Chip({ active, tone = false, onPress, children }) {
  const activeStyle = tone ? styles.toneActive : styles.filterActive
  const inactiveStyle = tone ? styles.toneInactive : styles.filterInactive
  const activeLabel = tone ? styles.toneActiveLabel : styles.filterActiveLabel
  const inactiveLabel = tone ? styles.toneInactiveLabel : styles.filterInactiveLabel

  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!active }} onPress={onPress} style={({ pressed }) => [styles.chip, active ? activeStyle : inactiveStyle, pressed && styles.pressed]}>
      {tone && active && <View style={styles.dot} />}
      <Text style={active ? activeLabel : inactiveLabel}>{children}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pressed: { opacity: 0.78 },
  filterActive: { backgroundColor: colors.jade[700] },
  filterInactive: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  filterActiveLabel: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: '#fff' },
  filterInactiveLabel: { fontFamily: fonts.displayMedium, fontSize: 13, color: colors.sand[700] },

  toneActive: { backgroundColor: colors.aiBg, borderWidth: 1.5, borderColor: colors.ai },
  toneInactive: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border },
  toneActiveLabel: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.ai },
  toneInactiveLabel: { fontFamily: fonts.displayMedium, fontSize: 13, color: colors.sand[700] },

  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.ai },
})
