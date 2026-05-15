import { FileAttachmentIcon, StarIcon, UserIcon, UserSearch01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@/components/ui/hugeicons-icon';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { shouldSkipWhatsappVerification } from '@/constants/verification';
import { useAuth } from '@/contexts/auth-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import EmailNotVerifiedScreen from './email-not-verified';
import WhatsappNotVerifiedScreen from './whatsapp-not-verified';

function TabBarIcon({ icon, color }: { icon: React.ComponentProps<typeof HugeiconsIcon>['icon']; color: string }) {
  return <HugeiconsIcon icon={icon} size={24} color={color} />;
}

export default function TabLayout() {
  const activeColor = '#0066FF';
  const inactiveColor = '#9CA3AF';
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  if (!user) {
    return <Redirect href="/auth/welcome" />;
  }

  if (!user?.emailVerified && process.env.EXPO_PUBLIC_SKIP_EMAIL_VERIFICATION !== 'true') {
    return <EmailNotVerifiedScreen />;
  }
  if (!user?.phoneNumberVerified && !shouldSkipWhatsappVerification()) {
    return <WhatsappNotVerifiedScreen />;
  }
  return (
    <Tabs
      initialRouteName="services"
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingTop: 10,
          paddingBottom: bottomInset,
          height: 60 + bottomInset,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '500',
          textAlign: 'center',
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 2,
        },
        tabBarAllowFontScaling: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: 'Serviços',
          tabBarIcon: ({ color }) => <TabBarIcon icon={UserSearch01Icon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="email-not-verified"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="whatsapp-not-verified"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="ratings"
        options={{
          title: 'Minhas avaliações',
          tabBarIcon: ({ color }) => <TabBarIcon icon={StarIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="documentos"
        options={{
          title: 'Documentos',
          tabBarIcon: ({ color }) => <TabBarIcon icon={FileAttachmentIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Meu perfil',
          tabBarIcon: ({ color }) => <TabBarIcon icon={UserIcon} color={color} />,
        }}
      />
    </Tabs>
  );
}
