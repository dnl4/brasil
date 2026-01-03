import { db } from '@/firebaseConfig';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';

export interface UserProfile {
  userId: string;
  displayName: string;
  fullName: string; 
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const USERS_COLLECTION = 'users';

/**
 * Valida o formato do displayName: apenas letras minúsculas e números
 */
export function validateDisplayNameFormat(displayName: string): { valid: boolean; error?: string } {
  const trimmed = displayName.trim().toLowerCase();
  
  if (!trimmed) {
    return { valid: false, error: 'Nome de exibição é obrigatório' };
  }
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Nome deve ter pelo menos 3 caracteres' };
  }
  
  if (trimmed.length > 20) {
    return { valid: false, error: 'Nome deve ter no máximo 20 caracteres' };
  }
  
  // Apenas a-z e 0-9
  const validPattern = /^[a-z0-9]+$/;
  if (!validPattern.test(trimmed)) {
    return { valid: false, error: 'Use apenas letras e números, sem espaços' };
  }
  
  return { valid: true };
}

/**
 * Verifica se o displayName já está em uso por outro usuário
 */
export async function isDisplayNameAvailable(displayName: string, currentUserId?: string): Promise<boolean> {
  const normalized = displayName.trim().toLowerCase();
  
  const q = query(
    collection(db, USERS_COLLECTION),
    where('displayName', '==', normalized)
  );
  
  const snapshot = await getDocs(q);
  
  // Se não encontrou nenhum, está disponível
  if (snapshot.empty) return true;
  
  // Se encontrou, verifica se é do próprio usuário
  if (currentUserId) {
    return snapshot.docs.every(doc => doc.id === currentUserId);
  }
  
  return false;
}

/**
 * Verifica se o número de WhatsApp já está em uso por outro usuário
 */
export async function isPhoneNumberAvailable(phoneNumber: string, currentUserId?: string): Promise<boolean> {
  const normalized = phoneNumber.trim();
  
  if (!normalized) return true;
  
  const q = query(
    collection(db, USERS_COLLECTION),
    where('phoneNumber', '==', normalized)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return true;
  
  if (currentUserId) {
    return snapshot.docs.every(doc => doc.id === currentUserId);
  }
  
  return false;
}

/**
 * Cria ou atualiza o perfil do usuário
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<void> {
  // Se está atualizando displayName, normaliza para lowercase
  if (data.displayName) {
    data.displayName = data.displayName.trim().toLowerCase();
  }
  
  const docRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    // Documento existe - fazer update parcial
    console.log('Updating user profile:', data);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  } else {
    console.log('Creating user profile:', data);
    // Documento não existe - criar com campos obrigatórios
    // Valida se tem os campos obrigatórios antes de criar
    if (!data.displayName || !data.fullName) {
      throw new Error('Campos obrigatórios ausentes: displayName e fullName são necessários para criar um perfil');
    }
    try {
    await setDoc(docRef, {
      userId,
      displayName: data.displayName,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber || '',
      phoneNumberVerified: data.phoneNumberVerified || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    } catch (error: any) {
      throw new Error('Erro ao criar perfil: ' + error.message);
    }
  }
}

/**
 * Busca o perfil do usuário
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const docRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }

  return null;
}

