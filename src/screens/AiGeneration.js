import { useState } from 'react'
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import FlowHeader from '../components/FlowHeader'
import Chip from '../components/Chip'
import Button from '../components/Button'
import { AiTag } from '../components/StatusPill'
import { useListingDraft } from '../context/ListingDraftContext'
import { supabase } from '../lib/supabase'
import { photoAsBase64 } from '../lib/listingMedia'
import { colors, fonts, radius } from '../theme/tokens'

const OPTIONS = {
  tone: ['Chuyên nghiệp', 'Gần gũi', 'Điềm tĩnh'],
  audience: ['Gia đình trẻ', 'Nhà đầu tư', 'Người thuê', 'Khách phổ thông'],
  goal: ['Nhận tin nhắn', 'Đặt lịch xem', 'Giới thiệu tài sản'],
  length: ['Ngắn', 'Vừa', 'Chi tiết'],
}

export default function AiGeneration({ navigation }) {
  const { photos, photoUrls, details, generated, setGenerated, visualBrief, setVisualBrief } = useListingDraft()
  const [settings, setSettings] = useState({ tone: generated?.settings?.tone || 'Chuyên nghiệp', audience: generated?.settings?.audience || 'Khách phổ thông', goal: generated?.settings?.goal || 'Nhận tin nhắn', length: generated?.settings?.length || 'Vừa', emojiLevel: 'Ít' })
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState('')
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)

  const updateSetting = (key, value) => setSettings((current) => ({ ...current, [key]: value }))

  const runGeneration = async () => {
    setLoading(true); setError(null); setStage(photos.length || photoUrls.length ? 'Đang đọc hình ảnh…' : 'Đang chuẩn bị nội dung…')
    try {
      const images = (await Promise.all(photos.slice(0, 6).map(async (photo) => ({ base64: await photoAsBase64(photo), mimeType: photo.mimeType || 'image/jpeg' })))).filter((image) => image.base64)
      setStage(images.length || photoUrls.length ? 'Đang đọc ảnh và viết 3 hướng…' : 'Đang viết 3 hướng nội dung…')
      const { data, error: functionError } = await supabase.functions.invoke('generate-content', { body: {
        images, photoUrls, visualBrief, ...settings,
        title: details.title, dealType: details.dealType, propertyType: details.propertyType,
        price: details.priceNegotiable ? '' : details.price, priceNegotiable: details.priceNegotiable,
        area: details.area, bedrooms: details.bedrooms, bathrooms: details.bathrooms,
        address: details.address, direction: details.direction, legalStatus: details.legalStatus,
        contactPhone: details.contactPhone, description: details.description, amenities: details.amenities,
      } })
      if (functionError || data?.error) throw new Error(data?.error || functionError?.message || 'Không tạo được nội dung.')
      setVisualBrief(data.visualBrief || visualBrief)
      setGenerated(data)
    } catch (generationError) {
      let message = generationError.message || 'Không tạo được nội dung, thử lại sau.'
      try { const body = await generationError.context?.json?.(); if (body?.error) message = body.error } catch {}
      setError(message)
    } finally { setLoading(false); setStage('') }
  }

  const selectCandidate = (candidate) => setGenerated((current) => ({ ...current, selectedId: candidate.id, captionPrimary: candidate.caption, hashtags: candidate.hashtags, captionFriendly: current.candidates?.find((item) => item.id !== candidate.id)?.caption || '' }))
  const writeManually = () => { setGenerated({ candidates: [], selectedId: 'manual', captionPrimary: '', hashtags: '', captionFriendly: '', settings }); setEditing(true); setError(null) }
  const observations = generated?.visualBrief?.observations || visualBrief?.observations || []

  return <SafeAreaView style={styles.safe} edges={['top']}>
    <StatusBar style="dark" />
    <FlowHeader step={3} totalSteps={3} label="Nội dung" onBack={() => navigation.goBack()} onCancel={() => navigation.popToTop()} />
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.titleRow}><View style={{ flex: 1 }}><Text style={styles.eyebrow}>STUDIO NỘI DUNG</Text><Text style={styles.title}>Tạo bài viết có góc nhìn riêng</Text></View><AiTag /></View>
      <Text style={styles.subtitle}>AI đọc ảnh, kết hợp dữ liệu bạn nhập và tạo ba cách kể khác nhau để bạn chọn.</Text>

      <View style={styles.property}><View style={styles.propertyIcon}><Ionicons name="business-outline" size={20} color={colors.jade[700]} /></View><View style={{ flex: 1 }}><Text style={styles.propertyTitle} numberOfLines={1}>{details.title || details.propertyType || 'Bất động sản mới'}</Text><Text style={styles.propertyMeta}>{photos.length + photoUrls.length} ảnh · {details.area ? `${details.area} m²` : 'Chưa có diện tích'}</Text></View></View>

      <OptionGroup label="Đối tượng" name="audience" values={OPTIONS.audience} value={settings.audience} onChange={updateSetting} />
      <OptionGroup label="Mục tiêu" name="goal" values={OPTIONS.goal} value={settings.goal} onChange={updateSetting} />
      <OptionGroup label="Giọng văn" name="tone" values={OPTIONS.tone} value={settings.tone} onChange={updateSetting} />
      <OptionGroup label="Độ dài" name="length" values={OPTIONS.length} value={settings.length} onChange={updateSetting} />

      {!generated && !loading && <View style={styles.actions}><Button variant="primary" block icon="sparkles-outline" onPress={runGeneration}>Phân tích ảnh và tạo nội dung</Button><Pressable style={styles.manual} onPress={writeManually}><Ionicons name="create-outline" size={18} color={colors.jade[700]} /><Text style={styles.manualText}>Tự viết nội dung</Text></Pressable></View>}
      {loading && <View style={styles.loading}><ActivityIndicator color={colors.jade[700]} /><Text style={styles.loadingTitle}>{stage}</Text><Text style={styles.loadingText}>AI đang tách phần quan sát ảnh khỏi dữ kiện đã xác nhận.</Text></View>}
      {!!error && !loading && <View style={styles.error}><Text style={styles.errorText}>{error}</Text><Pressable onPress={runGeneration}><Text style={styles.retry}>Thử lại</Text></Pressable></View>}

      {!!generated && !loading && <>
        {observations.length > 0 && <View style={styles.visualCard}><View style={styles.visualHead}><Ionicons name="eye-outline" size={18} color={colors.ai} /><Text style={styles.visualTitle}>AI quan sát từ ảnh</Text></View>{observations.slice(0, 3).map((item, index) => <Text key={`${item.text}-${index}`} style={styles.observation}>• {item.text}</Text>)}<Text style={styles.visualNote}>Các nhận xét này hỗ trợ viết bài, không thay thế thông tin bạn xác nhận.</Text></View>}

        {generated.candidates?.length > 0 && <><Text style={styles.sectionTitle}>Chọn một hướng nội dung</Text>{generated.candidates.map((candidate) => { const selected = generated.selectedId === candidate.id; return <Pressable key={candidate.id} style={[styles.candidate, selected && styles.candidateSelected]} onPress={() => selectCandidate(candidate)}><View style={styles.candidateHead}><View style={{ flex: 1 }}><Text style={styles.candidateTitle}>{candidate.title}</Text><Text style={styles.candidateAngle}>{candidate.angle}</Text></View><Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={selected ? colors.jade[700] : colors.textMuted} /></View><Text style={styles.candidateBody} numberOfLines={selected ? undefined : 4}>{candidate.caption}</Text>{selected && <Text style={styles.tags}>{candidate.hashtags}</Text>}</Pressable> })}</>}

        <View style={styles.editor}><View style={styles.editorHead}><Text style={styles.editorTitle}>{generated.selectedId === 'manual' ? 'Nội dung của bạn' : 'Bản đang chọn'}</Text><Pressable style={styles.editAction} onPress={() => setEditing((value) => !value)}><Ionicons name={editing ? 'checkmark' : 'pencil-outline'} size={17} color={colors.jade[700]} /><Text style={styles.editText}>{editing ? 'Xong' : 'Chỉnh sửa'}</Text></Pressable></View>{editing ? <><TextInput style={styles.captionInput} multiline value={generated.captionPrimary} onChangeText={(captionPrimary) => setGenerated((current) => ({ ...current, captionPrimary }))} /><TextInput style={styles.hashtagInput} value={generated.hashtags} onChangeText={(hashtags) => setGenerated((current) => ({ ...current, hashtags }))} placeholder="#hashtag" /></> : <><Text style={styles.caption}>{generated.captionPrimary || 'Chưa có nội dung'}</Text><Text style={styles.tags}>{generated.hashtags}</Text></>}</View>
        <Pressable style={styles.regenerate} onPress={runGeneration}><Ionicons name="refresh" size={17} color={colors.jade[700]} /><Text style={styles.regenerateText}>Tạo ba phương án mới</Text></Pressable>
      </>}
    </ScrollView>
    <View style={styles.sticky}><Pressable style={styles.save} onPress={() => navigation.navigate('Dashboard')}><Text style={styles.saveText}>Lưu và thoát</Text></Pressable><Button variant="primary" block disabled={loading || !generated?.captionPrimary?.trim()} onPress={() => navigation.navigate('Publish')}>Kiểm tra trước khi đăng</Button></View>
  </SafeAreaView>
}

