import { View, ActivityIndicator } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../context/AuthContext'
import { colors } from '../theme/tokens'
import Splash from '../screens/Splash'
import PhoneAuth from '../screens/PhoneAuth'
import RoleSelect from '../screens/RoleSelect'
import ConnectChannels from '../screens/ConnectChannels'
import EmptyState from '../screens/EmptyState'
import Dashboard from '../screens/Dashboard'
import Capture from '../screens/Capture'
import PropertyDetails from '../screens/PropertyDetails'
import AiGeneration from '../screens/AiGeneration'
import Publish from '../screens/Publish'
import Schedule from '../screens/Schedule'
import PublishProgress from '../screens/PublishProgress'
import Listings from '../screens/Listings'
import ListingDetail from '../screens/ListingDetail'
import Inbox from '../screens/Inbox'
import Analytics from '../screens/Analytics'
import Profile from '../screens/Profile'
import Settings from '../screens/Settings'
import StartCreate from '../screens/StartCreate'
import ManageListing from '../screens/ManageListing'

const AuthStackNav = createNativeStackNavigator()
const MainStackNav = createNativeStackNavigator()

function AuthStack() {
  return (
    <AuthStackNav.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Splash" component={Splash} />
      <AuthStackNav.Screen name="PhoneAuth" component={PhoneAuth} options={{ animation: 'slide_from_right' }} />
    </AuthStackNav.Navigator>
  )
}

function MainStack({ needsOnboarding }) {
  return (
    <MainStackNav.Navigator initialRouteName={needsOnboarding ? 'RoleSelect' : 'Dashboard'} screenOptions={{ headerShown: false }}>
      <MainStackNav.Screen name="Dashboard" component={Dashboard} />
      <MainStackNav.Screen name="RoleSelect" component={RoleSelect} />
      <MainStackNav.Screen name="OnboardingConnectChannels" component={ConnectChannels} options={{ animation: 'slide_from_right' }} />
      <MainStackNav.Screen name="EmptyState" component={EmptyState} options={{ animation: 'slide_from_right' }} />
      <MainStackNav.Screen name="Listings" component={Listings} />
      <MainStackNav.Screen name="ListingDetail" component={ListingDetail} options={{ animation: 'slide_from_right' }} />
      <MainStackNav.Screen name="ManageListing" component={ManageListing} options={{ animation: 'slide_from_right' }} />
      <MainStackNav.Screen name="Inbox" component={Inbox} />
      <MainStackNav.Screen name="Analytics" component={Analytics} options={{ animation: 'slide_from_right' }} />
      <MainStackNav.Screen name="Profile" component={Profile} />
      <MainStackNav.Screen name="Settings" component={Settings} options={{ animation: 'slide_from_right' }} />
      <MainStackNav.Screen name="ConnectChannels" component={ConnectChannels} options={{ animation: 'slide_from_right' }} />
      <MainStackNav.Screen name="StartCreate" component={StartCreate} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />

      {/* Create flow (3 steps) */}
      <MainStackNav.Screen name="Capture" component={Capture} options={{ animation: 'slide_from_right' }} />
      <MainStackNav.Screen name="PropertyDetails" component={PropertyDetails} options={{ animation: 'slide_from_right' }} />
      <MainStackNav.Screen name="AiGeneration" component={AiGeneration} options={{ animation: 'slide_from_right' }} />

      {/* Publish */}
      <MainStackNav.Screen name="Publish" component={Publish} options={{ animation: 'slide_from_right' }} />
      <MainStackNav.Screen name="Schedule" component={Schedule} options={{ presentation: 'transparentModal', animation: 'fade' }} />
      <MainStackNav.Screen name="PublishProgress" component={PublishProgress} options={{ animation: 'slide_from_right' }} />
    </MainStackNav.Navigator>
  )
}

export default function RootNavigator() {
  const { isLoading, isAuthenticated, needsOnboarding } = useAuth()

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.sand[50] }}>
        <ActivityIndicator color={colors.jade[500]} />
      </View>
    )
  }

  return isAuthenticated ? <MainStack needsOnboarding={needsOnboarding} /> : <AuthStack />
}
