import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { supabase } from './supabase'

export async function connectZaloOa() {
  // Linking.createURL resolves to exp://<lan-ip>:8081/--/zalo-connected under Expo Go
  // and nhanet://zalo-connected in a standalone/dev-client build — either way it's a
  // URI this running instance can actually receive. We send it to zalo-oa-oauth-start
  // so zalo-oa-oauth-callback can bounce the browser back to the right place.
  const appRedirectUrl = Linking.createURL('zalo-connected')

  const { data, error } = await supabase.functions.invoke('zalo-oa-oauth-start', {
    body: { redirectUri: appRedirectUrl },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)

  // The Zalo OA login + token exchange happens entirely server-side
  // (zalo-oa-oauth-callback). openAuthSessionAsync closes the in-app browser
  // automatically once it sees the redirect back to appRedirectUrl.
  await WebBrowser.openAuthSessionAsync(data.authUrl, appRedirectUrl)
}
