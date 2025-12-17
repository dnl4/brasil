import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SnackbarProvider } from '../components/ui/snackbar';
import { AuthProvider, useAuth } from '../contexts/auth-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { user, isLoading, holdRedirect } = useAuth();
  const segments = useSegments();

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#006e1c" />
      </View>
    );
  }

  // Verifica se o usuário está em uma rota protegida (tabs)
  const inTabsGroup = segments[0] === '(tabs)';

  // Se não está autenticado e está tentando acessar tabs, redireciona para welcome
  if (!user && inTabsGroup) {
    return <Redirect href="/auth/welcome" />;
  }

  // Se está autenticado e está em uma rota de auth, redireciona para tabs
  // Mas só se não estiver com holdRedirect ativo (para permitir mostrar dialog)
  if (user && segments[0] === 'auth' && !holdRedirect) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen
          name="rating/[id]"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <SnackbarProvider>
      <AuthProvider>
        <ThemeProvider value={DefaultTheme}>
          <RootLayoutNav />
        </ThemeProvider>
      </AuthProvider>
    </SnackbarProvider>
  );
}
