import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export interface UserProfile {
  userId: string;
  displayName: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const USERS_COLLECTION = 'users';

/**
 * Cria ou atualiza o perfil do usuário
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  } else {
    await setDoc(docRef, {
      userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
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

