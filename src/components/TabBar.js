import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts } from '../theme/tokens'

const ITEMS = [
  { key: 'home', icon: 'home-outline', activeIcon: 'home', label: 'Trang chủ' },
  { key: 'listings', icon: 'albums-outline', activeIcon: 'albums', label: 'Tin đăng' },
  { key: 'create', icon: null, label: '' },
  { key: 'chat', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses', label: 'Tin nhắn', badge: 3 },
  { key: 'profile', icon: 'person-outline', activeIcon: 'person', label: 'Hồ sơ' },
]

export default function TabBar({ active = 'home', onNavigate, onCreate }) {
  return (
    <View style={styles.bar}>
      {ITEMS.map((item) => {
        if (item.key === 'create') {
          return (
            <Pressable key="create" style={styles.createBtn} onPress={onCreate}>
              <Ionicons name="add" size={26} color="#fff" />
            </Pressable>
          )
        }
        const isActive = active === item.key
        return (
          <Pressable key={item.key} style={styles.item} onPress={() => onNavigate?.(item.key)}>
            <View>
              <Ionicons name={isActive ? item.activeIcon : item.icon} size={24} color={isActive ? colors.jade[500] : colors.sand[500]} />
              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeLabel}>{item.badge}</Text>
                </View>
              ) : null}
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
    height: 86,
    backgroundColor: 'rgba(250,248,244,0.96)',
    borderTopWidth: 1,
    borderTopColor: '#ece4d8',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 11,
    paddingHorizontal: 14,
  },
  item: { alignItems: 'center', gap: 4 },
  itemLabel: { fontSize: 10, fontFamily: fonts.displayMedium, color: colors.sand[500] },
  badge: {
    position: 'absolute',
    top: -3,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: { fontFamily: fonts.displayBold, fontSize: 9, color: '#fff' },
  createBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.jade[500],
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.jade[500],
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
})
