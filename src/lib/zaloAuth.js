import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { supabase } from './supabase'

export async function connectZalo() {
  // Linking.createURL resolves to exp://<lan-ip>:8081/--/zalo-connected under Expo Go
  // and nhanet://zalo-connected in a standalone/dev-client build — either way it's a
  // URI this running instance can actually receive. We send it to zalo-oauth-start so
  // zalo-oauth-callback can bounce the browser back to the right place.
  const appRedirectUrl = Linking.createURL('zalo-connected')

  const { data, error } = await supabase.functions.invoke('zalo-oauth-start', {
    body: { redirectUri: appRedirectUrl },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)

  // The Zalo login + token exchange happens entirely server-side (zalo-oauth-callback).
  // openAuthSessionAsync closes the in-app browser automatically once it sees the
  // redirect back to appRedirectUrl, returning control to the caller.
  console.log('[Zalo OAuth] opening auth URL', {
    appRedirectUrl,
    authUrl: data.authUrl,
  })

  const result = await WebBrowser.openAuthSessionAsync(data.authUrl, appRedirectUrl)
  console.log('[Zalo OAuth] browser result', result)

  if (result?.type === 'cancel' || result?.type === 'dismiss') {
    throw new Error('Đăng nhập Zalo đã bị hủy hoặc trình duyệt không quay lại ứng dụng.')
  }

  if (result?.type !== 'success') {
    throw new Error(`Zalo OAuth không thành công (${result?.type ?? 'unknown'}).`)
  }

  return result
}
