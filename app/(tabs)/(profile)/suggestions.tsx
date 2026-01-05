import { Add01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { SuggestionCard } from '@/components/ui/suggestion-card';
import { SuggestionModal } from '@/components/ui/suggestion-modal';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  createSuggestion,
  hasVoted,
  subscribeSuggestions,
  Suggestion,
  unvoteSuggestion,
  voteSuggestion,
} from '@/services/suggestion-service';

export default function SuggestionsScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSuggestions(
      (data) => {
        setSuggestions(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar sugestões:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleVote = async (suggestion: Suggestion) => {
    if (!user) return;

    const voted = hasVoted(suggestion, user.uid);

    try {
      if (voted) {
        await unvoteSuggestion(suggestion.id, user.uid);
      } else {
        await voteSuggestion(suggestion.id, user.uid);
      }
      // Real-time listener will update the UI automatically
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  const handleCreateSuggestion = async (title: string, description: string) => {
    if (!user) return;

    const authorName = user.displayName || user.email?.split('@')[0] || 'Anônimo';

    await createSuggestion({
      title,
      description,
      authorId: user.uid,
      authorName,
    });
    // Real-time listener will update the UI automatically
  };

  const renderItem = ({ item }: { item: Suggestion }) => (
    <SuggestionCard
      suggestion={item}
      currentUserId={user?.uid || ''}
      onVote={handleVote}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
        Nenhuma sugestão ainda.
      </Text>
      <Text style={[styles.emptySubtext, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
        Seja o primeiro a sugerir uma nova função!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={suggestions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.tint,
            bottom: insets.bottom + 20,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <HugeiconsIcon icon={Add01Icon} size={28} color="#fff" />
      </Pressable>

      <SuggestionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateSuggestion}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

