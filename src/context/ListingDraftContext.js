import { createContext, useContext, useMemo, useState } from 'react'

const ListingDraftContext = createContext(null)

const INITIAL_DETAILS = {
  dealType: 'sale',
  title: '',
  price: '',
  area: '',
  bedrooms: '',
  address: '',
  direction: '',
  legalStatus: '',
  contactPhone: '',
  description: '',
  amenities: [],
}

export function ListingDraftProvider({ children }) {
  const [photos, setPhotos] = useState([]) // [{ uri, base64, mimeType }]
  const [videos, setVideos] = useState([]) // [{ uri, mimeType }]
  const [details, setDetails] = useState(INITIAL_DETAILS)
  const [generated, setGenerated] = useState(null)
  const [photoUrls, setPhotoUrls] = useState([])

  const value = useMemo(
    () => ({
      photos,
      setPhotos,
      videos,
      setVideos,
      details,
      setDetails,
      generated,
      setGenerated,
      photoUrls,
      setPhotoUrls,
      reset: () => {
        setPhotos([])
        setVideos([])
        setDetails(INITIAL_DETAILS)
        setGenerated(null)
        setPhotoUrls([])
      },
    }),
    [photos, videos, details, generated, photoUrls]
  )

  return <ListingDraftContext.Provider value={value}>{children}</ListingDraftContext.Provider>
}

export function useListingDraft() {
  return useContext(ListingDraftContext)
}
