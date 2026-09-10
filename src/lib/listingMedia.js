import * as FileSystem from 'expo-file-system/legacy'

const DRAFT_MEDIA_DIR = `${FileSystem.documentDirectory}listing-draft-media/`

async function ensureDirectory() {
  const info = await FileSystem.getInfoAsync(DRAFT_MEDIA_DIR)
  if (!info.exists) await FileSystem.makeDirectoryAsync(DRAFT_MEDIA_DIR, { intermediates: true })
}

function extensionFor(asset) {
  const mimeExtension = asset.mimeType?.split('/')[1]?.replace('jpeg', 'jpg')
  if (mimeExtension) return mimeExtension
  return asset.uri?.split('.').pop()?.split('?')[0] || 'jpg'
}

export async function persistDraftAssets(assets) {
  await ensureDirectory()
  return Promise.all(assets.map(async (asset, index) => {
    const destination = `${DRAFT_MEDIA_DIR}${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${extensionFor(asset)}`
    await FileSystem.copyAsync({ from: asset.uri, to: destination })
    return { ...asset, uri: destination }
  }))
}

export async function photoAsBase64(photo) {
  if (photo.base64) return photo.base64
  if (!photo.uri || photo.uri.startsWith('http')) return null
  return FileSystem.readAsStringAsync(photo.uri, { encoding: FileSystem.EncodingType.Base64 })
}

export async function clearDraftMedia() {
  const info = await FileSystem.getInfoAsync(DRAFT_MEDIA_DIR)
  if (info.exists) await FileSystem.deleteAsync(DRAFT_MEDIA_DIR, { idempotent: true })
}
