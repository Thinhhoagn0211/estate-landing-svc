import { NativeModule, requireNativeModule } from 'expo-modules-core'

export type LocalShareEvents = {
  shareImagesToZalo(fileUris: string[], text?: string): Promise<{ success: true; count: number; cleanupUris: string[] }>
  deleteSharedImages(uriStrings: string[]): Promise<void>
}

class LocalShareModule extends NativeModule<LocalShareEvents> {}

export default requireNativeModule<LocalShareModule>('LocalShare')
