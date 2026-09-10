import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, radius } from '../theme/tokens'

export default function Button({ variant = 'primary', block = false, onPress, disabled, loading = false, icon, children, style }) {
  const locked = disabled || loading
  const visualState = disabled && !loading ? 'disabled' : variant
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: locked, busy: loading }}
      onPress={locked ? undefined : onPress}
      disabled={locked}
      style={({ pressed }) => [
        styles.base,
        variantStyles[visualState],
        block && styles.block,
        pressed && !locked && styles.pressed,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : colors.jade[700]} /> : icon ? <Ionicons name={icon} size={19} color={variant === 'primary' ? '#fff' : colors.jade[700]} /> : null}
      <Text style={[styles.label, labelStyles[visualState], block && styles.blockLabel]}>{children}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: radius.control,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  block: {
    width: '100%',
    minHeight: 54,
  },
  label: { fontFamily: fonts.displaySemiBold, fontSize: 15.5 },
  blockLabel: { fontSize: 16 },
  pressed: { opacity: 0.82 },
})

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.jade[700] },
  secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.borderControl },
  ghost: { backgroundColor: 'transparent', paddingHorizontal: 12 },
  danger: { backgroundColor: colors.errorBg },
  disabled: { backgroundColor: colors.disabled },
})

const labelStyles = StyleSheet.create({
  primary: { color: '#fff' },
  secondary: { color: colors.ink },
  ghost: { color: colors.jade[600] },
  danger: { color: colors.error },
  disabled: { color: colors.disabledText },
})
