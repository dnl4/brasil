import { PrimaryButton } from '@/components/ui/primary-button';
import { useSnackbar } from '@/components/ui/snackbar';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EmailNotVerifiedScreen() {
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { show } = useSnackbar();
  const { refreshUser } = useAuth();

  const loadCountdown = useCallback(async () => {
    const sentAt = await AsyncStorage.getItem('emailVerificationSentAt');
    if (sentAt) {
      const elapsed = Math.floor((Date.now() - parseInt(sentAt)) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      setCountdown(remaining);
    }
  }, []);

  useEffect(() => {
    loadCountdown();
  }, [loadCountdown]);

  useFocusEffect(
    useCallback(() => {
      loadCountdown();
    }, [loadCountdown])
  );

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!auth.currentUser || countdown > 0) return;
    
    setSending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      await AsyncStorage.setItem('emailVerificationSentAt', Date.now().toString());
      show('Email de verificação enviado!', { backgroundColor: '#22c55e' });
      setCountdown(60);
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        show('Aguarde um momento antes de tentar novamente.', { backgroundColor: '#ba1a1a' });
      } else {
        show('Erro ao enviar email.', { backgroundColor: '#ba1a1a' });
      }
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    if (!auth.currentUser) {
      return;
    }
    
    setVerifying(true);
    try {
      await refreshUser();
      
      if (auth.currentUser.emailVerified) {
        // O layout vai redirecionar automaticamente
      } else {
        show('Email ainda não verificado.', { backgroundColor: '#f59e0b' });
      }
    } catch (error) {
      show('Erro ao verificar status.', { backgroundColor: '#ba1a1a' });
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stepsContainer}>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepActive]}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.stepDot}>
            <Text style={styles.stepNumberInactive}>2</Text>
          </View>
        </View>
        <Text style={styles.stepText}>Passo 1 de 2</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={80} color="#0066FF" />
        </View>

        <Text style={styles.title}>Verifique seu e-mail</Text>
        <Text style={styles.subtitle}>
          Enviamos um link de verificação para o seu e-mail. Clique no link para ativar sua conta.
        </Text>

        <PrimaryButton
          title="Já verifiquei"
          onPress={handleRefresh}
          loading={verifying}
          style={{ marginTop: 0, marginBottom: 16, width: '100%' }}
        />

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={handleResendEmail}
          disabled={sending || countdown > 0}
        >
          <Text style={[styles.resendText, countdown > 0 && styles.textDisabled]}>
            {countdown > 0 ? `Reenviar e-mail em ${countdown}s` : 'Reenviar e-mail'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.push('/(tabs)/whatsapp-not-verified')}
        >
          <Text style={styles.skipText}>Ir para o passo 2</Text>
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
  stepsContainer: {
    paddingTop: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    backgroundColor: '#0066FF',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  stepNumberInactive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  stepText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
  linkContainer: {
    marginTop: 24,
  },
  linkText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  skipText: {
    fontSize: 16,
    color: '#0066FF',
    fontWeight: '500',
  },
  resendText: {
    fontSize: 16,
    color: '#0066FF',
    fontWeight: '500',
  },
  textDisabled: {
    color: '#9CA3AF',
  },
});


