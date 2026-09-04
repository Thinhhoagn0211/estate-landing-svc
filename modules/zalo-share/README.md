# zalo-share (local Expo module)

Wraps the official Zalo Android SDK (`me.zalo:sdk-core`/`sdk-auth`/`sdk-openapi`,
verified against Maven Central version `4.2.0724`) to post to a user's personal
Zalo Nhật ký via `OpenAPIService.shareFeed()` — an app-to-app hand-off to the
installed Zalo app. This is NOT the deprecated `/me/feed` server API (confirmed
dead — Zalo returns error 11004 for it as of 2026).

Android only. iOS/web are not implemented.

## Setup required before building

1. **Zalo Developer Console** (developers.zalo.me) → your app → Android platform:
   - Package name: must match `expo.android.package` in `app.config.js`
     (currently `com.nhanet.appsellmobile` — placeholder, confirm before
     publishing to Play Store since it's effectively permanent once live)
   - SHA-1 key hash (Base64-encoded, per the `getApplicationHashKey` snippet
     Zalo provides) — use your **debug** keystore hash while developing, and
     your **release** keystore hash before publishing
2. `EXPO_PUBLIC_ZALO_APP_ID` in `.env` must be your numeric Zalo App ID — the
   `zalo-share/app.plugin.js` config plugin reads it at prebuild time to set
   the `appID` string resource, the `com.zing.zalo.zalosdk.appID` meta-data,
   and the `zalo-<appId>` intent-filter scheme on `BrowserLoginActivity`.

## Building

This module requires a dev-client/standalone build — it does **not** work in
Expo Go (custom native code isn't compiled into Expo Go).

```bash
npx expo prebuild --platform android   # regenerates ./android from app.config.js
npx expo run:android                   # or: cd android && ./gradlew :app:assembleDebug
```

Re-run `expo prebuild` after changing `EXPO_PUBLIC_ZALO_APP_ID` or the plugin
itself — native project files aren't hot-reloaded.

## Usage

```ts
import { shareZaloFeed } from '../../modules/zalo-share/src'

await shareZaloFeed({
  message: 'Bán căn hộ 2PN Quận 7, 65m², 2.8 tỷ',
  link: 'https://example.com/listing/123',
  linkTitle: 'Căn hộ 2PN Quận 7',
})
```

Rejects with a `ZALO_SHARE_ERROR` if the user cancels the share, or if the
Zalo app isn't installed. `src/screens/Publish.js` already falls back to the
OS share sheet (`Share.share`) when this call fails or on non-Android
platforms — see `shareToZaloFeed()` there.

## Verified (not guessed)

The Maven coordinates and `OpenAPIService.shareFeed(context, FeedData, ZaloPluginCallback)`
signature used here were confirmed by downloading the real AAR from Maven
Central (`me.zalo:sdk-openapi:4.2.0724`) and decompiling its public API with
`javap`, rather than trusting Zalo's older (2019, Bintray-published, dead
since 2021) `VNG-Zalo/zalosdk-kotlin` GitHub sample. `./gradlew
:zalo-share:dependencies` and `:zalo-share:compileDebugKotlin` both pass.
