import { useEffect, useState } from 'react'
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import Button from '../components/Button'
import { useListingDraft } from '../context/ListingDraftContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { uploadListingPhotos } from '../lib/uploadListingPhotos'
import { colors, fonts, radius } from '../theme/tokens'

export default function Publish({ navigation }) {
  const { photos, details, generated, photoUrls, visualBrief, editingListingId, originalStatus, reset } = useListingDraft()
  const { user } = useAuth()
  const [caption, setCaption] = useState('')
  const [connection, setConnection] = useState(null)
  const [loadingConnection, setLoadingConnection] = useState(true)
  const [editing, setEditing] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setCaption([generated?.captionPrimary, generated?.hashtags].filter(Boolean).join('\n\n'))
  }, [generated])

  useEffect(() => {
    if (!user) return
    supabase
      .from('connected_channels_public')
      .select('platform, display_name')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .maybeSingle()
      .then(({ data }) => {
        setConnection(data ?? null)
        setLoadingConnection(false)
      })
  }, [user])

  const coverPhoto = photos[0]
  const cover = coverPhoto?.base64 ? 'data:' + coverPhoto.mimeType + ';base64,' + coverPhoto.base64 : coverPhoto?.uri || photoUrls[0]

  const logPost = async (listingId, status, errorMessage, post) => {
    await supabase.from('post_logs').insert({
      user_id: user.id,
      listing_id: listingId,
      platform: 'facebook',
      method: 'auto',
      status,
      error_message: errorMessage ?? null,
      external_post_id: post?.postId ?? null,
      external_post_url: post?.postUrl ?? null,
    })
  }

  const handlePublish = async () => {
    if (publishing) return
    setPublishing(true)
    setError(null)
    try {
      let urls = photoUrls
      if (!urls.length && photos.length) urls = await uploadListingPhotos(user.id, photos)

      const listingPayload = {
          user_id: user.id,
          title: details.title || null,
          deal_type: details.dealType,
          property_type: details.propertyType || null,
          price: details.priceNegotiable ? null : details.price || null,
          price_negotiable: !!details.priceNegotiable,
          area: details.area || null,
          bedrooms: details.bedrooms || null,
          bathrooms: details.bathrooms || null,
          address: details.address || null,
          direction: details.direction || null,
          legal_status: details.legalStatus || null,
          contact_phone: details.contactPhone || null,
          description: details.description || null,
          amenities: details.amenities,
          photo_urls: urls,
          caption_primary: caption || null,
          hashtags: generated?.hashtags || null,
          caption_friendly: generated?.captionFriendly || null,
          visual_brief: visualBrief || null,
          status: connection ? 'live' : originalStatus,
          updated_at: new Date().toISOString(),
      }
      const listingQuery = editingListingId
        ? supabase.from('listings').update(listingPayload).eq('id', editingListingId).eq('user_id', user.id)
        : supabase.from('listings').insert(listingPayload)
      const { data: listing, error: listingError } = await listingQuery.select('id').single()
      if (listingError) throw listingError

      const results = []
      if (connection) {
        const { data, error: publishError } = await supabase.functions.invoke('facebook-publish', {
          body: { listingId: listing.id, message: caption, imageUrls: urls },
        })
        if (publishError || data?.error) {
          const message = data?.error ?? publishError?.message ?? 'Facebook chưa nhận được bài đăng.'
          await logPost(listing.id, 'error', message)
          results.push({ platform: 'Facebook', destination: connection.display_name || 'Facebook Page', status: 'error', message })
        } else {
          await logPost(listing.id, 'success', null, data)
          results.push({ platform: 'Facebook', destination: data?.pageName || connection.display_name || 'Facebook Page', status: 'success', url: data?.postUrl })
        }
      } else {
        results.push({ platform: 'Nhà Nét', destination: 'Bản nháp', status: 'saved', message: 'Đã lưu trong danh sách bất động sản.' })
      }

      await reset()
      navigation.replace('PublishProgress', { listingId: listing.id, results })
    } catch (publishError) {
      setError(publishError.message ?? 'Chưa thể hoàn tất. Nội dung của bạn vẫn được giữ trên màn hình.')
      setPublishing(false)
    }
  }

  const pageName = connection?.display_name || 'Chưa kết nối Facebook Page'

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" style={styles.back} onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={21} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Kiểm tra trước khi đăng</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.overline}>BƯỚC CUỐI</Text>
        <Text style={styles.title}>Xác nhận nội dung công khai</Text>
        <Text style={styles.subtitle}>Kiểm tra tài khoản nhận bài, hình ảnh, giá và thông tin liên hệ.</Text>

        <View style={[styles.destination, !connection && styles.destinationWarning]}>
          <View style={styles.facebookMark}><Ionicons name="logo-facebook" size={20} color="#fff" /></View>
          <View style={{ flex: 1 }}><Text style={styles.destinationLabel}>ĐÍCH ĐĂNG</Text><Text style={styles.destinationName}>{loadingConnection ? 'Đang kiểm tra kết nối…' : pageName}</Text><Text style={styles.destinationMethod}>{connection ? 'Đăng trực tiếp' : 'Nội dung sẽ được lưu thành bản nháp'}</Text></View>
          {loadingConnection ? <ActivityIndicator size="small" color={colors.jade[700]} /> : <Ionicons name={connection ? 'checkmark-circle' : 'alert-circle-outline'} size={21} color={connection ? colors.success : colors.warning} />}
        </View>

        <View style={styles.previewLabelRow}><Text style={styles.sectionLabel}>XEM TRƯỚC NỘI DUNG</Text><Text style={styles.previewHint}>Mô phỏng</Text></View>
        <View style={styles.preview}>
          <View style={styles.previewHeader}>
            <View style={styles.pageAvatar}><Ionicons name="business" size={18} color="#fff" /></View>
            <View style={{ flex: 1 }}><Text style={styles.pageName} numberOfLines={1}>{connection?.display_name || 'Facebook Page'}</Text><Text style={styles.pageMeta}>Bài viết công khai</Text></View>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
          </View>
          <Text style={styles.previewCaption} numberOfLines={6}>{caption || 'Chưa có nội dung'}</Text>
          <View style={styles.previewMedia}>
            {cover ? <Image source={{ uri: cover }} style={styles.image} contentFit="cover" /> : <View style={styles.noImage}><Ionicons name="image-outline" size={28} color={colors.textMuted} /><Text style={styles.noImageText}>Chưa có ảnh</Text></View>}
          </View>
        </View>

        <View style={styles.captionCard}>
          <View style={styles.captionHeader}><View><Text style={styles.sectionLabel}>CAPTION SẼ ĐĂNG</Text><Text style={styles.characterCount}>{caption.length} ký tự</Text></View><Pressable style={styles.editButton} onPress={() => setEditing((value) => !value)}><Ionicons name={editing ? 'checkmark' : 'pencil-outline'} size={17} color={colors.jade[700]} /><Text style={styles.editText}>{editing ? 'Xong' : 'Sửa'}</Text></Pressable></View>
          {editing ? <TextInput style={styles.captionInput} value={caption} onChangeText={setCaption} multiline autoFocus /> : <Text style={styles.captionText}>{caption}</Text>}
        </View>

        <View style={styles.checklist}>
          <Text style={styles.sectionLabel}>KIỂM TRA NHANH</Text>
          {[
            { label: details.price ? 'Giá đã có trong hồ sơ tài sản' : 'Giá đang để thỏa thuận', ok: true },
            { label: details.address ? 'Địa chỉ đã được thêm' : 'Chưa có địa chỉ công khai', ok: !!details.address },
            { label: details.contactPhone ? 'Đã có số điện thoại liên hệ' : 'Chưa có số điện thoại liên hệ', ok: !!details.contactPhone },
          ].map((item) => <View style={styles.checkRow} key={item.label}><Ionicons name={item.ok ? 'checkmark-circle-outline' : 'alert-circle-outline'} size={19} color={item.ok ? colors.success : colors.warning} /><Text style={styles.checkText}>{item.label}</Text></View>)}
        </View>

        {error && <View style={styles.error}><Ionicons name="alert-circle-outline" size={19} color={colors.error} /><Text style={styles.errorText}>{error}</Text></View>}
        {!connection && !loadingConnection && <Pressable style={styles.connectLink} onPress={() => navigation.navigate('ConnectChannels')}><Text style={styles.connectLinkText}>Kết nối Facebook Page</Text><Ionicons name="arrow-forward" size={17} color={colors.jade[700]} /></Pressable>}
      </ScrollView>

      <View style={styles.footer}>
        <Button variant="primary" block loading={publishing} disabled={loadingConnection || !caption.trim()} onPress={handlePublish}>
          {connection ? 'Đăng lên Facebook' : 'Lưu bản nháp'}
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 15 },
  headerSpacer: { width: 48 },
  scroll: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 130 },
  overline: { color: colors.jade[700], fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1.1 },
  title: { marginTop: 4, color: colors.text, fontFamily: fonts.displayBold, fontSize: 24, lineHeight: 31 },
  subtitle: { marginTop: 5, color: colors.textMuted, fontSize: 12.5, lineHeight: 18 },
  destination: { marginTop: 18, minHeight: 78, padding: 14, borderRadius: radius.card, backgroundColor: colors.jade[50], borderWidth: 1, borderColor: colors.jade[100], flexDirection: 'row', alignItems: 'center', gap: 12 },
  destinationWarning: { backgroundColor: colors.amber[50], borderColor: colors.amber[100] },
  facebookMark: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#1877F2', alignItems: 'center', justifyContent: 'center' },
  destinationLabel: { color: colors.textMuted, fontFamily: fonts.displayBold, fontSize: 9, letterSpacing: 0.8 },
  destinationName: { marginTop: 2, color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 13.5 },
  destinationMethod: { marginTop: 2, color: colors.textMuted, fontSize: 11.5 },
  previewLabelRow: { marginTop: 26, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  sectionLabel: { color: colors.textMuted, fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 0.9 },
  previewHint: { color: colors.textMuted, fontSize: 10.5 },
  preview: { borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  previewHeader: { minHeight: 64, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  pageAvatar: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.jade[800], alignItems: 'center', justifyContent: 'center' },
  pageName: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 13.5 },
  pageMeta: { marginTop: 1, color: colors.textMuted, fontSize: 10.5 },
  previewCaption: { paddingHorizontal: 14, paddingBottom: 12, color: colors.text, fontSize: 13, lineHeight: 19 },
  previewMedia: { aspectRatio: 4 / 3, backgroundColor: colors.surfaceSubtle },
  image: { width: '100%', height: '100%' },
  noImage: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  noImageText: { color: colors.textMuted, fontSize: 11.5 },
  captionCard: { marginTop: 14, padding: 15, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  captionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  characterCount: { marginTop: 3, color: colors.textMuted, fontSize: 10.5 },
  editButton: { minHeight: 44, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
  editText: { color: colors.jade[700], fontFamily: fonts.displaySemiBold, fontSize: 12.5 },
  captionText: { marginTop: 12, color: colors.text, fontSize: 13.5, lineHeight: 20 },
  captionInput: { marginTop: 12, minHeight: 150, padding: 12, borderRadius: radius.control, borderWidth: 1, borderColor: colors.borderControl, color: colors.text, fontFamily: fonts.display, fontSize: 15, lineHeight: 22, textAlignVertical: 'top' },
  checklist: { marginTop: 14, padding: 15, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 11 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  checkText: { flex: 1, color: colors.textMuted, fontSize: 12.5 },
  error: { marginTop: 14, padding: 14, borderRadius: radius.control, backgroundColor: colors.errorBg, flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  errorText: { flex: 1, color: colors.error, fontSize: 12.5, lineHeight: 18 },
  connectLink: { marginTop: 14, minHeight: 50, borderRadius: radius.control, borderWidth: 1, borderColor: colors.borderControl, backgroundColor: colors.surface, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  connectLinkText: { color: colors.jade[700], fontFamily: fonts.displaySemiBold, fontSize: 13.5 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
})
