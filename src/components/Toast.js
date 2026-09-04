import { useEffect, useRef } from 'react'
import { View, Text, Animated, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, radius, shadow } from '../theme/tokens'

export default function Toast({ children }) {
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 340, useNativeDriver: true }).start()
  }, [anim])

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
        },
      ]}
    >
      <View style={styles.check}>
        <Ionicons name="checkmark" size={14} color="#fff" />
      </View>
      <Text style={styles.label}>{children}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 110,
    backgroundColor: colors.sand[900],
    borderRadius: radius.card,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    ...shadow.e3,
  },
  check: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.jade[500], alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.displayMedium, fontSize: 14, color: '#fff' },
})
