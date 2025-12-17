import {
    ArrowRight01Icon,
    Call02Icon,
    CreditCardIcon,
    Delete02Icon,
    DocumentValidationIcon,
    Globe02Icon,
    HelpCircleIcon,
    InformationCircleIcon,
    LanguageCircleIcon,
    Link01Icon,
    Location01Icon,
    Logout01Icon,
    Mail01Icon,
    Moon02Icon,
    Notification02Icon,
    Settings02Icon,
    Share01Icon,
    ShieldUserIcon,
    UserCircleIcon,
    UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import {
    Animated,
    Image,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { auth } from '@/firebaseConfig';
import { useColorScheme } from '@/hooks/use-color-scheme';

type MenuItemProps = {
  icon: React.ComponentProps<typeof HugeiconsIcon>['icon'];
  label: string;
  onPress?: () => void;
  showDivider?: boolean;
  danger?: boolean;
};

function MenuItem({ icon, label, onPress, showDivider = true, danger = false }: MenuItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: pressed ? (isDark ? '#2a2a2a' : '#f5f5f5') : 'transparent' },
      ]}
      onPress={onPress}
    >
      <View style={styles.menuItemContent}>
        <HugeiconsIcon
          icon={icon}
          size={24}
          color={danger ? '#ff4444' : colors.icon}
          style={styles.menuIcon}
        />
        <ThemedText style={[styles.menuLabel, danger && { color: '#ff4444' }]}>
          {label}
        </ThemedText>
      </View>
      <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={colors.icon} />
      {showDivider && (
        <View
          style={[
            styles.divider,
            { backgroundColor: isDark ? '#333' : '#eee' },
          ]}
        />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'trips' | 'connections'>('trips');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const scrollY = new Animated.Value(0);

  const handleLogoutPress = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  // Animações do header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [320, 100],
    extrapolate: 'clamp',
  });

  // Avatar grande (estado expandido)
  const largeAvatarOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const largeAvatarScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  // Nome e tabs (estado expandido)
  const expandedContentOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Header colapsado (título + avatar pequeno)
  const collapsedHeaderOpacity = scrollY.interpolate({
    inputRange: [80, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuário';

  return (
    <ThemedView style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            height: headerHeight,
            paddingTop: insets.top,
            backgroundColor: colors.background,
          },
        ]}
      >
        {/* Estado Expandido - Avatar grande centralizado */}
        <Animated.View
          style={[
            styles.expandedHeader,
            {
              opacity: largeAvatarOpacity,
              transform: [{ scale: largeAvatarScale }],
            },
          ]}
        >
          <View style={styles.largeAvatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.largeAvatar} />
            ) : (
              <View
                style={[
                  styles.largeAvatar,
                  styles.avatarPlaceholder,
                  { backgroundColor: isDark ? '#333' : '#e0e0e0' },
                ]}
              >
                <HugeiconsIcon icon={UserIcon} size={50} color={colors.icon} />
              </View>
            )}
          </View>
        </Animated.View>

        {/* Nome do usuário (estado expandido) */}
        <Animated.View style={[styles.userNameContainer, { opacity: expandedContentOpacity }]}>
          <ThemedText style={styles.userName}>{displayName}</ThemedText>
        </Animated.View>

        {/* Tabs (estado expandido) */}
        <Animated.View style={[styles.tabsContainer, { opacity: expandedContentOpacity }]}>
          <Pressable
            style={[
              styles.tabButton,
              activeTab === 'trips' && styles.tabButtonActive,
              {
                backgroundColor: activeTab === 'trips'
                  ? (isDark ? '#333' : '#f0f0f0')
                  : 'transparent',
                borderColor: isDark ? '#444' : '#ddd',
              },
            ]}
            onPress={() => setActiveTab('trips')}
          >
            <ThemedText
              style={[
                styles.tabButtonText,
                activeTab === 'trips' && styles.tabButtonTextActive,
              ]}
            >
              Viagens anteriores
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.tabButton,
              activeTab === 'connections' && styles.tabButtonActive,
              {
                backgroundColor: activeTab === 'connections'
                  ? (isDark ? '#333' : '#f0f0f0')
                  : 'transparent',
                borderColor: isDark ? '#444' : '#ddd',
              },
            ]}
            onPress={() => setActiveTab('connections')}
          >
            <ThemedText
              style={[
                styles.tabButtonText,
                activeTab === 'connections' && styles.tabButtonTextActive,
              ]}
            >
              Conexões
            </ThemedText>
          </Pressable>
        </Animated.View>

        {/* Estado Colapsado - Título "Perfil" + avatar pequeno */}
        <Animated.View
          style={[
            styles.collapsedHeader,
            { opacity: collapsedHeaderOpacity },
          ]}
        >
          <ThemedText style={styles.headerTitle}>Perfi3l</ThemedText>
          <View style={styles.smallAvatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.smallAvatar} />
            ) : (
              <View
                style={[
                  styles.smallAvatar,
                  styles.avatarPlaceholder,
                  { backgroundColor: isDark ? '#333' : '#e0e0e0' },
                ]}
              >
                <HugeiconsIcon icon={UserIcon} size={24} color={colors.icon} />
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>

      {/* Scrollable Menu Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Spacer for header */}
        <View style={{ height: 320 }} />

        {/* Menu Section 1 */}
        <View
          style={[
            styles.menuSection,
            { backgroundColor: colors.background },
          ]}
        >
          <MenuItem icon={UserCircleIcon} label="Informações pessoais" />
          <MenuItem icon={Settings02Icon} label="Configurações da conta" />
          <MenuItem icon={Notification02Icon} label="Notificações" />
          <MenuItem icon={ShieldUserIcon} label="Privacidade e segurança" />
          <MenuItem icon={CreditCardIcon} label="Pagamentos e cobranças" />
          <MenuItem icon={HelpCircleIcon} label="Obter ajuda" />
          <MenuItem icon={InformationCircleIcon} label="Sobre" showDivider={false} />
        </View>

        {/* Menu Section 2 - Profile Settings */}
        <View
          style={[
            styles.menuSection,
            { backgroundColor: colors.background },
          ]}
        >
          <MenuItem icon={LanguageCircleIcon} label="Idioma" />
          <MenuItem icon={Location01Icon} label="Localização" />
          <MenuItem icon={Share01Icon} label="Compartilhar perfil" />
          <MenuItem icon={Moon02Icon} label="Modo escuro" />
          <MenuItem icon={Globe02Icon} label="Verificação de identidade" />
          <MenuItem icon={DocumentValidationIcon} label="Documentos" />
          <MenuItem icon={Link01Icon} label="Contas vinculadas" />
          <MenuItem icon={Mail01Icon} label="E-mail de contato" />
          <MenuItem icon={Call02Icon} label="Telefone" showDivider={false} />
        </View>

        {/* Danger Zone */}
        <View
          style={[
            styles.menuSection,
            { backgroundColor: colors.background, marginTop: 24 },
          ]}
        >
          <MenuItem icon={Delete02Icon} label="Excluir conta" danger showDivider />
          <MenuItem
            icon={Logout01Icon}
            label="Sair da conta"
            onPress={handleLogoutPress}
            danger
            showDivider={false}
          />
        </View>
      </Animated.ScrollView>

      {/* Dialog de confirmação de logout */}
      <CustomDialog
        visible={showLogoutDialog}
        title="Sair da conta"
        message="Tem certeza que deseja sair?"
        buttons={[
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair', style: 'destructive', onPress: confirmLogout },
        ]}
        onClose={() => setShowLogoutDialog(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    overflow: 'hidden',
  },
  expandedHeader: {
    alignItems: 'center',
    marginTop: 20,
  },
  largeAvatarContainer: {
    marginBottom: 16,
  },
  largeAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  userNameContainer: {
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
  },
  tabButtonActive: {
    borderColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabButtonTextActive: {
    fontWeight: '600',
  },
  collapsedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  smallAvatarContainer: {
    marginLeft: 16,
  },
  smallAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  menuSection: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    position: 'relative',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: 56,
    right: 0,
    height: 1,
  },
});
