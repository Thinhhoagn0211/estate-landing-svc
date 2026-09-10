import { decode } from 'base64-arraybuffer'
import * as ImageManipulator from 'expo-image-manipulator'
import { supabase } from './supabase'
import { photoAsBase64 } from './listingMedia'

export async function uploadListingPhotos(userId, photos) {
  const folder = `${userId}/${Date.now()}`
  const uploads = await Promise.all(
    photos.map(async (photo, i) => {
      const optimized = await ImageManipulator.manipulateAsync(photo.uri, [{ resize: { width: 1920 } }], { compress: 0.78, format: ImageManipulator.SaveFormat.JPEG, base64: true })
      const base64 = optimized.base64 || await photoAsBase64({ ...photo, uri: optimized.uri })
      if (!base64) return null
      const path = `${folder}/${i}.jpg`
      const { error } = await supabase.storage.from('listing-photos').upload(path, decode(base64), {
        contentType: 'image/jpeg',
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
