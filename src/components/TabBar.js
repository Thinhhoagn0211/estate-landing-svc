import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts } from '../theme/tokens'

const ITEMS = [
  { key: 'home', icon: 'grid-outline', activeIcon: 'grid', label: 'Tổng quan' },
  { key: 'listings', icon: 'business-outline', activeIcon: 'business', label: 'Bất động sản' },
  { key: 'chat', icon: 'chatbubble-outline', activeIcon: 'chatbubble', label: 'Tin nhắn' },
  { key: 'profile', icon: 'person-circle-outline', activeIcon: 'person-circle', label: 'Tài khoản' },
]

export default function TabBar({ active = 'home', onNavigate }) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.bar, { minHeight: 64 + insets.bottom, paddingBottom: Math.max(insets.bottom, 8) }]}>
      {ITEMS.map((item) => {
        const isActive = active === item.key
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={item.badge ? `${item.label}, ${item.badge} chưa đọc` : item.label}
            style={styles.item}
            onPress={() => onNavigate?.(item.key)}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Ionicons name={isActive ? item.activeIcon : item.icon} size={24} color={isActive ? colors.jade[500] : colors.sand[500]} />
            </View>
            <Text style={[styles.itemLabel, isActive && { color: colors.jade[500], fontFamily: fonts.displaySemiBold }]}>{item.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 72,
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopWidth: 1,
    borderTopColor: '#ece4d8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingHorizontal: 18,
  },
  item: { flex: 1, alignItems: 'center', gap: 2, minWidth: 72, minHeight: 54, justifyContent: 'center' },
  iconWrap: { width: 42, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: colors.jade[50] },
  itemLabel: { fontSize: 10.5, fontFamily: fonts.displayMedium, color: colors.sand[500] },
})
