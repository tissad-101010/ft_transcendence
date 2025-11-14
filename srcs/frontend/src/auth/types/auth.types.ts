// ─── Auth Core ────────────────────────────────────────────────

// Représente un utilisateur minimal côté frontend
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  isTwoFactorEnabled?: boolean;
}

// Payload retourné après un login/signup réussi
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// ─── Sign In / Sign Up Forms ─────────────────────────────────

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  username: string;
  email: string;
  password: string;
}

// ─── Two Factor ──────────────────────────────────────────────

// Les méthodes supportées par ton backend
export type TwoFactorMethod = 'TOTP' | 'EMAIL' | 'SMS';

// Représente les données nécessaires à la vérification du code 2FA
export interface TwoFactorVerifyData {
  method: TwoFactorMethod;
  code: string;
}

// Réponse typique du backend après le login initial
// indiquant qu'une étape 2FA est requise
export interface TwoFactorPendingResponse {
  twoFactorRequired: true;
  availableMethods: TwoFactorMethod[];
  userId: string;
}

// Réponse finale après la vérification du code 2FA
export interface TwoFactorSuccessResponse extends AuthResponse {
  twoFactorRequired: false;
}

// ─── API Responses ───────────────────────────────────────────

// Représente une union pratique pour gérer les réponses du backend
export type LoginResponse =
  | AuthResponse
  | TwoFactorPendingResponse;

// ─── Context / Hooks ─────────────────────────────────────────

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: SignInData) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: SignUpData) => Promise<void>;
  verifyTwoFactor: (data: TwoFactorVerifyData) => Promise<void>;
}
