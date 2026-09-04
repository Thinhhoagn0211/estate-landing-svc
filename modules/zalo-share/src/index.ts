import ZaloShareModule from './ZaloShareModule';

export type ZaloShareFeedOptions = {
  message: string
  link?: string
  linkTitle?: string
  linkDesc?: string
  linkThumb?: string
}

export async function shareZaloImage(imageUrl: string, message?: string): Promise<{ success: true }> {
  return ZaloShareModule.shareImage(imageUrl, message)
}

// Posts to the current Zalo app user's Nhật ký via Zalo's official Android
// Share SDK (app-to-app hand-off) — NOT the deprecated /me/feed server API.
// Requires the Zalo app to be installed; rejects with ZALO_SHARE_ERROR if the
// user cancels or Zalo isn't installed.
export async function shareZaloFeed(options: ZaloShareFeedOptions): Promise<{ success: true }> {
  return ZaloShareModule.shareFeed(
    options.message,
    options.link,
    options.linkTitle,
    options.linkDesc,
    options.linkThumb
  )
}
