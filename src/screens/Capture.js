import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, Image } from 'react-native'
import { Image as ExpoImage } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import * as ImagePicker from 'expo-image-picker'
import { VideoView, useVideoPlayer } from 'expo-video'
import { Ionicons } from '@expo/vector-icons'
import FlowHeader from '../components/FlowHeader'
import Button from '../components/Button'
import { useListingDraft } from '../context/ListingDraftContext'
import { colors, fonts, radius } from '../theme/tokens'

function VideoTile({ video, onRemove }) {
  const [thumbnail, setThumbnail] = useState(null)
  const player = useVideoPlayer(video.uri, (instance) => {
    instance.muted = true
    instance.currentTime = 0
  })

  useEffect(() => {
    let active = true
    const createThumbnail = async () => {
      try {
        const [image] = await player.generateThumbnailsAsync(0, { maxWidth: 800 })
        if (active) setThumbnail(image)
      } catch (error) {
        console.warn('[Capture] video thumbnail failed:', error?.message ?? error)
      }
    }
    createThumbnail()
    return () => { active = false }
  }, [player])

  return (
    <Pressable style={[styles.tile, styles.photoTile, styles.videoTile]} onLongPress={onRemove}>
      {thumbnail ? (
        <ExpoImage source={thumbnail} style={styles.tileImage} contentFit="cover" />
      ) : (
        <VideoView player={player} style={styles.videoSurface} contentFit="cover" nativeControls={false} />
      )}
      <View pointerEvents="none" style={styles.videoPlayOverlay}>
        <Ionicons name="play-circle" size={34} color="#fff" />
      </View>
    </Pressable>
  )
}

