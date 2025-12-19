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
import { auth } from '../../firebaseConfig';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('Danilo Souza');
  const [email, setEmail] = useState('danilofsouza@gmail.com');
  const [phone, setPhone] = useState('+55 11 99999-9999');
  const [password, setPassword] = useState('lllqwe123');
  const [confirmPassword, setConfirmPassword] = useState('lllqwe123');
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
      // Criar usuário no Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // Atualizar o perfil com o nome
      await updateProfile(userCredential.user, {
        displayName: fullName.trim(),
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
            {/* Full Name Field */}
            <InputField
              label="Nome completo"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Seu nome"
              autoCapitalize="words"
              autoCorrect={false}
              onFocusWithPosition={handleInputFocus}
            />

            {/* Email Field */}
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocusWithPosition={handleInputFocus}
            />

            {/* Phone Field */}
            <InputField
              label="Telefone"
              value={phone}
              onChangeText={setPhone}
              placeholder="+55 11 99999-9999"
              keyboardType="phone-pad"
              onFocusWithPosition={handleInputFocus}
            />

            {/* Password Field */}
            <InputField
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              onFocusWithPosition={handleInputFocus}
            />

            {/* Confirm Password Field */}
            <InputField
              label="Confirmação de senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
              onFocusWithPosition={handleInputFocus}
            />

            {/* Register Button */}
            <PrimaryButton
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
