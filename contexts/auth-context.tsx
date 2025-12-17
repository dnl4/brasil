import { onAuthStateChanged, User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  holdRedirect: boolean;
  setHoldRedirect: (hold: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  holdRedirect: false,
  setHoldRedirect: () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [holdRedirect, setHoldRedirect] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, holdRedirect, setHoldRedirect }}>
      {children}
    </AuthContext.Provider>
  );
}
