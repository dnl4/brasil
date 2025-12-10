import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useSnackbar } from 'flix-component/packages/snackbar/src';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { InputField } from '../../components/ui/input-field';
import { PrimaryButton } from '../../components/ui/primary-button';
import { auth } from '../../firebaseConfig';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { show } = useSnackbar();

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

      // Registro bem-sucedido, navegar para a tela principal
      router.replace('/(tabs)');
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
    <SafeAreaView style={styles.container}>
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
            />

            {/* Phone Field */}
            <InputField
              label="Telefone"
              value={phone}
              onChangeText={setPhone}
              placeholder="+55 11 99999-9999"
              keyboardType="phone-pad"
            />

            {/* Password Field */}
            <InputField
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            {/* Confirm Password Field */}
            <InputField
              label="Confirmação de senha"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            {/* Register Button */}
            <PrimaryButton
              title="Criar conta"
              onPress={handleRegister}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
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
});
