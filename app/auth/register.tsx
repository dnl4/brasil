import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomDialog } from '../../components/ui/custom-dialog';
import { InputField } from '../../components/ui/input-field';
import { PrimaryButton } from '../../components/ui/primary-button';
import { useSnackbar } from '../../components/ui/snackbar';
import { WhatsappInput } from '../../components/ui/whatsapp-input';
import { auth } from '../../firebaseConfig';
import { isDisplayNameAvailable, isPhoneNumberAvailable, updateUserProfile, validateDisplayNameFormat } from '../../services/user-service';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { show } = useSnackbar();
  
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollViewY = useRef(0);
  const insets = useSafeAreaInsets();

  const handleInputFocus = (inputY: number) => {
    if (Platform.OS === 'ios') {
      // Calcula a posição considerando o safe area e o header
      const headerHeight = 64; // altura aproximada do header
      const offset = inputY - insets.top - headerHeight;
      
      if (offset > 0) {
        scrollViewRef.current?.scrollTo({
          y: scrollViewY.current + offset,
          animated: true,
        });
      }
    }
  };

  const handleScroll = (event: any) => {
    scrollViewY.current = event.nativeEvent.contentOffset.y;
  };

  const handleRegister = async () => {
    // Validações
    const displayNameValidation = validateDisplayNameFormat(displayName);
    if (!displayNameValidation.valid) {
      show(displayNameValidation.error!, { backgroundColor: '#ba1a1a' });
      return;
    }
    if (!fullName.trim()) {
      show('Por favor, insira seu nome completo.', { backgroundColor: '#ba1a1a' });
      return;
    }
    if (!email.trim()) {
      show('Por favor, insira seu email.', { backgroundColor: '#ba1a1a' });
      return;
    }
    if (!password) {
      show('Por favor, insira uma senha.', { backgroundColor: '#ba1a1a' });
      return;
    }
    if (password.length < 6) {
      show('A senha deve ter pelo menos 6 caracteres.', { backgroundColor: '#ba1a1a' });
      return;
    }
    if (password !== confirmPassword) {
      show('As senhas não coincidem.', { backgroundColor: '#ba1a1a' });
      return;
    }

    setLoading(true);
    try {
      // Verifica se o displayName está disponível
      const isAvailable = await isDisplayNameAvailable(displayName);
      if (!isAvailable) {
        show('Este nome de exibição já está em uso', { backgroundColor: '#ba1a1a' });
        setLoading(false);
        return;
      }

      // Verifica se o WhatsApp está disponível
      if (phone.trim()) {
        const isPhoneAvailable = await isPhoneNumberAvailable(phone.trim());
        if (!isPhoneAvailable) {
          show('Este WhatsApp já está em uso', { backgroundColor: '#ba1a1a' });
          setLoading(false);
          // return;
        }
      }

      // Criar usuário no Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      const normalizedDisplayName = displayName.trim().toLowerCase();
      
      // Atualizar o perfil com o nome de exibição
      await updateProfile(userCredential.user, {
        displayName: normalizedDisplayName,
      });

      // Salvar perfil completo no Firestore
      await updateUserProfile(userCredential.user.uid, {
        displayName: normalizedDisplayName,
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
      });

      // Registro bem-sucedido, mostrar dialog de sucesso
      setShowSuccessDialog(true);
    } catch (error: any) {
      let errorMessage = 'Ocorreu um erro ao criar sua conta.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está em uso.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.';
          break;
        case 'auth/weak-password':
          errorMessage = 'A senha é muito fraca.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Operação não permitida.';
          break;
      }
      
      show(errorMessage, { backgroundColor: '#ba1a1a' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Criar conta</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Display Name Field */}
            <InputField
              testID="displayname-input"
              label="Nome de exibição"
              value={displayName}
              onChangeText={(text) => setDisplayName(text.toLowerCase().replace(/[^a-z0-9]/g, ''))}
              placeholder="usuario123"
              autoCapitalize="none"
              autoCorrect={false}
              onFocusWithPosition={handleInputFocus}
              helperText="Apenas letras e números, sem espaços (3-20 caracteres)"
              maxLength={20}
            />

            {/* Full Name Field */}
            <InputField
              testID="fullname-input"
              label="Nome completo"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Seu nome completo"
              autoCapitalize="words"
              autoCorrect={false}
              onFocusWithPosition={handleInputFocus}
              helperText="Privado, não será exibido publicamente"
            />

            {/* Email Field */}
            <InputField
              testID="email-input"
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocusWithPosition={handleInputFocus}
            />

            {/* WhatsApp Field */}
            <WhatsappInput
              testID="whatsapp-input"
              label="WhatsApp"
              value={phone}
              onChangeValue={setPhone}
              placeholder="Digite seu WhatsApp"
              isDark={false}
            />

            {/* Password Field */}
            <InputField
              testID="password-input"
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              onFocusWithPosition={handleInputFocus}
            />

            {/* Confirm Password Field */}
            <InputField
              testID="confirm-password-input"
              label="Confirmação de senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              onFocusWithPosition={handleInputFocus}
            />

            {/* Register Button */}
            <PrimaryButton
              testID="register-button"
              title="Criar conta"
              onPress={handleRegister}
              loading={loading}
            />
          </View>
        </ScrollView>

        {/* Success Dialog */}
        <CustomDialog
          visible={showSuccessDialog}
          title="Conta criada com sucesso!"
          message="Sua conta foi criada. Você já pode começar a usar o app."
          buttons={[
            {
              text: 'Continuar',
              onPress: () => {
                setShowSuccessDialog(false);
                router.replace('/(tabs)');
              },
            },
          ]}
          onClose={() => setShowSuccessDialog(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSpacer: {
    width: 40,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
});
