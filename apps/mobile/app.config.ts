import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Jyotish Numerología',
  slug: 'jyotish-numerology',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#080812',

  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#080812',
  },

  ios: {
    supportsTablet: false,
    bundleIdentifier: 'app.jyotish.numerology',
    buildNumber: '1',
    infoPlist: {
      // Deep link para magic link de Supabase
      CFBundleURLTypes: [
        { CFBundleURLSchemes: ['jyotish'] },
      ],
    },
  },

  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#080812',
    },
    package: 'app.jyotish.numerology',
    versionCode: 1,
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'jyotish' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },

  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },

  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-splash-screen',
      {
        image: './assets/splash.png',
        backgroundColor: '#080812',
        imageWidth: 200,
      },
    ],
  ],

  scheme: 'jyotish',

  experiments: {
    typedRoutes: true,
  },

  extra: {
    supabaseUrl:  process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnon: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    apiUrl:       process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3003',
    revenueCatIos:     process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
    revenueCatAndroid: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    eas: {
      projectId: 'YOUR_EAS_PROJECT_ID', // reemplazar al crear el proyecto en EAS
    },
  },
});
