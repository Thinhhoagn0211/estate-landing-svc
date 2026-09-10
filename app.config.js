const { expo } = require('./app.json')
const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '4398976803667476'
const facebookClientToken = process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN || '9d961f863c64ad3b2e68915c8f7e5bd4'
module.exports = {
  expo: {
    ...expo,
    android: {
      ...expo.android,
      // TODO: confirm/replace before your first Play Store submission —
      // the package name is effectively permanent once published.
      package: expo.android?.package ?? 'com.nhanet.appsellmobile',
    },
    ios: {
      ...expo.ios,
      bundleIdentifier: expo.ios?.bundleIdentifier ?? 'com.nhanet.appsellmobile',
    },
    plugins: [
      ...expo.plugins,
      'expo-dev-client',
      'expo-video',
      [
        'expo-build-properties',
        {
          android: {
            manifestQueries: {
              package: ['com.facebook.orca'],
            },
          },
        },
      ],
      [
        'react-native-fbsdk-next',
        {
          appID: facebookAppId,
          clientToken: facebookClientToken,
          displayName: 'Upload Post',
          scheme: `fb${facebookAppId}`,
          isAutoInitEnabled: true,
          autoLogAppEventsEnabled: false,
          advertiserIDCollectionEnabled: false,
        },
      ],
    ],
  },
}
