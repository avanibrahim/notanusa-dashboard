import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id?: string;
  email?: string;
}

interface Profile {
  id?: string;
  full_name?: string;
  business_name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, businessName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  // Dummy auth, biar ga error
  useEffect(() => {
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('signIn dummy', email, password);
    setUser({ id: '1', email });
  };

  const signUp = async (email: string, password: string, fullName: string, businessName?: string) => {
    console.log('signUp dummy', { email, password, fullName, businessName });
    setUser({ id: '1', email });
    setProfile({ id: '1', full_name: fullName, business_name: businessName, role: 'user' });
  };

  const signOut = async () => {
    console.log('signOut dummy');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
