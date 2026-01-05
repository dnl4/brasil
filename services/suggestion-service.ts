import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from '@/firebaseConfig';

export type SuggestionStatus = 'pending' | 'planned' | 'completed';

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  votes: number;
  voters: string[];
  status: SuggestionStatus;
  createdAt: Date;
}

export interface CreateSuggestionData {
  title: string;
  description: string;
  authorId: string;
  authorName: string;
}

const SUGGESTIONS_COLLECTION = 'suggestions';

/**
 * Cria uma nova sugestão
 */
export async function createSuggestion(data: CreateSuggestionData): Promise<string> {
  const docRef = await addDoc(collection(db, SUGGESTIONS_COLLECTION), {
    ...data,
    votes: 1,
    voters: [data.authorId], // Autor já vota automaticamente
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Inscreve-se para atualizações em tempo real das sugestões
 * Retorna função para cancelar a inscrição
 */
export function subscribeSuggestions(
  onUpdate: (suggestions: Suggestion[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(
    collection(db, SUGGESTIONS_COLLECTION),
    orderBy('votes', 'desc')
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const suggestions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Suggestion[];
      onUpdate(suggestions);
    },
    (error) => {
      console.error('Erro ao escutar sugestões:', error);
      onError?.(error);
    }
  );

  return unsubscribe;
}

/**
 * Adiciona voto a uma sugestão
 */
export async function voteSuggestion(suggestionId: string, userId: string): Promise<void> {
  const docRef = doc(db, SUGGESTIONS_COLLECTION, suggestionId);

  await updateDoc(docRef, {
    votes: increment(1),
    voters: arrayUnion(userId),
  });
}

/**
 * Remove voto de uma sugestão
 */
export async function unvoteSuggestion(suggestionId: string, userId: string): Promise<void> {
  const docRef = doc(db, SUGGESTIONS_COLLECTION, suggestionId);

  await updateDoc(docRef, {
    votes: increment(-1),
    voters: arrayRemove(userId),
  });
}

/**
 * Verifica se usuário já votou em uma sugestão
 */
export function hasVoted(suggestion: Suggestion, userId: string): boolean {
  return suggestion.voters?.includes(userId) ?? false;
}

/**
 * Retorna o label do status em português
 */
export function getStatusLabel(status: SuggestionStatus): string {
  const labels: Record<SuggestionStatus, string> = {
    pending: 'Pendente',
    planned: 'Planejado',
    completed: 'Concluído',
  };
  return labels[status];
}

/**
 * Retorna a cor do status
 */
export function getStatusColor(status: SuggestionStatus): string {
  const colors: Record<SuggestionStatus, string> = {
    pending: '#f59e0b',
    planned: '#3b82f6',
    completed: '#10b981',
  };
  return colors[status];
}

