import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TwoFactorMethod } from "./types/auth.types"; // ← ton type défini ailleurs

// --------------------
// Types
// --------------------
type User = {
  id: number;
  username: string;
  email?: string;
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
  isLoading: boolean;
  login: (user: any) => void;
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
  const [isLoading, setIsLoading] = useState(true);

  const normalizeUser = (raw: any): User | null => {
    if (!raw) return null;
    const rawId = raw.id ?? raw.userId ?? raw.gameId ?? raw.playerId ?? null;
    let numericId = 0;
    if (typeof rawId === "number" && Number.isFinite(rawId)) {
        numericId = rawId;
    } else if (typeof rawId === "string") {
        const parsed = parseInt(rawId, 10);
        if (!Number.isNaN(parsed)) {
            numericId = parsed;
        }
    }
    const username =
        raw.username ||
        raw.login ||
        raw.displayName ||
        (typeof raw.email === "string" ? raw.email.split("@")[0] : null);

    if (!username) {
        return null;
    }

    return {
        id: numericId,
        username,
        email: raw.email,
        avatar: raw.avatar || raw.avatarUrl,
    };
  };

  // Au montage, vérifier si une session utilisateur existe déjà (cookies)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("https://localhost:8443/api/user/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          const normalized = normalizeUser(data);
          if (normalized) {
            console.log("Session utilisateur récupérée au démarrage:", normalized);
            setUser(normalized);
          }
        }
      } catch (error) {
        console.warn("Pas de session utilisateur active:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = (userData: any) => {
    const normalized = normalizeUser(userData);
    if (!normalized) {
        console.error("Impossible de normaliser l'utilisateur reçu lors du login:", userData);
        return;
    }
    setUser(normalized);
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
        isLoading,
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
