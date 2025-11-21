import React, { createContext, useContext, useState, ReactNode } from "react";
import { TwoFactorMethod } from "./types/auth.types"; // ← ton type défini ailleurs

// --------------------
// Types
// --------------------
type User = {
  id: number;
  username: string;
  email: string;
  avatar?: string;
};

type Pending2FA = {
  required: boolean;
  methods: TwoFactorMethod[];
  userId?: number; // utile si tu veux identifier le user avant la 2FA
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  pending2FA: Pending2FA | null;
  login: (user: User) => void;
  logout: () => void;
  setPending2FA: (data: Pending2FA | null) => void;
};

// --------------------
// Context
// --------------------
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --------------------
// Provider
// --------------------
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pending2FA, setPending2FA] = useState<Pending2FA | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    setPending2FA(null); // reset état 2FA
  };

  const logout = () => {
    setUser(null);
    setPending2FA(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        pending2FA,
        login,
        logout,
        setPending2FA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// --------------------
// Hook d’accès
// --------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
