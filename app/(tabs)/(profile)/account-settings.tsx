import {
  Call02Icon,
  Mail01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import { updateEmail } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
import { getUserProfile, isDisplayNameAvailable, updateUserProfile, validateDisplayNameFormat } from '@/services/user-service';

export default function ContactSettingsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const snackbar = useSnackbar();

  const [displayName, setDisplayName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    setLoadingProfile(true);
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) {
        setDisplayName(profile.displayName || '');
        setFullName(profile.fullName || '');
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser || !user) return;

    // Validações
    const displayNameValidation = validateDisplayNameFormat(displayName);
    if (!displayNameValidation.valid) {
      snackbar.show(displayNameValidation.error!, { backgroundColor: '#F44336' });
      return;
    }

    if (!fullName.trim()) {
      snackbar.show('Nome completo é obrigatório', { backgroundColor: '#F44336' });
      return;
    }

    setLoading(true);
    try {
      // Verifica se o displayName está disponível
      const isAvailable = await isDisplayNameAvailable(displayName, user.uid);
      if (!isAvailable) {
        snackbar.show('Este nome de exibição já está em uso', { backgroundColor: '#F44336' });
        setLoading(false);
        return;
      }

      // Atualizar perfil no Firestore
      await updateUserProfile(user.uid, {
        displayName: displayName.trim().toLowerCase(),
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phone.trim(),
      });

      // Atualizar e-mail se foi alterado
      if (email !== user?.email && email.trim()) {
        await updateEmail(auth.currentUser, email.trim());
      }

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

  if (loadingProfile) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.text} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Display Name Field */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <HugeiconsIcon icon={UserIcon} size={20} color={colors.icon} />
              <ThemedText style={styles.label}>Nome de exibição</ThemedText>
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
              value={displayName}
              onChangeText={(text) => setDisplayName(text.toLowerCase().replace(/[^a-z0-9]/g, ''))}
              placeholder="usuario123"
              placeholderTextColor={isDark ? '#666' : '#999'}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            <ThemedText style={styles.helperText}>
              Apenas letras e números, sem espaços (3-20 caracteres)
            </ThemedText>
          </View>

          {/* Full Name Field */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <HugeiconsIcon icon={UserIcon} size={20} color={colors.icon} />
              <ThemedText style={styles.label}>Nome completo</ThemedText>
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
              value={fullName}
              onChangeText={setFullName}
              placeholder="Seu nome completo"
              placeholderTextColor={isDark ? '#666' : '#999'}
              autoCapitalize="words"
            />
            <ThemedText style={styles.helperText}>
              Mantido em privado, não será exibido publicamente
            </ThemedText>
          </View>

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
              A alteração do telefone pode requerer verificação por Whatsapp
            </ThemedText>
          </View>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title={loading ? 'Salvando...' : 'Salvar alterações'}
              onPress={handleSave}
              disabled={loading}
            />
          </View>
        </ScrollView>
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    marginTop: 8,
  },
});
