import { Redirect } from 'expo-router';

const DEV_SKIP_AUTH = __DEV__;

export default function Index() {
  // En dev, ir directo a la app sin login
  if (DEV_SKIP_AUTH) return <Redirect href="/(app)" />;
  return <Redirect href="/(auth)/login" />;
}
