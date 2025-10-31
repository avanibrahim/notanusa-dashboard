import React, { createContext, useContext, useEffect, useState } from 'react';

// Dummy type biar gak error
type Profile = {
  id?: string;
  full_name?: string;
  business_name?: string;
  role?: string;
};

// Gak perlu import dari '@supabase/supabase-js' karena kita belum pakai Supabase
type User = {
  id?: string;
  email?: string;
};

// Interface context
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, businessName?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Buat context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Karena gak pakai Supabase dulu, biarkan kosong
    setLoading(false);
  }, []);

  const signIn = async () => {};
  const signUp = async () => {};
  const signOut = async () => {};

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
