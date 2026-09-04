import LocalShareModule from './LocalShareModule'

export function shareImagesToZalo(fileUris: string[], text?: string) {
  return LocalShareModule.shareImagesToZalo(fileUris, text)
}

export function deleteSharedImages(uriStrings: string[]) {
  return LocalShareModule.deleteSharedImages(uriStrings)
}
