import { Tournament } from './Tournament/Match/Tournament.ts';

// ─── User Types ─────────────────────────────────────────────────────────
// Type utilisateur unifié, compatible avec le contexte d'auth et le backend

/**
 * Représente un utilisateur dans l'application.
 * Utilise 'username' comme nom principal (cohérent avec auth/context.tsx)
 * mais peut être converti en 'login' pour les appels API au backend.
 */
interface TwoFactorMethods
{
    type: string,
    enabled: boolean    
}

export interface User
{
    username: string,
    id: number,
    email: string,
    phone: string,
    gamesPlayed: number,
    wins: number,
    loss: number,
    avatarUrl: string
    twoFactorMethods: TwoFactorMethods[],
}
/**
 * Type pour l'utilisateur tel qu'il est stocké dans le backend (service-game).
 * Le backend utilise 'login' au lieu de 'username'.
 */
export interface BackendUser {
    id: number;
    login: string;
    email: string;
}

/**
 * Convertit un User (frontend) vers le format attendu par le backend
 */
export function userToBackendFormat(user: User): { id: number; login: string } {
    return {
        id: user.id,
        login: user.username
    };
}

/**
 * Convertit un BackendUser vers le format User (frontend)
 */
export function backendUserToFrontend(backendUser: BackendUser): User {
    return {
        id: backendUser.id,
        username: backendUser.login,
        email: backendUser.email
    };
}

// ─── Match Types ────────────────────────────────────────────────────────

/**
 * Participant à un match.
 * 'alias' est le nom d'affichage dans le match (peut différer du username).
 */
export interface MatchParticipant {
    alias: string;         // Nom affiché dans le match
    id: number;            // ID utilisateur
    ready: boolean;        // Joueur prêt à jouer
    me: boolean;           // True si c'est l'utilisateur local
}

/**
 * Règles du match
 */
export interface MatchRules {
    speed: string;         // Vitesse du jeu ("1", "2", "3")
    timeBefore: string;    // Temps avant le début du match
    score: string;         // Score maximum pour gagner
}

/**
 * Match de tournoi
 */
export interface MatchTournament {
    sloatA: MatchParticipant | null;
    sloatB: MatchParticipant | null;
    round: number | undefined;
    nextMatchId: number | undefined;
    nextMatchSlot: number | undefined;
    tournament: Tournament | undefined;
    type: "tournament";
    dbMatchId?: number;        // ID du match dans la base de données
    dbTournamentId?: number;   // ID du tournoi dans la base de données
}

/**
 * Match amical
 */
export interface MatchFriendly {
    sloatA: MatchParticipant | null;
    sloatB: MatchParticipant | null;
    type: "friendly";
}

// ─── Tournament Types ───────────────────────────────────────────────────

// Note: TournamentParticipant est défini dans Tournament.ts car il utilise 'login' 
// au lieu de 'username' pour la compatibilité avec le backend.
// Importer depuis './Tournament.ts' si nécessaire.

// ─── API Response Types ─────────────────────────────────────────────────

/**
 * Réponse de création de match amical
 */
export interface FriendlyMatchCreateResponse {
    matchId: number;
    match: {
        id: number;
        status: string;
        isOnline: boolean;
        player1Id: number;
        player2Id: number | null;
        player1: BackendUser;
        player2: BackendUser | null;
    };
}

/**
 * Réponse de join d'un match amical
 */
export interface FriendlyMatchJoinResponse {
    match: {
        id: number;
        status: string;
        isOnline: boolean;
        player1Id: number;
        player2Id: number;
        player1: BackendUser;
        player2: BackendUser;
    };
}

