import { useEffect, useState } from 'react'
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import FlowHeader from '../components/FlowHeader'
import Chip from '../components/Chip'
import Button from '../components/Button'
import { AiTag } from '../components/StatusPill'
import { useListingDraft } from '../context/ListingDraftContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { uploadListingPhotos } from '../lib/uploadListingPhotos'
import { colors, fonts, radius, shadow } from '../theme/tokens'

const TONES = ['Chuyên nghiệp', 'Thân thiện', 'Sang trọng', 'Gấp']

export default function AiGeneration({ navigation }) {
  const { photos, details, generated, setGenerated, setPhotoUrls } = useListingDraft()
  const { user } = useAuth()
  const [tone, setTone] = useState('Chuyên nghiệp')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [uploaded, setUploaded] = useState(false)
  const [editingPrimary, setEditingPrimary] = useState(false)
  const [editingFriendly, setEditingFriendly] = useState(false)

  const runGeneration = async (selectedTone) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-content', {
        body: {
          images: photos.map((p) => ({ base64: p.base64, mimeType: p.mimeType })),
          title: details.title,
          dealType: details.dealType,
          price: details.price,
          area: details.area,
          bedrooms: details.bedrooms,
          address: details.address,
          direction: details.direction,
          legalStatus: details.legalStatus,
          contactPhone: details.contactPhone,
          description: details.description,
          amenities: details.amenities,
          tone: selectedTone,
        },
      })
      if (fnError) throw fnError
      if (data?.error) throw new Error(data.error)
      setGenerated(data)
      if (!uploaded && user) {
        const urls = await uploadListingPhotos(user.id, photos)
        setPhotoUrls(urls)
        setUploaded(true)
      }
    } catch (e) {
      // FunctionsHttpError normally exposes the Edge Function response on
      // `context`; read it so the user sees the real backend error instead of
      // only Supabase's generic "non-2xx status code" message.
      let message = e.message ?? 'Không tạo được nội dung, thử lại sau.'
      try {
        const response = e.context
        if (response?.json) {
          const body = await response.json()
          if (body?.error) message = body.error
        }
      } catch {
        // Keep the original error when the response is not JSON.
      }
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runGeneration(tone)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectTone = (t) => {
    if (loading) return
    setTone(t)
    runGeneration(t)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <FlowHeader step={3} totalSteps={3} label="Nội dung" onBack={() => navigation.goBack()} onCancel={() => navigation.popToTop()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Nội dung bài đăng</Text>
          <AiTag />
        </View>
        <Text style={styles.subtitle}>Luôn có thể sửa · AI tạo dựa trên ảnh & thông tin bạn nhập</Text>

        <Text style={styles.toneLabel}>Giọng văn</Text>
        <View style={styles.toneRow}>
          {TONES.map((t) => (
            <Chip key={t} tone active={tone === t} onPress={() => selectTone(t)}>
              {t}
            </Chip>
          ))}
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.jade[500]} />
            <Text style={styles.loadingLabel}>AI đang tạo nội dung…</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => runGeneration(tone)}>
              <Text style={styles.retry}>Thử lại</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && generated && (
          <>
            <View style={styles.pinnedCard}>
              <View style={styles.pinnedHead}>
                <View style={styles.pinnedLabelRow}>
                  <Ionicons name="star" size={13} color={colors.amber[500]} />
                  <Text style={styles.pinnedLabel}>Caption chính · {tone}</Text>
                </View>
                <Pressable hitSlop={8} onPress={() => setEditingPrimary((v) => !v)}>
                  <Ionicons name={editingPrimary ? 'checkmark' : 'pencil-outline'} size={18} color={editingPrimary ? colors.jade[600] : colors.sand[500]} />
                </Pressable>
              </View>
              {editingPrimary ? (
                <>
                  <TextInput
                    style={styles.pinnedTextInput}
                    multiline
                    value={generated.captionPrimary}
                    onChangeText={(v) => setGenerated((prev) => ({ ...prev, captionPrimary: v }))}
                  />
                  <TextInput
                    style={styles.pinnedTagsInput}
                    value={generated.hashtags}
                    onChangeText={(v) => setGenerated((prev) => ({ ...prev, hashtags: v }))}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.pinnedText}>{generated.captionPrimary}</Text>
                  <Text style={styles.pinnedTags}>{generated.hashtags}</Text>
                </>
              )}
            </View>

            <View style={styles.variantCard}>
              <View style={styles.variantHead}>
                <Text style={styles.variantLabel}>Biến thể 2 · Thân thiện</Text>
                <View style={{ flexDirection: 'row', gap: 14 }}>
                  <Pressable hitSlop={8} onPress={() => setEditingFriendly((v) => !v)}>
                    <Text style={styles.variantAction}>{editingFriendly ? 'Xong' : 'Sửa'}</Text>
                  </Pressable>
                  <Pressable onPress={() => runGeneration(tone)}>
                    <Text style={styles.variantAction}>Tạo lại</Text>
                  </Pressable>
                </View>
              </View>
              {editingFriendly ? (
                <TextInput
                  style={styles.variantTextInput}
                  multiline
                  value={generated.captionFriendly}
                  onChangeText={(v) => setGenerated((prev) => ({ ...prev, captionFriendly: v }))}
                />
              ) : (
                <Text style={styles.variantText}>{generated.captionFriendly}</Text>
              )}
            </View>

            {generated.videoScript && (
              <View style={styles.scriptCard}>
                <View style={styles.scriptHead}>
                  <Ionicons name="videocam-outline" size={14} color={colors.sand[500]} />
                  <Text style={styles.scriptHeadLabel}>Kịch bản video 30 giây</Text>
                </View>
                <Text style={styles.scriptBody}>
                  {Object.entries(generated.videoScript).map(([time, desc], i) => (
                    <Text key={time}>
                      <Text style={styles.scriptTime}>{time}</Text> {desc}
                      {i < Object.entries(generated.videoScript).length - 1 ? '\n' : ''}
                    </Text>
                  ))}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.sticky}>
        <Button variant="primary" block disabled={loading || !generated} onPress={() => navigation.navigate('Publish')}>
          Xem trước & đăng
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand[50] },
  scroll: { padding: 20, paddingBottom: 120 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 22, fontFamily: fonts.displayBold, color: colors.sand[900] },
  subtitle: { fontSize: 12, color: colors.sand[600], marginTop: 3 },

  toneLabel: { marginTop: 14, fontSize: 13, fontFamily: fonts.displaySemiBold, color: colors.sand[700] },
  toneRow: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  loadingBox: { marginTop: 24, alignItems: 'center', gap: 10, paddingVertical: 30 },
  loadingLabel: { fontSize: 13, color: colors.sand[500], fontFamily: fonts.displayMedium },

  errorBox: { marginTop: 16, backgroundColor: colors.errorBg, borderRadius: radius.sheet, padding: 15, gap: 8 },
  errorText: { fontSize: 13, color: colors.error, fontFamily: fonts.displayMedium },
  retry: { fontFamily: fonts.displayBold, fontSize: 13, color: colors.jade[600] },

  pinnedCard: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: radius.sheet,
    padding: 15,
    borderWidth: 1.5,
    borderColor: colors.amber[400],
    ...shadow.e2,
  },
  pinnedHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pinnedLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pinnedLabel: { fontFamily: fonts.displayBold, fontSize: 11, color: colors.amber[700] },
  pinnedText: { fontSize: 14, lineHeight: 21, color: colors.ink, marginTop: 10 },
  pinnedTags: { fontSize: 13, color: colors.jade[600], fontFamily: fonts.displayMedium, marginTop: 8 },
  pinnedTextInput: { fontSize: 14, lineHeight: 21, color: colors.ink, marginTop: 10, minHeight: 70, textAlignVertical: 'top', padding: 0 },
  pinnedTagsInput: { fontSize: 13, color: colors.jade[600], fontFamily: fonts.displayMedium, marginTop: 8, padding: 0 },

  variantCard: { marginTop: 10, backgroundColor: '#fff', borderRadius: radius.sheet, padding: 15, ...shadow.e1 },
  variantHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  variantLabel: { fontFamily: fonts.displaySemiBold, fontSize: 12, color: colors.sand[600] },
  variantAction: { fontFamily: fonts.displaySemiBold, fontSize: 11, color: colors.jade[600] },
  variantText: { fontSize: 14, lineHeight: 21, color: colors.sand[700], marginTop: 8 },
  variantTextInput: { fontSize: 14, lineHeight: 21, color: colors.sand[700], marginTop: 8, minHeight: 60, textAlignVertical: 'top', padding: 0 },

  scriptCard: { marginTop: 10, backgroundColor: '#fff', borderRadius: radius.sheet, padding: 15, ...shadow.e1 },
  scriptHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scriptHeadLabel: { fontFamily: fonts.displaySemiBold, fontSize: 12, color: colors.sand[600] },
  scriptBody: { fontSize: 13, lineHeight: 20, color: colors.sand[700], marginTop: 8 },
  scriptTime: { color: colors.sand[900], fontFamily: fonts.displaySemiBold },

  sticky: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: 30, backgroundColor: colors.sand[50] },
})
