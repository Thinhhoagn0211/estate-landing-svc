import { Pressable, Text, View, StyleSheet } from 'react-native'
import { colors, fonts, radius } from '../theme/tokens'

export default function Chip({ active, tone = false, onPress, children }) {
  const activeStyle = tone ? styles.toneActive : styles.filterActive
  const inactiveStyle = tone ? styles.toneInactive : styles.filterInactive
  const activeLabel = tone ? styles.toneActiveLabel : styles.filterActiveLabel
  const inactiveLabel = tone ? styles.toneInactiveLabel : styles.filterInactiveLabel

  return (
    <Pressable onPress={onPress} style={[styles.chip, active ? activeStyle : inactiveStyle]}>
      {tone && active && <View style={styles.dot} />}
      <Text style={active ? activeLabel : inactiveLabel}>{children}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterActive: { backgroundColor: colors.sand[900] },
  filterInactive: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.sand[300] },
  filterActiveLabel: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: '#fff' },
  filterInactiveLabel: { fontFamily: fonts.displayMedium, fontSize: 13, color: colors.sand[700] },

  toneActive: { backgroundColor: colors.amber[50], borderWidth: 1.5, borderColor: colors.amber[400] },
  toneInactive: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.sand[300] },
  toneActiveLabel: { fontFamily: fonts.displaySemiBold, fontSize: 13, color: colors.amber[700] },
  toneInactiveLabel: { fontFamily: fonts.displayMedium, fontSize: 13, color: colors.sand[700] },

  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.amber[500] },
})
