import { decode } from 'base64-arraybuffer'
import { supabase } from './supabase'

export async function uploadListingPhotos(userId, photos) {
  const folder = `${userId}/${Date.now()}`
  const uploads = await Promise.all(
    photos.map(async (photo, i) => {
      if (!photo.base64) return null
      const ext = photo.mimeType?.split('/')[1] ?? 'jpg'
      const path = `${folder}/${i}.${ext}`
      const { error } = await supabase.storage.from('listing-photos').upload(path, decode(photo.base64), {
        contentType: photo.mimeType ?? 'image/jpeg',
      })
      if (error) {
        throw new Error(`Không tải được ảnh ${i + 1}: ${error.message}`)
      }
      return supabase.storage.from('listing-photos').getPublicUrl(path).data.publicUrl
    })
  )
  const urls = uploads.filter(Boolean)
  if (photos.length && urls.length !== photos.length) {
    throw new Error('Một hoặc nhiều ảnh chưa được tải lên. Vui lòng thử lại.')
  }
  return urls
}
