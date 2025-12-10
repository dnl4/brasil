import { Briefcase01Icon, Home01Icon, StarIcon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const activeColor = '#0066FF';
  const inactiveColor = '#9CA3AF';

  return (
    <Tabs
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
          height: Platform.OS === 'ios' ? 62 : 70,
          paddingBottom: 10,
          paddingTop: 10,
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
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <HugeiconsIcon icon={Home01Icon} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Meus serviços',
          tabBarIcon: ({ color }) => <HugeiconsIcon icon={Briefcase01Icon} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ratings"
        options={{
          title: 'Minhas avaliações',
          tabBarIcon: ({ color }) => <HugeiconsIcon icon={StarIcon} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Meu perfil',
          tabBarIcon: ({ color }) => <HugeiconsIcon icon={UserIcon} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
