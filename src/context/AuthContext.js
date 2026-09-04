import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Temporary development bypass for testing the app before creating an account.
// Set to false when testing real Supabase authentication.
const BYPASS_AUTH_FOR_TESTING = __DEV__
const DEV_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'demo@nhanet.local',
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = still loading, null = signed out
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    if (BYPASS_AUTH_FOR_TESTING) {
      // Reuse the existing anonymous session. Creating a new anonymous user
      // on every launch makes previous listings disappear because listings
      // are protected by user_id.
      supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
        if (existingSession) {
          setSession(existingSession)
          return
        }
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error) {
          console.warn('Anonymous auth is unavailable:', error.message)
          setSession({ user: DEV_USER })
          return
        }
        setSession(data.session)
      })
      return undefined
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  const value = useMemo(
    () => ({
      isLoading: session === undefined,
      isAuthenticated: BYPASS_AUTH_FOR_TESTING || !!session,
      needsOnboarding,
      // Use the real anonymous user's ID so Storage RLS can match the folder
      // path against auth.uid(). The demo user is only a fallback if anon auth
      // is disabled in Supabase.
      user: BYPASS_AUTH_FOR_TESTING ? session?.user ?? DEV_USER : session?.user ?? null,
      signUp: async (email, password) => {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setNeedsOnboarding(true)
      },
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      },
      completeOnboarding: () => setNeedsOnboarding(false),
      logout: async () => {
        await supabase.auth.signOut()
        setNeedsOnboarding(false)
      },
    }),
    [session, needsOnboarding]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
