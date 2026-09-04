const { withAndroidManifest, withStringsXml, withMainApplication, withDangerousMod, AndroidConfig } = require('@expo/config-plugins')
const fs = require('fs')
const path = require('path')

const PROGUARD_RULES = `
# Zalo Android SDK (developers.zalo.me)
-keep class com.zing.zalo.**{ *; }
-keep enum com.zing.zalo.**{ *; }
-keep interface com.zing.zalo.**{ *; }
`

const ZALO_SDK_APPLICATION = 'com.zing.zalo.zalosdk.oauth.ZaloSDKApplication'
const BROWSER_LOGIN_ACTIVITY = 'com.zing.zalo.zalosdk.oauth.BrowserLoginActivity'

// Config plugin for the local `zalo-share` Expo module — wires up everything
// developers.zalo.me's Android integration guide asks for (steps 3-6): the
// appID meta-data + string resource, ZaloSDKApplication.wrap() in the
// Application's onCreate, the BrowserLoginActivity intent-filter (using the
// zalo-<appId> scheme Zalo expects), and Android 11+ package visibility so
// the SDK can find the installed Zalo app.
function withZaloShare(config, { appId } = {}) {
  if (!appId) {
    throw new Error('withZaloShare: an `appId` (your Zalo App ID) is required, e.g. ["./modules/zalo-share", { "appId": "1234567890" }]')
  }

  config = withStringsXml(config, (config) => {
    config.modResults = AndroidConfig.Strings.setStringItem(
      [{ $: { name: 'appID', translatable: 'false' }, _: appId }],
      config.modResults
    )
    return config
  })

  config = withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults)

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      'com.zing.zalo.zalosdk.appID',
      '@string/appID',
      'resource'
    )

    mainApplication.activity = mainApplication.activity || []
    const hasLoginActivity = mainApplication.activity.some((a) => a.$['android:name'] === BROWSER_LOGIN_ACTIVITY)
    if (!hasLoginActivity) {
      mainApplication.activity.push({
        $: {
          'android:name': BROWSER_LOGIN_ACTIVITY,
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            category: [
              { $: { 'android:name': 'android.intent.category.DEFAULT' } },
              { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
            ],
            data: [{ $: { 'android:scheme': `zalo-${appId}` } }],
          },
        ],
      })
    }

    const manifest = config.modResults.manifest
    manifest.queries = manifest.queries || []
    const hasZaloQuery = manifest.queries.some((q) => (q.package || []).some((p) => p.$['android:name'] === 'com.zing.zalo'))
    if (!hasZaloQuery) {
      manifest.queries.push({ package: [{ $: { 'android:name': 'com.zing.zalo' } }] })
    }

    mainApplication.provider = mainApplication.provider || []
    const providerAuthority = '${applicationId}.zalo-share.fileprovider'
    const hasFileProvider = mainApplication.provider.some((p) => p.$['android:authorities'] === providerAuthority)
    if (!hasFileProvider) {
      mainApplication.provider.push({
        $: {
          'android:name': 'androidx.core.content.FileProvider',
          'android:authorities': providerAuthority,
          'android:exported': 'false',
          'android:grantUriPermissions': 'true',
        },
        'meta-data': [{
          $: {
            'android:name': 'android.support.FILE_PROVIDER_PATHS',
            'android:resource': '@xml/zalo_share_paths',
          },
        }],
      })
    }

    return config
  })

  config = withMainApplication(config, (config) => {
    if (config.modResults.contents.includes(ZALO_SDK_APPLICATION)) {
      return config
    }
    const isKotlin = config.modResults.language === 'kt'
    const superCall = isKotlin ? 'super.onCreate()' : 'super.onCreate();'
    const wrapCall = isKotlin ? `${ZALO_SDK_APPLICATION}.wrap(this)` : `${ZALO_SDK_APPLICATION}.wrap(this);`
    config.modResults.contents = config.modResults.contents.replace(superCall, `${superCall}\n    ${wrapCall}`)
    return config
  })

  config = withDangerousMod(config, [
    'android',
    (config) => {
      const proguardPath = path.join(config.modRequest.platformProjectRoot, 'app', 'proguard-rules.pro')
      const existing = fs.existsSync(proguardPath) ? fs.readFileSync(proguardPath, 'utf-8') : ''
      if (!existing.includes('com.zing.zalo.**')) {
        fs.writeFileSync(proguardPath, existing + PROGUARD_RULES)
      }
      const xmlDir = path.join(config.modRequest.platformProjectRoot, 'app', 'src', 'main', 'res', 'xml')
      fs.mkdirSync(xmlDir, { recursive: true })
      fs.writeFileSync(
        path.join(xmlDir, 'zalo_share_paths.xml'),
        '<?xml version="1.0" encoding="utf-8"?><paths xmlns:android="http://schemas.android.com/apk/res/android"><cache-path name="zalo_share_cache" path="zalo-share/" /></paths>'
      )
      return config
    },
  ])

  return config
}

module.exports = withZaloShare
