import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { TwoFactorMethod } from "./types/auth.types";
import { fetchUserProfile } from "./controllers/auth.api";

type User = {
  id: number;
  username: string;
  email: string;
  avatar?: string;
};

type Pending2FA = {
  required: boolean;
  methods: TwoFactorMethod[];
  userId?: number;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  pending2FA: Pending2FA | null;
  login: (user: User) => void;
  logout: () => void;
  setPending2FA: (data: Pending2FA | null) => void;
  resetPending2FA: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [pending2FA, setPending2FA] = useState<Pending2FA | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (userData: User) => {
    setUser(userData);
    setPending2FA(null);
  };

  const logout = () => {
    setUser(null);
    setPending2FA(null);
  };
  const resetPending2FA = () => {
    setPending2FA({ required: false, methods: [] });
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const profile = await fetchUserProfile();
        if (profile.success && profile.data) {
          setUser(profile.data);
        }
      } catch (err) {
        console.error("Failed to fetch user profile on init:", err);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // 🔥 AJOUT : écoute du logout externe
  useEffect(() => {
    const handleExternalLogout = () => {
      console.log("🔌 Logout reçu depuis l’extérieur (BabylonJS)");
      logout();
    };

    window.addEventListener("app-logout", handleExternalLogout);

    return () => {
      window.removeEventListener("app-logout", handleExternalLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        pending2FA,
        login,
        logout,
        setPending2FA,
        loading,
        resetPending2FA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