function OptionGroup({ label, name, values, value, onChange }) {
  return <View style={styles.optionGroup}><Text style={styles.optionLabel}>{label}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.optionRow}>{values.map((item) => <Chip key={item} active={value === item} onPress={() => onChange(name, item)}>{item}</Chip>)}</ScrollView></View>
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas }, scroll: { padding: 20, paddingBottom: 165 }, titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 }, eyebrow: { color: colors.jade[700], fontFamily: fonts.displayBold, fontSize: 10, letterSpacing: 1.1 }, title: { marginTop: 4, color: colors.text, fontFamily: fonts.displayBold, fontSize: 23, lineHeight: 30 }, subtitle: { marginTop: 6, color: colors.textMuted, fontSize: 12.5, lineHeight: 18 },
  property: { marginTop: 17, minHeight: 70, padding: 13, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', gap: 11 }, propertyIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.jade[50], alignItems: 'center', justifyContent: 'center' }, propertyTitle: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 14 }, propertyMeta: { marginTop: 3, color: colors.textMuted, fontSize: 11.5 },
  optionGroup: { marginTop: 15 }, optionLabel: { marginBottom: 7, color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 13 }, optionRow: { gap: 7, paddingRight: 12 }, actions: { marginTop: 23, gap: 9 }, manual: { minHeight: 52, borderRadius: radius.control, borderWidth: 1, borderColor: colors.borderControl, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }, manualText: { color: colors.jade[700], fontFamily: fonts.displaySemiBold, fontSize: 14 },
  loading: { marginTop: 22, padding: 24, borderRadius: radius.card, backgroundColor: colors.aiBg, alignItems: 'center' }, loadingTitle: { marginTop: 11, color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 14 }, loadingText: { marginTop: 4, color: colors.textMuted, fontSize: 11.5, lineHeight: 17, textAlign: 'center' }, error: { marginTop: 18, padding: 15, borderRadius: radius.card, backgroundColor: colors.errorBg }, errorText: { color: colors.error, fontSize: 12.5, lineHeight: 18 }, retry: { marginTop: 9, color: colors.jade[700], fontFamily: fonts.displayBold, fontSize: 13 },
  visualCard: { marginTop: 18, padding: 15, borderRadius: radius.card, backgroundColor: colors.aiBg, borderWidth: 1, borderColor: colors.aiBorder }, visualHead: { flexDirection: 'row', alignItems: 'center', gap: 7 }, visualTitle: { color: colors.ai, fontFamily: fonts.displayBold, fontSize: 13 }, observation: { marginTop: 7, color: colors.text, fontSize: 12.5, lineHeight: 18 }, visualNote: { marginTop: 10, color: colors.textMuted, fontSize: 10.5, lineHeight: 15 }, sectionTitle: { marginTop: 24, marginBottom: 10, color: colors.text, fontFamily: fonts.displayBold, fontSize: 18 },
  candidate: { marginBottom: 10, padding: 15, borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }, candidateSelected: { borderWidth: 1.5, borderColor: colors.jade[500], backgroundColor: colors.jade[50] }, candidateHead: { flexDirection: 'row', alignItems: 'center', gap: 10 }, candidateTitle: { color: colors.text, fontFamily: fonts.displaySemiBold, fontSize: 14 }, candidateAngle: { marginTop: 2, color: colors.textMuted, fontSize: 10.5 }, candidateBody: { marginTop: 10, color: colors.text, fontSize: 13, lineHeight: 20 }, tags: { marginTop: 8, color: colors.jade[700], fontFamily: fonts.displayMedium, fontSize: 12.5, lineHeight: 18 },
  editor: { marginTop: 12, padding: 15, borderRadius: radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }, editorHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, editorTitle: { color: colors.text, fontFamily: fonts.displayBold, fontSize: 14 }, editAction: { minHeight: 44, paddingLeft: 12, flexDirection: 'row', alignItems: 'center', gap: 5 }, editText: { color: colors.jade[700], fontFamily: fonts.displaySemiBold, fontSize: 12 }, caption: { marginTop: 10, color: colors.text, fontSize: 14, lineHeight: 21 }, captionInput: { marginTop: 10, minHeight: 150, padding: 12, borderRadius: radius.control, borderWidth: 1, borderColor: colors.borderControl, color: colors.text, fontSize: 15, lineHeight: 22, textAlignVertical: 'top' }, hashtagInput: { marginTop: 8, minHeight: 48, paddingHorizontal: 12, borderRadius: radius.control, borderWidth: 1, borderColor: colors.border, color: colors.jade[700] }, regenerate: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, regenerateText: { color: colors.jade[700], fontFamily: fonts.displaySemiBold, fontSize: 13 },
  sticky: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 28, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }, save: { minHeight: 40, alignItems: 'center', justifyContent: 'center' }, saveText: { color: colors.textMuted, fontFamily: fonts.displaySemiBold, fontSize: 12.5 },
})
