import { useEffect, useState } from 'react'
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Toast from '../components/Toast'
import { useListingDraft } from '../context/ListingDraftContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { uploadListingPhotos } from '../lib/uploadListingPhotos'
import { colors, fonts, radius, shadow } from '../theme/tokens'

const PLATFORMS = ['Facebook']

const WARNINGS = {
  Facebook: 'Facebook dùng tỉ lệ 4:5. Ảnh/video 9:16 sẽ được cắt tự động khi đăng.',
}

export default function Publish({ navigation }) {
  const { photos, videos, details, generated, photoUrls, reset } = useListingDraft()
  const { user } = useAuth()
  const [platform, setPlatform] = useState('Facebook')
  const [status, setStatus] = useState('idle') // idle | publishing | done | error
  const [publishError, setPublishError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [captions, setCaptions] = useState({ Facebook: '' })
  const [connectedFacebook, setConnectedFacebook] = useState(false)
  const [publishNote, setPublishNote] = useState(null)

  useEffect(() => {
    if (!generated) return
    const combined = [generated.captionPrimary, generated.hashtags].filter(Boolean).join('\n\n')
    setCaptions({
      Facebook: combined,
    })
  }, [generated])

  useEffect(() => {
    if (!user) return
    supabase
      .from('connected_channels_public')
      .select('platform')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .then(({ data }) => {
        const platforms = (data ?? []).map((r) => r.platform)
        setConnectedFacebook(platforms.includes('facebook'))
      })
  }, [user])

  const coverPhoto = photos[0]
  const cover = coverPhoto?.base64 ? `data:${coverPhoto.mimeType};base64,${coverPhoto.base64}` : coverPhoto?.uri
  const hasVideo = videos.length > 0

  const logPost = async (listingId, postPlatform, method, postStatus, errorMessage) => {
    await supabase.from('post_logs').insert({
      user_id: user.id,
      listing_id: listingId,
      platform: postPlatform,
      method,
      status: postStatus,
      error_message: errorMessage ?? null,
    })
  }

  const handlePublish = async () => {
    setStatus('publishing')
    setPublishError(null)
    setPublishNote(null)

    try {
      let urls = photoUrls
      if (!urls.length && photos.length) {
        urls = await uploadListingPhotos(user.id, photos)
      }
      const { data: listing, error } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          title: details.title || null,
          deal_type: details.dealType,
          price: details.price || null,
          area: details.area || null,
          bedrooms: details.bedrooms || null,
          address: details.address || null,
          direction: details.direction || null,
          legal_status: details.legalStatus || null,
          contact_phone: details.contactPhone || null,
          description: details.description || null,
          amenities: details.amenities,
          photo_urls: urls,
          caption_primary: captions.Facebook || generated?.captionPrimary || null,
          hashtags: generated?.hashtags || null,
          caption_friendly: generated?.captionFriendly || null,
          status: 'live',
        })
        .select('id')
        .single()
      if (error) throw error

      const notes = []
      let hasError = false
      if (connectedFacebook) {
        const { data: facebookData, error: facebookError } = await supabase.functions.invoke('facebook-publish', {
          body: {
            listingId: listing.id,
            message: captions.Facebook || generated?.captionPrimary || '',
            imageUrls: urls,
          },
        })
        if (facebookError || facebookData?.error) {
          hasError = true
          const message = facebookData?.error ?? facebookError?.message ?? 'Facebook đăng bài thất bại'
          notes.push(`Facebook: ${message}`)
          await logPost(listing.id, 'facebook', 'auto', 'error', message)
        } else {
          notes.push(`Facebook: đã đăng lên ${facebookData?.pageName ?? 'Page'}`)
          await logPost(listing.id, 'facebook', 'auto', 'success')
        }
      } else {
        notes.push('Facebook: chưa kết nối Page')
      }

      setPublishNote(notes.length ? notes.join('\n') : null)

      setStatus('done')
      reset()

    } catch (e) {
      setPublishError(e.message ?? 'Không đăng được, thử lại sau.')
      setStatus('idle')
    }
  }

  useEffect(() => {
    if (status !== 'done') return
    const t = setTimeout(() => navigation.popToTop(), 1500)
    return () => clearTimeout(t)
  }, [status, navigation])

  const publishLabel = status === 'publishing' ? 'Đang đăng…' : status === 'done' ? 'Đã lưu ✓' : 'Đăng bài'

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.sand[700]} />
        </Pressable>
        <Text style={styles.headerTitle}>Xem trước & đăng</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.platformRow}>
          {PLATFORMS.map((p) => (
            <Pressable
              key={p}
              onPress={() => setPlatform(p)}
              style={[styles.platformTab, platform === p && styles.platformTabActive]}
            >
              <Text style={[styles.platformTabLabel, platform === p && styles.platformTabLabelActive]}>{p}</Text>
            </Pressable>
          ))}
        </View>

        {platform === 'TikTok' && (
          <View style={styles.tiktokPreview}>
            {cover ? <Image source={{ uri: cover }} style={StyleSheet.absoluteFillObject} contentFit="cover" /> : <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#1a1712' }]} />}
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={StyleSheet.absoluteFillObject} start={{ x: 0, y: 0.4 }} end={{ x: 0, y: 1 }} />
            <View style={styles.previewRatio}>
              <Text style={styles.previewRatioLabel}>{hasVideo ? '9:16 · video' : '9:16 · ảnh'}</Text>
            </View>
            <View style={styles.previewChrome}>
              <View style={styles.previewChromeItem}>
                <Ionicons name="heart" size={26} color="#fff" />
                <Text style={styles.previewChromeCount}>0</Text>
              </View>
              <View style={styles.previewChromeItem}>
                <Ionicons name="chatbubble" size={24} color="#fff" />
                <Text style={styles.previewChromeCount}>0</Text>
              </View>
              <View style={styles.previewChromeItem}>
                <Ionicons name="arrow-redo" size={24} color="#fff" />
                <Text style={styles.previewChromeCount}>Chia sẻ</Text>
              </View>
            </View>
            <View style={styles.previewCaption}>
              <Text style={styles.previewHandle}>@minhtran.bds</Text>
              <Text style={styles.previewTextDark} numberOfLines={3}>
                {captions.TikTok}
              </Text>
            </View>
          </View>
        )}

        {platform === 'Facebook' && (
          <View style={styles.fbCard}>
            <View style={styles.fbHeadRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLabel}>MT</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fbName}>Minh Trần BĐS</Text>
                <View style={styles.fbMetaRow}>
                  <Text style={styles.fbMeta}>Vừa xong</Text>
                  <Ionicons name="earth" size={11} color={colors.sand[500]} />
                </View>
              </View>
              <Ionicons name="ellipsis-horizontal" size={18} color={colors.sand[500]} />
            </View>
            <Text style={styles.fbCaption} numberOfLines={5}>
              {captions.Facebook}
            </Text>
            <View style={styles.fbImageWrap}>
              {cover ? <Image source={{ uri: cover }} style={styles.fbImage} contentFit="cover" /> : <View style={[styles.fbImage, { backgroundColor: colors.sand[200] }]} />}
            </View>
            <View style={styles.fbActionsRow}>
              <View style={styles.fbAction}>
                <Ionicons name="thumbs-up-outline" size={17} color={colors.sand[600]} />
                <Text style={styles.fbActionLabel}>Thích</Text>
              </View>
              <View style={styles.fbAction}>
                <Ionicons name="chatbubble-outline" size={16} color={colors.sand[600]} />
                <Text style={styles.fbActionLabel}>Bình luận</Text>
              </View>
              <View style={styles.fbAction}>
                <Ionicons name="arrow-redo-outline" size={16} color={colors.sand[600]} />
                <Text style={styles.fbActionLabel}>Chia sẻ</Text>
              </View>
            </View>
          </View>
        )}


        <View style={styles.captionCard}>
          <View style={styles.captionHead}>
            <Text style={styles.captionTitle}>Caption riêng cho {platform}</Text>
            <Pressable onPress={() => setEditing((v) => !v)}>
              <Text style={styles.captionEdit}>{editing ? 'Xong' : 'Sửa'}</Text>
            </Pressable>
          </View>
          {editing ? (
            <TextInput
              style={styles.captionInput}
              multiline
              value={captions[platform]}
              onChangeText={(v) => setCaptions((prev) => ({ ...prev, [platform]: v }))}
            />
          ) : (
            <Text style={styles.captionText}>{captions[platform]}</Text>
          )}
        </View>

        {WARNINGS[platform] && (
          <View style={styles.warning}>
            <Ionicons name="warning-outline" size={18} color={colors.amber[500]} style={{ marginTop: 1 }} />
            <Text style={styles.warningText}>{WARNINGS[platform]}</Text>
          </View>
        )}

        {publishError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.error} style={{ marginTop: 1 }} />
            <Text style={styles.errorText}>{publishError}</Text>
          </View>
        )}

        {publishNote && (
          <View style={styles.warning}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={colors.amber[500]}
              style={{ marginTop: 1 }}
            />
            <Text style={styles.warningText}>{publishNote}</Text>
          </View>
        )}
      </ScrollView>

      {status === 'done' && <Toast>Đã lưu tin đăng</Toast>}

      <View style={styles.sticky}>
        <View style={styles.stickyRow}>
          <Pressable style={styles.scheduleBtn} onPress={() => navigation.navigate('Schedule')}>
            <Text style={styles.scheduleBtnLabel}>Lịch</Text>
          </Pressable>
          <Pressable
            style={[styles.publishBtn, status !== 'idle' && { opacity: 0.7 }]}
            onPress={handlePublish}
            disabled={status !== 'idle'}
          >
            <Text style={styles.publishBtnLabel}>{publishLabel}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand[100] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow.e1 },
  headerTitle: { fontSize: 16, fontFamily: fonts.displayBold, color: colors.sand[900] },

  scroll: { padding: 20, paddingBottom: 140 },
  platformRow: { flexDirection: 'row', gap: 8 },
  platformTab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.full, backgroundColor: '#fff', ...shadow.e1 },
  platformTabActive: { backgroundColor: colors.sand[900] },
  platformTabLabel: { fontFamily: fonts.displayMedium, fontSize: 12, color: colors.sand[700] },
  platformTabLabelActive: { color: '#fff', fontFamily: fonts.displaySemiBold },

  // TikTok — full-bleed 9:16
  tiktokPreview: { marginTop: 14, borderRadius: 18, overflow: 'hidden', height: 430, padding: 12, backgroundColor: '#1a1712' },
  previewRatio: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,255,255,0.16)', paddingVertical: 4, paddingHorizontal: 9, borderRadius: 6 },
  previewRatioLabel: { fontFamily: fonts.monoSemiBold, fontSize: 10, color: '#fff' },
  previewChrome: { position: 'absolute', right: 10, bottom: 80, gap: 16, alignItems: 'center' },
  previewChromeItem: { alignItems: 'center', gap: 3 },
  previewChromeCount: { fontSize: 10, color: '#fff' },
  previewCaption: { position: 'absolute', left: 12, right: 60, bottom: 14 },
  previewHandle: { fontSize: 13, fontFamily: fonts.displayBold, color: '#fff' },
  previewTextDark: { fontSize: 12, lineHeight: 17, marginTop: 4, opacity: 0.95, color: '#fff' },

  // Shared avatar
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.jade[600], alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 13 },

  // Facebook card
  fbCard: { marginTop: 14, backgroundColor: '#fff', borderRadius: 14, padding: 14, ...shadow.e1 },
  fbHeadRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fbName: { fontSize: 14, fontFamily: fonts.displayBold, color: colors.sand[900] },
  fbMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  fbMeta: { fontSize: 11.5, color: colors.sand[500], fontFamily: fonts.displayMedium },
  fbCaption: { fontSize: 13.5, lineHeight: 19, color: colors.sand[900], marginTop: 10 },
  fbImageWrap: { marginTop: 10, borderRadius: 10, overflow: 'hidden', aspectRatio: 4 / 5, backgroundColor: colors.sand[200] },
  fbImage: { width: '100%', height: '100%' },
  fbActionsRow: { flexDirection: 'row', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.sand[100], gap: 22 },
  fbAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fbActionLabel: { fontSize: 12.5, fontFamily: fonts.displaySemiBold, color: colors.sand[600] },

  // Zalo card
  zaloCard: { marginTop: 14, backgroundColor: '#fff', borderRadius: 14, padding: 14, ...shadow.e1 },
  zaloHeadRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  zaloImageWrap: { marginTop: 10, borderRadius: 10, overflow: 'hidden', aspectRatio: 1, backgroundColor: colors.sand[200] },
  zaloImage: { width: '100%', height: '100%' },
  personalShareBtn: { marginTop: 14, backgroundColor: '#0068ff', borderRadius: 12, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  personalShareLabel: { color: '#fff', fontFamily: fonts.displayBold, fontSize: 13 },

  captionCard: { marginTop: 14, backgroundColor: '#fff', borderRadius: 14, padding: 14, ...shadow.e1 },
  captionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  captionTitle: { fontSize: 13, fontFamily: fonts.displaySemiBold, color: colors.sand[900] },
  captionEdit: { fontFamily: fonts.displaySemiBold, fontSize: 11, color: colors.jade[600] },
  captionText: { fontSize: 13, color: colors.sand[700], lineHeight: 19, marginTop: 8 },
  captionInput: { fontSize: 13, color: colors.sand[700], lineHeight: 19, marginTop: 8, minHeight: 70, textAlignVertical: 'top', padding: 0 },

  warning: { marginTop: 10, backgroundColor: colors.amber[50], borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10 },
  warningText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.amber[800] },

  errorBox: { marginTop: 10, backgroundColor: colors.errorBg, borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10 },
  errorText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.error },

  sticky: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: 30, backgroundColor: colors.sand[100] },
  stickyRow: { flexDirection: 'row', gap: 10 },
  scheduleBtn: { borderWidth: 1, borderColor: colors.sand[300], backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 18, borderRadius: 16 },
  scheduleBtnLabel: { fontFamily: fonts.displayBold, fontSize: 15, color: colors.sand[700] },
  publishBtn: {
    flex: 1,
    backgroundColor: colors.jade[500],
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.jade[500],
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  publishBtnLabel: { fontFamily: fonts.displayBold, fontSize: 16, color: '#fff' },
})
