import { View, Text, StyleSheet } from 'react-native'
import { colors, fonts, radius } from '../theme/tokens'

export function TypeTag({ type }) {
  return (
    <View style={[styles.tag, { backgroundColor: type === 'sale' ? colors.jade[700] : colors.amber[700] }]}>
      <Text style={styles.tagLabel}>{type === 'sale' ? 'BÁN' : 'CHO THUÊ'}</Text>
    </View>
  )
}

export function AiTag() {
  return (
    <View style={styles.aiTag}>
      <View style={styles.aiDiamond} />
      <Text style={styles.aiTagLabel}>AI TẠO</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  tag: { paddingVertical: 5, paddingHorizontal: 11, borderRadius: 6 },
  tagLabel: { fontFamily: fonts.displayBold, fontSize: 11, color: '#fff', letterSpacing: 0.4 },
  aiTag: {
    backgroundColor: colors.amber[50],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  aiDiamond: { width: 5, height: 5, backgroundColor: colors.amber[500], transform: [{ rotate: '45deg' }] },
  aiTagLabel: { fontFamily: fonts.monoBold, fontSize: 10, color: colors.amber[700], letterSpacing: 0.6 },
})
