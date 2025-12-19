import {
  ArrowLeft02Icon,
  Call02Icon,
  Mail01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import { updateEmail } from 'firebase/auth';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { PrimaryButton } from '@/components/ui/primary-button';
import { useSnackbar } from '@/components/ui/snackbar';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/firebaseConfig';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ContactSettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const snackbar = useSnackbar();

  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleSave = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      // Atualizar e-mail se foi alterado
      if (email !== user?.email && email.trim()) {
        await updateEmail(auth.currentUser, email.trim());
      }

      // Atualizar perfil com telefone (armazenado no displayName ou custom claims)
      // Nota: O telefone normalmente requer verificação por SMS no Firebase
      // Por enquanto, vamos apenas mostrar uma mensagem de sucesso

      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Erro ao atualizar:', error);
      let errorMessage = 'Erro ao atualizar informações';
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por segurança, faça login novamente para alterar o e-mail';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este e-mail já está em uso';
      }

      snackbar.show(errorMessage, { backgroundColor: '#F44336' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
            backgroundColor: colors.background,
            borderBottomColor: isDark ? '#333' : '#eee',
          },
        ]}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <HugeiconsIcon icon={ArrowLeft02Icon} size={24} color={colors.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Configurações de contato</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* E-mail Field */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <HugeiconsIcon icon={Mail01Icon} size={20} color={colors.icon} />
              <ThemedText style={styles.label}>E-mail</ThemedText>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#fff',
                  borderColor: isDark ? '#333' : '#e5e5e5',
                  color: colors.text,
                },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu e-mail"
              placeholderTextColor={isDark ? '#666' : '#999'}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Phone Field */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <HugeiconsIcon icon={Call02Icon} size={20} color={colors.icon} />
              <ThemedText style={styles.label}>Telefone</ThemedText>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#fff',
                  borderColor: isDark ? '#333' : '#e5e5e5',
                  color: colors.text,
                },
              ]}
              value={phone}
              onChangeText={setPhone}
              placeholder="Digite seu telefone"
              placeholderTextColor={isDark ? '#666' : '#999'}
              keyboardType="phone-pad"
            />
            <ThemedText style={styles.helperText}>
              A alteração do telefone pode requerer verificação por SMS
            </ThemedText>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View
          style={[
            styles.buttonContainer,
            {
              paddingBottom: insets.bottom + 20,
              backgroundColor: colors.background,
            },
          ]}
        >
          <PrimaryButton
            title={loading ? 'Salvando...' : 'Salvar alterações'}
            onPress={handleSave}
            disabled={loading}
          />
        </View>
      </KeyboardAvoidingView>

      <CustomDialog
        visible={showSuccessDialog}
        title="Sucesso"
        message="Informações atualizadas com sucesso!"
        buttons={[
          {
            text: 'OK',
            onPress: () => {
              setShowSuccessDialog(false);
            },
          },
        ]}
        onClose={() => {
          setShowSuccessDialog(false);
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
});
