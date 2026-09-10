import { useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { colors, fonts, radius } from '../theme/tokens'

const META = {
  success: { icon: 'checkmark-circle', label: 'Đã đăng', color: colors.success, background: colors.jade[50] },
  error: { icon: 'alert-circle', label: 'Cần xử lý', color: colors.error, background: colors.errorBg },
  saved: { icon: 'document-text', label: 'Đã lưu', color: colors.jade[700], background: colors.jade[50] },
  pending: { icon: 'time', label: 'Đang kiểm tra', color: colors.warning, background: colors.amber[50] },
}

export default function PublishProgress({ navigation, route }) {
  const { user } = useAuth()
  const listingId = route.params?.listingId
  const [results, setResults] = useState(Array.isArray(route.params?.results) ? route.params.results : [])
  const [retrying, setRetrying] = useState(null)
  const successCount = results.filter((item) => item.status === 'success').length
  const errorCount = results.filter((item) => item.status === 'error').length
  const savedOnly = results.length > 0 && results.every((item) => item.status === 'saved')
  const title = savedOnly ? 'Bản nháp đã được lưu' : errorCount ? successCount + ' kênh đã đăng, ' + errorCount + ' kênh cần xử lý' : 'Nội dung đã được đăng'
  const description = savedOnly ? 'Bạn có thể tiếp tục từ danh sách bất động sản.' : 'Kết quả được hiển thị riêng cho từng đích đăng.'

  const retryFacebook = async (index) => {
    if (!listingId || retrying !== null) return
    setRetrying(index)
    try {
      const { data: listing, error: listingError } = await supabase.from('listings').select('caption_primary, hashtags, photo_urls').eq('id', listingId).single()
      if (listingError) throw listingError
      const message = [listing.caption_primary, listing.hashtags].filter(Boolean).join('\n\n')
      const { data, error } = await supabase.functions.invoke('facebook-publish', { body: { listingId, message, imageUrls: listing.photo_urls || [] } })
      if (error || data?.error) throw new Error(data?.error || error?.message || 'Facebook chưa nhận được bài đăng.')
      await Promise.all([
        supabase.from('post_logs').insert({
          user_id: user.id,
          listing_id: listingId,
          platform: 'facebook',
          method: 'auto',
          status: 'success',
          external_post_id: data?.postId ?? null,
          external_post_url: data?.postUrl ?? null,
        }),
        supabase.from('listings').update({ status: 'live', updated_at: new Date().toISOString() }).eq('id', listingId).eq('user_id', user.id),
      ])
      setResults((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, status: 'success', message: null, url: data?.postUrl } : item))
    } catch (error) {
      const message = error.message || 'Chưa thể đăng lại lên Facebook.'
      await supabase.from('post_logs').insert({ user_id: user.id, listing_id: listingId, platform: 'facebook', method: 'auto', status: 'error', error_message: message })
      setResults((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, message } : item))
    } finally {
      setRetrying(null)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroIcon, errorCount && styles.heroIconWarning]}>
          <Ionicons name={errorCount ? 'alert-outline' : savedOnly ? 'document-text-outline' : 'checkmark'} size={30} color={errorCount ? colors.error : colors.jade[800]} />
        </View>
        <Text style={styles.overline}>KẾT QUẢ</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{description}</Text>

        <View style={styles.results}>
          {results.map((item, index) => {
            const meta = META[item.status] || META.pending
            return (
              <View key={item.platform + '-' + index} style={styles.card}>
                <View style={[styles.statusIcon, { backgroundColor: meta.background }]}><Ionicons name={meta.icon} size={21} color={meta.color} /></View>
                <View style={styles.cardCopy}>
                  <Text style={styles.platform}>{item.platform}</Text>
                  <Text style={styles.destination}>{item.destination}</Text>
                  {!!item.message && <Text style={[styles.message, item.status === 'error' && styles.errorMessage]}>{item.message}</Text>}
                  {item.status === 'error' && item.platform === 'Facebook' && <Pressable disabled={retrying !== null} style={styles.retryButton} onPress={() => retryFacebook(index)}>{retrying === index ? <ActivityIndicator size="small" color={colors.jade[700]} /> : <Text style={styles.retryText}>Thử lại Facebook</Text>}</Pressable>}
                  {item.status === 'success' && item.url && <Pressable style={styles.postLink} onPress={() => Linking.openURL(item.url)}><Text style={styles.postLinkText}>Xem bài đăng</Text><Ionicons name="open-outline" size={15} color={colors.jade[700]} /></Pressable>}
                </View>
                <Text style={[styles.status, { color: meta.color }]}>{meta.label}</Text>
              </View>
            )
          })}
          {!results.length && <View style={styles.card}><Text style={styles.message}>Chưa có kết quả để hiển thị.</Text></View>}
        </View>

        {errorCount > 0 && <View style={styles.note}><Ionicons name="information-circle-outline" size={20} color={colors.warning} /><Text style={styles.noteText}>Kiểm tra kết nối trước khi thử lại. Các đích đã thành công sẽ không tự động đăng lại.</Text></View>}
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="primary" block onPress={() => navigation.navigate('Listings')}>Về bất động sản</Button>
        <Pressable style={styles.homeButton} onPress={() => navigation.popToTop()}><Text style={styles.homeButtonText}>Về tổng quan</Text></Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 20, paddingTop: 36, paddingBottom: 170, alignItems: 'center' },
  heroIcon: { width: 68, height: 68, borderRadius: 22, backgroundColor: colors.jade[50], alignItems: 'center', justifyContent: 'center' },
  heroIconWarning: { backgroundColor: colors.errorBg },
  overline: { marginTop: 24, color: colors.jade[700], fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1.15 },
  title: { marginTop: 6, color: colors.text, fontFamily: fonts.displayBold, fontSize: 24, lineHeight: 31, textAlign: 'center', maxWidth: 340 },
  subtitle: { marginTop: 7, color: colors.textMuted, fontSize: 12.5, lineHeight: 18, textAlign: 'center' },
  results: { width: '100%', marginTop: 28, gap: 10 },
  card: { minHeight: 84, padding: 14, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  statusIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1 },
  platform: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 14 },
  destination: { marginTop: 2, color: colors.textMuted, fontSize: 11.5 },
  message: { marginTop: 5, color: colors.textMuted, fontSize: 11.5, lineHeight: 17 },
  errorMessage: { color: colors.error },
  retryButton: { marginTop: 10, minHeight: 42, alignSelf: 'flex-start', paddingHorizontal: 13, borderRadius: radius.control, borderWidth: 1, borderColor: colors.borderControl, alignItems: 'center', justifyContent: 'center' }, retryText: { color: colors.jade[700], fontFamily: fonts.displaySemiBold, fontSize: 12 },
  postLink: { marginTop: 9, minHeight: 40, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5 }, postLinkText: { color: colors.jade[700], fontFamily: fonts.displaySemiBold, fontSize: 12 },
  status: { fontFamily: fonts.displaySemiBold, fontSize: 11.5 },
  note: { width: '100%', marginTop: 14, padding: 14, borderRadius: radius.control, backgroundColor: colors.amber[50], flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  noteText: { flex: 1, color: colors.warning, fontSize: 11.5, lineHeight: 17 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18 },
  homeButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  homeButtonText: { color: colors.textMuted, fontFamily: fonts.displaySemiBold, fontSize: 13 },
})
