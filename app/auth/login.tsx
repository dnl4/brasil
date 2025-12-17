import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CustomDialog } from '../../components/ui/custom-dialog';
import { InputField } from '../../components/ui/input-field';
import { PrimaryButton } from '../../components/ui/primary-button';
import { useSnackbar } from '../../components/ui/snackbar';
import { useAuth } from '../../contexts/auth-context';
import { auth } from '../../firebaseConfig';

export default function LoginScreen() {
  const [email, setEmail] = useState('danilofsouza@gmail.com');
  const [password, setPassword] = useState('lllqwe123');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const { setHoldRedirect } = useAuth();
  const { show } = useSnackbar();

  const handleLogin = async () => {
    // Validações
    if (!email.trim()) {
      show('Por favor, insira seu email.', { backgroundColor: '#ba1a1a' });
      return;
    }
    if (!password) {
      show('Por favor, insira sua senha.', { backgroundColor: '#ba1a1a' });
      return;
    }

    setIsLoading(true);
    
    // Bloqueia o redirect antes de fazer login
    setHoldRedirect(true);
    
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setShowSuccessDialog(true);
    } catch (error: any) {
      // Libera o redirect em caso de erro
      setHoldRedirect(false);
      
      let message = 'Ocorreu um erro ao fazer login.';

      switch (error.code) {
        case 'auth/invalid-email':
          message = 'Email inválido.';
          break;
        case 'auth/user-disabled':
          message = 'Esta conta foi desativada.';
          break;
        case 'auth/user-not-found':
          message = 'Usuário não encontrado.';
          break;
        case 'auth/wrong-password':
          message = 'Senha incorreta.';
          break;
        case 'auth/invalid-credential':
          message = 'Email ou senha incorretos.';
          break;
        case 'auth/too-many-requests':
          message = 'Muitas tentativas. Tente novamente mais tarde.';
          break;
      }

      show(message, { backgroundColor: '#ba1a1a' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    // Libera o redirect quando fechar o dialog
    setHoldRedirect(false);
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    // router.push('/auth/forgot-password');
  };

  const handleCreateAccount = () => {
    router.push('/auth/register');
  };

  return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={28} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Login</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Field */}
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password Field */}
            <InputField
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            {/* Login Button */}
            <PrimaryButton
              title="Entrar"
              onPress={handleLogin}
              loading={isLoading}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.linkContainer}
              onPress={handleForgotPassword}
            >
              <Text style={styles.linkText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            {/* Create Account Link */}
            <TouchableOpacity
              style={styles.linkContainer}
              onPress={handleCreateAccount}
            >
              <Text style={styles.linkText}>Não tem uma conta? Crie uma</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Dialog de sucesso */}
        <CustomDialog
          visible={showSuccessDialog}
          title="Bem-vindo!"
          message="Login realizado com sucesso."
          onClose={handleDialogClose}
        />
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
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
  linkContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '400',
  },
});
