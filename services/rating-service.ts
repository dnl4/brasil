import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from '@/firebaseConfig';

export interface Rating {
  id: string;
  prestadorWhatsapp: string;
  prestadorNome?: string;
  rating: number;
  comment: string;
  userId: string;
  userName: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateRatingData {
  prestadorWhatsapp: string;
  prestadorNome?: string;
  rating: number;
  comment: string;
  userId: string;
  userName: string;
}

export interface UpdateRatingData {
  prestadorNome?: string;
  rating: number;
  comment: string;
}

const RATINGS_COLLECTION = 'ratings';

/**
 * Formata o nome do usuário para exibição parcial (ex: "João Silva" -> "João S.")
 */
export function formatPartialName(fullName: string): string {
  if (!fullName) return 'Anônimo';
  
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return parts[0];
  
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  
  return `${firstName} ${lastInitial}.`;
}

/**
 * Formata o número de WhatsApp para exibição
 */
export function formatWhatsappDisplay(whatsapp: string): string {
  if (!whatsapp) return '';
  
  // Remove tudo que não é dígito
  const digits = whatsapp.replace(/\D/g, '');
  
  // Brasil: +55 (XX) XXXXX-XXXX
  if (digits.startsWith('55') && digits.length === 13) {
    return `+55 (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  
  // Paraguai: +595 (XXX) XXX-XXX
  if (digits.startsWith('595') && digits.length >= 12) {
    return `+595 (${digits.slice(3, 6)}) ${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  
  // Fallback: apenas adiciona o +
  return `+${digits}`;
}

/**
 * Cria uma nova avaliação
 */
export async function createRating(data: CreateRatingData): Promise<string> {
  const docRef = await addDoc(collection(db, RATINGS_COLLECTION), {
    ...data,
    prestadorWhatsapp: data.prestadorWhatsapp.replace(/\D/g, ''), // Armazena apenas dígitos
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return docRef.id;
}

/**
 * Atualiza uma avaliação existente
 */
export async function updateRating(ratingId: string, data: UpdateRatingData): Promise<void> {
  const docRef = doc(db, RATINGS_COLLECTION, ratingId);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Exclui uma avaliação
 */
export async function deleteRating(ratingId: string): Promise<void> {
  const docRef = doc(db, RATINGS_COLLECTION, ratingId);
  await deleteDoc(docRef);
}

/**
 * Busca avaliações por número de WhatsApp do prestador
 */
export async function getRatingsByWhatsapp(whatsapp: string): Promise<Rating[]> {
  const normalizedWhatsapp = whatsapp.replace(/\D/g, '');
  
  const q = query(
    collection(db, RATINGS_COLLECTION),
    where('prestadorWhatsapp', '==', normalizedWhatsapp),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Rating[];
}

/**
 * Busca avaliações feitas por um usuário específico
 */
export async function getRatingsByUser(userId: string): Promise<Rating[]> {
  const q = query(
    collection(db, RATINGS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Rating[];
}

/**
 * Calcula a média de avaliações
 */
export function calculateAverageRating(ratings: Rating[]): number {
  if (ratings.length === 0) return 0;
  
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Arredonda para 1 casa decimal
}
