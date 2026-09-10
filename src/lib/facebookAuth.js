import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { Alert } from 'react-native'
import { AccessToken, LoginManager } from 'react-native-fbsdk-next'
import { supabase } from './supabase'

async function invokeErrorMessage(error) {
  if (error?.context?.clone) {
    try {
      const payload = await error.context.clone().json()
      if (payload?.error) return payload.error
      return JSON.stringify(payload)
    } catch (_) {
      // Keep the SDK error when the response is not JSON.
    }
  }
  const status = error?.context?.status ? ` (${error.context.status})` : ''
  return `${error?.message ?? String(error)}${status}`
}

export async function connectFacebook() {
  try {
    if (!LoginManager?.logInWithPermissions || !AccessToken?.getCurrentAccessToken) {
      throw new Error('Facebook Native SDK chưa được tích hợp vào bản Android hiện tại.')
    }
    if (LoginManager.setLoginBehavior) LoginManager.setLoginBehavior('native_with_fallback')
    const result = await LoginManager.logInWithPermissions([
      'pages_show_list',
      'pages_read_engagement',
      'pages_read_user_content',
      'pages_manage_posts',
      'pages_manage_metadata',
      'pages_messaging',
      'read_insights',
    ])
    if (result.isCancelled) return

    const tokenResult = await AccessToken.getCurrentAccessToken()
    const accessToken = tokenResult?.accessToken
    if (!accessToken) throw new Error('Facebook không trả về access token.')

    const { data, error } = await supabase.functions.invoke('facebook-native-connect', { body: { accessToken } })
    if (error) {
      const backendError = new Error(await invokeErrorMessage(error))
      backendError.facebookBackend = true
      throw backendError
    }
    if (data?.error) throw new Error(data.error)
    const pages = data?.pages ?? []
    if (!pages.length) throw new Error('Tài khoản Facebook này chưa quản lý Page nào.')

    const choose = async (pageId) => {
      const selected = await supabase.functions.invoke('facebook-oauth-select', { body: { state: data.state, pageId } })
      if (selected.error || selected.data?.error) {
        const backendError = selected.error
          ? new Error(await invokeErrorMessage(selected.error))
          : new Error(selected.data.error)
        backendError.facebookBackend = true
        throw backendError
      }
    }
    if (pages.length === 1) {
      await choose(pages[0].id)
      return
    }
    await new Promise((resolve, reject) => {
      Alert.alert('Chọn Facebook Page', 'Chọn Page để Upload Post đăng bài:', pages.slice(0, 3).map((page) => ({
        text: page.name,
        onPress: async () => { try { await choose(page.id); resolve() } catch (e) { reject(e) } },
      })))
    })
    return
  } catch (nativeError) {
    if (nativeError?.message?.includes('cancel')) return
    if (nativeError?.facebookBackend) throw nativeError
    console.warn('Native Facebook Login unavailable, using web login:', nativeError?.message)
  }

  const appRedirectUrl = Linking.createURL('facebook-connected')
  const { data, error } = await supabase.functions.invoke('facebook-oauth-start', {
    body: { redirectUri: appRedirectUrl },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  await WebBrowser.openAuthSessionAsync(data.authUrl, appRedirectUrl)
}
