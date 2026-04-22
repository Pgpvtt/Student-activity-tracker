import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { dataService } from '../services/dataService';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setToken(await firebaseUser.getIdToken());
        
        // Fetch or create user record in Firestore via dataService
        try {
          const userData = await dataService.getFullUserData(firebaseUser.uid);
          if (userData) {
            setUser({
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
            });
          } else {
            // Initial setup for new Firebase user
            const newUser = {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              plan: 'free',
              settings: {},
              streak: 0,
              bestStreak: 0
            };
            await dataService.initUser(firebaseUser.uid, newUser);
            setUser({
              id: firebaseUser.uid,
              name: newUser.name,
              email: newUser.email,
            });
          }
        } catch (error) {
          console.error("Error setting up user session:", error);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (newToken: string, newUser: User) => {
    // This is handled by onAuthStateChanged, but kept for compatibility
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
