import { useRouter } from 'expo-router';
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from 'firebase/auth';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { InputField } from '@/components/ui/input-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useSnackbar } from '@/components/ui/snackbar';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/firebaseConfig';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ChangePasswordScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const snackbar = useSnackbar();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const validate = (): string | null => {
    if (!currentPassword) {
      return 'Digite sua senha atual.';
    }
    if (!newPassword) {
      return 'Digite a nova senha.';
    }
    if (newPassword.length < 6) {
      return 'A nova senha deve ter pelo menos 6 caracteres.';
    }
    if (newPassword !== confirmPassword) {
      return 'As senhas não coincidem.';
    }
    if (currentPassword === newPassword) {
      return 'A nova senha deve ser diferente da atual.';
    }
    return null;
  };

  const handleChangePassword = async () => {
    const error = validate();
    if (error) {
      snackbar.show(error, { backgroundColor: '#F44336' });
      return;
    }

    if (!auth.currentUser || !user?.email) {
      snackbar.show('Usuário não autenticado.', { backgroundColor: '#F44336' });
      return;
    }

    setLoading(true);

    try {
      // Reautenticar o usuário com a senha atual
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Atualizar a senha
      await updatePassword(auth.currentUser, newPassword);

      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      
      let errorMessage = 'Erro ao alterar senha. Tente novamente.';
      
      switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Senha atual incorreta.';
          break;
        case 'auth/weak-password':
          errorMessage = 'A nova senha é muito fraca.';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Por segurança, faça login novamente.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
          break;
      }

      snackbar.show(errorMessage, { backgroundColor: '#F44336' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Senha atual */}
          <InputField
            label="Senha atual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Digite sua senha atual"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Nova senha */}
          <InputField
            label="Nova senha"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Digite a nova senha"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Confirmar nova senha */}
          <InputField
            label="Confirmar nova senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirme a nova senha"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Botão de salvar */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={loading ? 'Alterando...' : 'Alterar senha'}
              onPress={handleChangePassword}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomDialog
        visible={showSuccessDialog}
        title="Senha alterada"
        message="Sua senha foi alterada com sucesso!"
        buttons={[
          {
            text: 'OK',
            onPress: () => {
              setShowSuccessDialog(false);
              router.back();
            },
          },
        ]}
        onClose={() => {
          setShowSuccessDialog(false);
          router.back();
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  buttonContainer: {
    marginTop: 12,
  },
});
