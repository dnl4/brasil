import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SnackbarProvider } from '../components/ui/snackbar';
import { AuthProvider, useAuth } from '../contexts/auth-context';

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#006e1c" />
      </View>
    );
  }

  return (
    <>
      <Stack>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="rating/[id]"
            options={{
              headerShown: true,
              title: 'Nova avaliação',
              presentation: 'modal',
            }}
          />
        </Stack.Protected>
        <Stack.Protected guard={!user}>
          <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SnackbarProvider>
        <AuthProvider>
          <ThemeProvider value={DefaultTheme}>
            <RootLayoutNav />
          </ThemeProvider>
        </AuthProvider>
      </SnackbarProvider>
    </SafeAreaProvider>
  );
}
