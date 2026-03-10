// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE — cliente móvil (anon key únicamente)
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const supabaseUrl  = Constants.expoConfig?.extra?.supabaseUrl  as string;
const supabaseAnon = Constants.expoConfig?.extra?.supabaseAnon as string;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Missing Supabase env vars in app.config.ts → extra');
}

const isWeb = Platform.OS === 'web';

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    storage: isWeb ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: isWeb,
  },
});
