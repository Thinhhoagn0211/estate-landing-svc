import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { clearDraftMedia } from '../lib/listingMedia'

const ListingDraftContext = createContext(null)
const STORAGE_KEY = '@nhanet/listing-draft-v2'

export const INITIAL_DETAILS = {
  dealType: 'sale', propertyType: '', title: '', price: '', priceNegotiable: false, area: '', bedrooms: '', bathrooms: '', address: '',
  direction: '', legalStatus: '', contactPhone: '', description: '', amenities: [],
}

function hasMeaningfulDraft(state) {
  return !!(state.editingListingId || state.photos.length || state.photoUrls.length || state.generated ||
    Object.entries(state.details).some(([key, value]) => key !== 'dealType' && (Array.isArray(value) ? value.length : String(value ?? '').trim())))
}

export function ListingDraftProvider({ children }) {
  const [photos, setPhotos] = useState([])
  const [videos, setVideos] = useState([])
  const [details, setDetails] = useState(INITIAL_DETAILS)
  const [generated, setGenerated] = useState(null)
  const [photoUrls, setPhotoUrls] = useState([])
  const [visualBrief, setVisualBrief] = useState(null)
  const [editingListingId, setEditingListingId] = useState(null)
  const [originalStatus, setOriginalStatus] = useState('draft')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [hydrated, setHydrated] = useState(false)
  const saveTimer = useRef(null)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!raw) return
      const saved = JSON.parse(raw)
      setPhotos(saved.photos ?? [])
      setVideos(saved.videos ?? [])
      setDetails({ ...INITIAL_DETAILS, ...(saved.details ?? {}) })
      setGenerated(saved.generated ?? null)
      setPhotoUrls(saved.photoUrls ?? [])
      setVisualBrief(saved.visualBrief ?? null)
      setEditingListingId(saved.editingListingId ?? null)
      setOriginalStatus(saved.originalStatus ?? 'draft')
      setUpdatedAt(saved.updatedAt ?? null)
    }).catch(() => {}).finally(() => setHydrated(true))
  }, [])

  useEffect(() => {
    if (!hydrated) return
    clearTimeout(saveTimer.current)
    const state = { photos, videos, details, generated, photoUrls, visualBrief, editingListingId, originalStatus }
    saveTimer.current = setTimeout(async () => {
      if (!hasMeaningfulDraft(state)) {
        await AsyncStorage.removeItem(STORAGE_KEY)
        setUpdatedAt(null)
        return
      }
      const savedAt = new Date().toISOString()
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        photos: photos.map(({ base64, ...photo }) => photo),
        updatedAt: savedAt,
      }))
      setUpdatedAt(savedAt)
    }, 450)
    return () => clearTimeout(saveTimer.current)
  }, [photos, videos, details, generated, photoUrls, visualBrief, editingListingId, originalStatus, hydrated])

  const reset = async () => {
    clearTimeout(saveTimer.current)
    setPhotos([]); setVideos([]); setDetails(INITIAL_DETAILS); setGenerated(null); setPhotoUrls([]); setVisualBrief(null)
    setEditingListingId(null); setOriginalStatus('draft'); setUpdatedAt(null)
    await AsyncStorage.removeItem(STORAGE_KEY)
    await clearDraftMedia().catch(() => {})
  }

  const loadFromListing = (listing) => {
    setPhotos([])
    setVideos([])
    setPhotoUrls(Array.isArray(listing.photo_urls) ? listing.photo_urls.filter(Boolean) : [])
    setVisualBrief(listing.visual_brief ?? null)
    setDetails({
      dealType: listing.deal_type || 'sale', propertyType: listing.property_type || '', title: listing.title || '', price: listing.price || '',
      priceNegotiable: !!listing.price_negotiable, area: listing.area || '', bedrooms: listing.bedrooms || '', bathrooms: listing.bathrooms || '', address: listing.address || '',
      direction: listing.direction || '', legalStatus: listing.legal_status || '',
      contactPhone: listing.contact_phone || '', description: listing.description || '',
      amenities: Array.isArray(listing.amenities) ? listing.amenities : [],
    })
    setGenerated(listing.caption_primary ? {
      captionPrimary: listing.caption_primary || '', hashtags: listing.hashtags || '',
      captionFriendly: listing.caption_friendly || '', videoScript: null,
    } : null)
    setEditingListingId(listing.id)
    setOriginalStatus(listing.status || 'draft')
    setUpdatedAt(new Date().toISOString())
  }

  const state = { photos, videos, details, generated, photoUrls, visualBrief, editingListingId, originalStatus }
  const value = useMemo(() => ({
    ...state, setPhotos, setVideos, setDetails, setGenerated, setPhotoUrls, setVisualBrief,
    setEditingListingId, setOriginalStatus, reset, loadFromListing, hydrated, updatedAt,
    hasDraft: hasMeaningfulDraft(state),
  }), [photos, videos, details, generated, photoUrls, visualBrief, editingListingId, originalStatus, hydrated, updatedAt])

  return <ListingDraftContext.Provider value={value}>{children}</ListingDraftContext.Provider>
}

export function useListingDraft() {
  return useContext(ListingDraftContext)
}
