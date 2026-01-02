import { PrimaryButton } from '@/components/ui/primary-button';
import { useSnackbar } from '@/components/ui/snackbar';
import { auth } from '@/firebaseConfig';
import { getUserProfile, updateUserProfile } from '@/services/user-service';
import {
  generateVerificationCode,
  sendVerificationCode,
  storeVerificationCode,
  verifyCode,
} from '@/services/whatsapp-service';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WhatsAppNotVerifiedScreen() {
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const { show } = useSnackbar();

  const code = digits.join('');

  const handleDigitChange = (text: string, index: number) => {
    // Handle paste of full code
    if (text.length > 1) {
      const pastedCode = text.replace(/[^0-9]/g, '').slice(0, 6);
      if (pastedCode.length === 6) {
        setDigits(pastedCode.split(''));
        inputRefs.current[5]?.focus();
        return;
      }
    }

    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (countdown > 0) return;
    
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setSending(true);
    try {
      const userProfile = await getUserProfile(userId);
      if (!userProfile?.phoneNumber) {
        show('Número de WhatsApp não cadastrado.', { backgroundColor: '#ba1a1a' });
        return;
      }

      const code = generateVerificationCode();
      storeVerificationCode(userProfile.phoneNumber, code);
      await sendVerificationCode(userProfile.phoneNumber, code);
      
      show('Código enviado para seu WhatsApp!', { backgroundColor: '#22c55e' });
      setCountdown(60);
    } catch {
      show('Erro ao enviar código.', { backgroundColor: '#ba1a1a' });
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setVerifying(true);
    try {
      const userProfile = await getUserProfile(userId);
      if (!userProfile?.phoneNumber) {
        show('Número de WhatsApp não cadastrado.', { backgroundColor: '#ba1a1a' });
        return;
      }

      const isValid = verifyCode(userProfile.phoneNumber, code);
      if (!isValid) {
        show('Código inválido ou expirado.', { backgroundColor: '#ba1a1a' });
        return;
      }

      await updateUserProfile(userId, { phoneNumberVerified: true });
      router.replace('/(tabs)');
    } catch {
      show('Erro ao verificar código.', { backgroundColor: '#ba1a1a' });
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
          <View style={[styles.stepDot, styles.stepCompleted]}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
          <View style={[styles.stepLine, styles.stepLineCompleted]} />
          <View style={[styles.stepDot, styles.stepActive]}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
        </View>
        <Text style={styles.stepText}>Passo 2 de 2</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="logo-whatsapp" size={80} color="#25D366" />
        </View>

        <Text style={styles.title}>Verifique seu WhatsApp</Text>
        <Text style={styles.subtitle}>
          Enviaremos um código de verificação para o número de WhatsApp cadastrado.
        </Text>

        <View style={styles.codeContainer}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={styles.codeInput}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              value={digit}
              onChangeText={(text) => handleDigitChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        <PrimaryButton
          title="Verificar código"
          onPress={handleVerify}
          loading={verifying}
          disabled={code.length < 6}
          style={{ marginTop: 0, marginBottom: 16, width: '100%' }}
        />

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={handleSendCode}
          disabled={sending || countdown > 0}
        >
          <Text style={[styles.resendText, countdown > 0 && styles.textDisabled]}>
            {countdown > 0 ? `Reenviar código em ${countdown}s` : 'Reenviar código'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => router.push('/(tabs)/email-not-verified')}
        >
          <Text style={styles.backText}>Voltar para o passo 1</Text>
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
  stepCompleted: {
    backgroundColor: '#22c55e',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: '#22c55e',
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
    marginBottom: 24,
    lineHeight: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  codeInput: {
    width: 48,
    height: 56,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  linkContainer: {
    marginTop: 24,
  },
  linkText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
  },
  backText: {
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

