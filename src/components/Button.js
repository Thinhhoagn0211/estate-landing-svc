import { Pressable, Text, StyleSheet } from 'react-native'
import { colors, fonts, radius } from '../theme/tokens'

export default function Button({ variant = 'primary', block = false, onPress, disabled, children, style }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[disabled ? 'disabled' : variant],
        block && styles.block,
        pressed && !disabled && { transform: [{ scale: 0.97 }] },
        style,
      ]}
    >
      <Text style={[styles.label, labelStyles[disabled ? 'disabled' : variant], block && styles.blockLabel]}>{children}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  block: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: radius.sheet,
  },
  label: { fontFamily: fonts.displaySemiBold, fontSize: 15 },
  blockLabel: { fontSize: 16, fontFamily: fonts.displayBold },
})

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.jade[500] },
  secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.sand[300] },
  ghost: { backgroundColor: 'transparent', paddingHorizontal: 12 },
  danger: { backgroundColor: colors.errorBg },
  disabled: { backgroundColor: colors.sand[200] },
})

const labelStyles = StyleSheet.create({
  primary: { color: '#fff' },
  secondary: { color: colors.ink },
  ghost: { color: colors.jade[600] },
  danger: { color: colors.error },
  disabled: { color: colors.sand[400] },
})
