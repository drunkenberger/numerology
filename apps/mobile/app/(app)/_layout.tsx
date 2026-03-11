// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT — (app) group
// Guard de autenticación. Si no hay sesión → redirige a login.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { supabase } from '../../src/services/supabase';
import { useStore } from '../../src/stores/app.store';

// DEV: skip auth guard in development
const DEV_SKIP_AUTH = __DEV__;

export default function AppLayout() {
  const setSession = useStore(s => s.setSession);
  const setProfile = useStore(s => s.setProfile);
  const session    = useStore(s => s.session);

  useEffect(() => {
    if (DEV_SKIP_AUTH) {
      // Inyectar perfil de desarrollo sin autenticar
      setSession({ user: { id: 'dev' } } as any);
      setProfile({
        id:              '10f054f2-4846-4acd-aacf-bb781c0c0374',
        firstName:       'Santiago',
        paternalSurname: 'González',
        maternalSurname: 'Martínez',
        birthDay:        15,
        birthMonth:      6,
        birthYear:       1990,
        language:        'es',
        isPremium:       true,
        readingCredits:  99,
      });
      return;
    }

    // Leer sesión inicial
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (!s) router.replace('/(auth)/login');
    });

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      if (!s) {
        router.replace('/(auth)/login');
        return;
      }

      // Cargar perfil cuando hay sesión
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', s.user.id)
        .single();

      if (profile) {
        setProfile({
          id:              profile.id,
          firstName:       profile.first_name,
          paternalSurname: profile.paternal_surname,
          maternalSurname: profile.maternal_surname,
          birthDay:        profile.birth_day,
          birthMonth:      profile.birth_month,
          birthYear:       profile.birth_year,
          language:        profile.language,
          isPremium:       profile.is_premium,
          readingCredits:  profile.reading_credits ?? 0,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!DEV_SKIP_AUTH && !session) return null; // esperando hidratación

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'fade_from_bottom',
      }}
    />
  );
}
