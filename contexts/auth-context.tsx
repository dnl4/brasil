import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { UserProfile } from '../services/user-service';

export type AppUser = User & {
  phoneNumberVerified?: boolean;
  profile?: UserProfile;
};

type AuthContextType = {
  user: AppUser | null;
  isLoading: boolean;
  holdRedirect: boolean;
  setHoldRedirect: (hold: boolean) => void;
  refreshProfile: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  holdRedirect: false,
  setHoldRedirect: () => {},
  refreshProfile: () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [holdRedirect, setHoldRedirect] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (!user) {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authUser) return;

    const docRef = doc(db, 'users', authUser.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [authUser]);

  const user: AppUser | null = authUser
    ? Object.assign(Object.create(Object.getPrototypeOf(authUser)), authUser, {
        phoneNumberVerified: profile?.phoneNumberVerified ?? false,
        profile,
      })
    : null;

  const refreshProfile = () => {
    // Profile is auto-refreshed via onSnapshot
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setAuthUser({ ...auth.currentUser });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, holdRedirect, setHoldRedirect, refreshProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
