import { NativeModule, requireNativeModule } from 'expo';

declare class ZaloShareModule extends NativeModule<{}> {
  shareImage(imageUrl: string, message?: string): Promise<{ success: true }>;
  shareFeed(
    msg: string,
    link?: string,
    linkTitle?: string,
    linkDesc?: string,
    linkThumb?: string
  ): Promise<{ success: true }>;
}

export default requireNativeModule<ZaloShareModule>('ZaloShare');