export default function Capture({ navigation }) {
  const { photos, setPhotos, videos, setVideos } = useListingDraft()

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập ảnh', 'Vui lòng cấp quyền thư viện ảnh trong Cài đặt để chọn ảnh/video căn nhà.')
      return false
    }
    return true
  }

  const pickPhotos = async () => {
    if (!(await requestPermission())) return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 12,
      quality: 0.7,
      base64: true,
    })
    if (result.canceled) return
    console.log('[Capture] picker assets:', result.assets.map((a) => ({ uri: a.uri, hasBase64: !!a.base64, base64Length: a.base64?.length, mimeType: a.mimeType })))
    const picked = result.assets.map((a) => ({ uri: a.uri, base64: a.base64, mimeType: a.mimeType ?? 'image/jpeg' }))
    setPhotos((prev) => [...prev, ...picked].slice(0, 12))
  }

  const pickVideo = async () => {
    if (!(await requestPermission())) return
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsMultipleSelection: false,
      quality: 0.7,
    })
    if (result.canceled) return
    const picked = result.assets.map((a) => ({ uri: a.uri, mimeType: a.mimeType ?? 'video/mp4', duration: a.duration }))
    setVideos((prev) => [...prev, ...picked].slice(0, 3))
  }

  const removePhoto = (uri) => setPhotos((prev) => prev.filter((p) => p.uri !== uri))
  const removeVideo = (uri) => setVideos((prev) => prev.filter((v) => v.uri !== uri))

  const totalCount = photos.length + videos.length

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <FlowHeader step={1} totalSteps={3} label="Chọn ảnh & video" onBack={() => navigation.goBack()} onCancel={() => navigation.popToTop()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Chọn ảnh & video căn nhà</Text>
        <Text style={styles.subtitle}>
          Đã chọn <Text style={styles.subtitleStrong}>{photos.length} ảnh, {videos.length} video</Text> · ảnh đầu tiên là ảnh bìa
        </Text>

        <View style={styles.grid}>
          {photos.map((p, i) => (
            <Pressable key={p.uri} style={[styles.tile, styles.photoTile]} onLongPress={() => removePhoto(p.uri)}>
              <Image
                source={{ uri: `data:${p.mimeType ?? 'image/jpeg'};base64,${p.base64}` }}
                style={styles.tileImage}
                resizeMode="cover"
              />
              <View style={[styles.tileNum, i === 0 && { backgroundColor: colors.jade[500] }]}>
                <Text style={styles.tileNumLabel}>{i + 1}</Text>
              </View>
              {i === 0 && (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeLabel}>BÌA</Text>
                </View>
              )}
            </Pressable>
          ))}
          {videos.map((v) => <VideoTile key={v.uri} video={v} onRemove={() => removeVideo(v.uri)} />)}
          {photos.length < 12 && (
            <Pressable style={[styles.tile, styles.addTile]} onPress={pickPhotos}>
              <Ionicons name="images-outline" size={22} color={colors.sand[500]} />
              <Text style={styles.addTileLabel}>Thêm ảnh</Text>
            </Pressable>
          )}
          {videos.length < 3 && (
            <Pressable style={[styles.tile, styles.addTile]} onPress={pickVideo}>
              <Ionicons name="videocam-outline" size={22} color={colors.sand[500]} />
              <Text style={styles.addTileLabel}>Thêm video</Text>
            </Pressable>
          )}
        </View>

        {totalCount > 0 && <Text style={styles.hint}>Giữ để xoá</Text>}

        <View style={styles.cameraTeaser}>
          <View style={styles.cameraIcon}>
            <Ionicons name="camera-outline" size={19} color={colors.amber[200]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cameraTitle}>Chụp trong app với khung căn phòng</Text>
            <Text style={styles.cameraSub}>Đường dẫn giúp canh thẳng & đủ sáng</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.sticky}>
        <Button variant="primary" block disabled={totalCount === 0} onPress={() => navigation.navigate('PropertyDetails')}>
          Tiếp tục · {totalCount} mục
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.sand[50] },
  scroll: { padding: 20, paddingBottom: 120 },
  title: { fontSize: 22, fontFamily: fonts.displayBold, color: colors.sand[900] },
  subtitle: { fontSize: 13, color: colors.sand[600], marginTop: 3 },
  subtitleStrong: { color: colors.sand[900], fontFamily: fonts.displaySemiBold },
  hint: { fontSize: 11, color: colors.sand[400], marginTop: 8 },

  grid: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  tile: { width: '31.8%', aspectRatio: 1, position: 'relative', borderRadius: 12, padding: 6, justifyContent: 'space-between', overflow: 'hidden', backgroundColor: colors.sand[200] },
  photoTile: { padding: 0 },
  tileImage: { width: '100%', height: '100%', borderRadius: 12 },
  videoSurface: { ...StyleSheet.absoluteFillObject, borderRadius: 12 },
  videoPlayOverlay: { position: 'absolute', zIndex: 2, top: '50%', left: '50%', width: 40, height: 40, marginTop: -20, marginLeft: -20, alignItems: 'center', justifyContent: 'center' },
  tileNum: {
    position: 'absolute',
    top: 6,
    left: 6,
    alignSelf: 'flex-start',
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(26,138,111,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileNumLabel: { color: '#fff', fontFamily: fonts.monoBold, fontSize: 10 },
  coverBadge: { position: 'absolute', left: 6, bottom: 6, alignSelf: 'flex-start', backgroundColor: 'rgba(26,23,18,0.7)', paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4 },
  coverBadgeLabel: { color: '#fff', fontFamily: fonts.displaySemiBold, fontSize: 9 },

  videoTile: { backgroundColor: 'transparent' },

  addTile: {
    backgroundColor: colors.sand[100],
    borderWidth: 1.5,
    borderColor: '#cdbfab',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addTileLabel: { fontSize: 10, fontFamily: fonts.displaySemiBold, color: colors.sand[500] },

  cameraTeaser: { marginTop: 16, backgroundColor: colors.sand[900], borderRadius: 14, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' },
  cameraIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  cameraTitle: { fontSize: 13, fontFamily: fonts.displaySemiBold, color: colors.sand[50] },
  cameraSub: { fontSize: 11, color: colors.sand[400], marginTop: 1 },

  sticky: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 20, paddingBottom: 30, backgroundColor: colors.sand[50] },
})
