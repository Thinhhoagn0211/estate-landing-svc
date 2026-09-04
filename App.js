import { View, ActivityIndicator } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import {
  useFonts as useBeVietnamProFonts,
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
  BeVietnamPro_800ExtraBold,
} from '@expo-google-fonts/be-vietnam-pro'
import {
  useFonts as useJetBrainsMonoFonts,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono'
import RootNavigator from './src/navigation/RootNavigator'
import { AuthProvider } from './src/context/AuthContext'
import { ListingDraftProvider } from './src/context/ListingDraftContext'
import { colors } from './src/theme/tokens'

export default function App() {
  const [beVietnamLoaded] = useBeVietnamProFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
    BeVietnamPro_800ExtraBold,
  })
  const [jetBrainsLoaded] = useJetBrainsMonoFonts({
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  })

  if (!beVietnamLoaded || !jetBrainsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand[50] }}>
        <ActivityIndicator color={colors.jade[500]} />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ListingDraftProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </ListingDraftProvider>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
