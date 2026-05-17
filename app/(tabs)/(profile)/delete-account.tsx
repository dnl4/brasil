import { Alert02Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { HugeiconsIcon } from '@/components/ui/hugeicons-icon';
import { InputField } from '@/components/ui/input-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useSnackbar } from '@/components/ui/snackbar';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/firebaseConfig';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { deleteUserProfile } from '@/services/user-service';

const CONFIRMATION_WORD = 'EXCLUIR';

export default function DeleteAccountScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const snackbar = useSnackbar();

  const [password, setPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const canProceed =
    password.length > 0 &&
    confirmationText.trim().toUpperCase() === CONFIRMATION_WORD &&
    acknowledged;

  const handleRequestDelete = () => {
    if (!password) {
      snackbar.show('Digite sua senha.', { backgroundColor: '#F44336' });
      return;
    }
    if (confirmationText.trim().toUpperCase() !== CONFIRMATION_WORD) {
      snackbar.show(`Digite "${CONFIRMATION_WORD}" para confirmar.`, {
        backgroundColor: '#F44336',
      });
      return;
    }
    if (!acknowledged) {
      snackbar.show('Confirme que entende que a ação é irreversível.', {
        backgroundColor: '#F44336',
      });
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDialog(false);
    if (!auth.currentUser || !user?.email) {
      snackbar.show('Usuário não autenticado.', { backgroundColor: '#F44336' });
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);

      const uid = auth.currentUser.uid;

      try {
        await deleteUserProfile(uid);
      } catch (err) {
        console.warn('Erro ao remover perfil do Firestore:', err);
      }

      await deleteUser(auth.currentUser);
      snackbar.show('Conta excluída com sucesso.', { backgroundColor: '#4CAF50' });
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      let errorMessage = 'Erro ao excluir conta. Tente novamente.';
      switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = 'Senha incorreta.';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Por segurança, faça login novamente e tente de novo.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Falha de conexão. Verifique sua internet.';
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
          <View
            style={[
              styles.warningBox,
              {
                backgroundColor: isDark ? '#3a1f1f' : '#FEF2F2',
                borderColor: '#EF4444',
              },
            ]}
          >
            <HugeiconsIcon icon={Alert02Icon} size={28} color="#EF4444" />
            <View style={styles.warningTextWrapper}>
              <ThemedText style={styles.warningTitle}>Ação irreversível</ThemedText>
              <ThemedText style={styles.warningText}>
                Ao excluir sua conta, todos os seus dados de perfil serão removidos
                permanentemente. Suas avaliações e sugestões publicadas podem
                permanecer visíveis no aplicativo.
              </ThemedText>
            </View>
          </View>

          <InputField
            label="Senha atual"
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <InputField
            label={`Digite "${CONFIRMATION_WORD}" para confirmar`}
            value={confirmationText}
            onChangeText={setConfirmationText}
            placeholder={CONFIRMATION_WORD}
            autoCapitalize="characters"
            autoCorrect={false}
            helperText="Esta etapa garante que você realmente deseja prosseguir."
          />

          <View
            style={[
              styles.acknowledgeRow,
              {
                backgroundColor: isDark ? '#1a1a1a' : '#F9FAFB',
                borderColor: isDark ? '#333' : '#E5E7EB',
              },
            ]}
            onStartShouldSetResponder={() => true}
            onResponderRelease={() => setAcknowledged((v) => !v)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: acknowledged ? '#EF4444' : 'transparent',
                  borderColor: acknowledged ? '#EF4444' : isDark ? '#666' : '#9CA3AF',
                },
              ]}
            >
              {acknowledged && <ThemedText style={styles.checkmark}>✓</ThemedText>}
            </View>
            <ThemedText style={[styles.acknowledgeText, { color: colors.text }]}>
              Entendo que esta ação é permanente e não pode ser desfeita.
            </ThemedText>
          </View>

          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={loading ? 'Excluindo...' : 'Excluir minha conta'}
              onPress={handleRequestDelete}
              disabled={loading || !canProceed}
              style={styles.deleteButton}
            />
          </View>

          <View style={styles.cancelContainer}>
            <PrimaryButton
              title="Cancelar"
              onPress={() => router.back()}
              style={styles.cancelButton}
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomDialog
        visible={showConfirmDialog}
        title="Excluir conta?"
        message="Tem certeza absoluta? Esta ação não pode ser desfeita."
        buttons={[
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setShowConfirmDialog(false),
          },
          {
            text: 'Excluir definitivamente',
            style: 'destructive',
            onPress: handleConfirmDelete,
          },
        ]}
        onClose={() => setShowConfirmDialog(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  warningBox: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningTextWrapper: { flex: 1 },
  warningTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  warningText: { fontSize: 14, lineHeight: 20, opacity: 0.85 },
  acknowledgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#fff', fontSize: 16, fontWeight: '700', lineHeight: 18 },
  acknowledgeText: { flex: 1, fontSize: 14 },
  buttonContainer: { marginTop: 12 },
  cancelContainer: { marginTop: 4 },
  deleteButton: { backgroundColor: '#EF4444' },
  cancelButton: { backgroundColor: '#6B7280' },
});
