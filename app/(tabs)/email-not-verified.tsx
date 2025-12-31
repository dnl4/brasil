import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSnackbar } from '@/components/ui/snackbar';
import { auth } from '@/firebaseConfig';

export default function EmailNotVerifiedScreen() {
  const [loading, setLoading] = useState(false);
  const { show } = useSnackbar();

  const handleResendEmail = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      show('Email de verificação enviado!', { backgroundColor: '#22c55e' });
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        show('Aguarde um momento antes de tentar novamente.', { backgroundColor: '#ba1a1a' });
      } else {
        show('Erro ao enviar email.', { backgroundColor: '#ba1a1a' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        router.replace('/(tabs)');
      } else {
        show('Email ainda não verificado.', { backgroundColor: '#f59e0b' });
      }
    } catch {
      show('Erro ao verificar status.', { backgroundColor: '#ba1a1a' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={80} color="#0066FF" />
        </View>

        <Text style={styles.title}>Verifique seu e-mail</Text>
        <Text style={styles.subtitle}>
          Enviamos um link de verificação para o seu e-mail. Clique no link para ativar sua conta.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRefresh}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? 'Verificando...' : 'Já verifiquei'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleResendEmail}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Reenviar e-mail</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={handleLogout}
        >
          <Text style={styles.linkText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  linkContainer: {
    marginTop: 24,
  },
  linkText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
});

