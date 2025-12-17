import { ZoneName } from "./config.ts";
import { TournamentParticipant, Tournament } from "./Tournament.ts";
import { Match, MatchRules, MatchParticipant } from "./Match.ts";
import { MatchFriendlyOnline } from "./Match/MatchFriendlyOnLine.ts";
import { Env } from "./lockerRoom/scoreboardUI/menuCreate.ts";
import { SceneManager } from "./scene/SceneManager.ts";

import {
    FriendManager,
    FriendInvitationsI
} from "./friends/FriendsManager.ts";
import { Friend } from "./friends/Friend.ts";
import { FriendInvitation } from "./friends/FriendInvitation.ts";
import { PromiseUpdateResponse, StatusInvitation } from "./friends/api/friends.api.ts";

import { User, userToBackendFormat } from "./types.ts";

import { API_URL } from "./utils.ts";

/*
    Classe permettant de gérer les actions de l'utilisateur, lieu où seront stockées les données
*/

export class UserX 
{
    // PROPS                // this.user = {
                //     username: data.match.player1.login || this.user.username,
                //     id: data.match.player1.id,
                //     email: this.user.email,

                // };
    private currentZone: ZoneName | null = null;
    private sceneManager : SceneManager;
    private user: User | null = null;
    
    private match: Match | null = null;
    private tournament: Tournament | null = null;

    private friendManager: FriendManager;

    constructor(sceneManager : SceneManager)
    {
        this.sceneManager = sceneManager;
        this.friendManager = new FriendManager(this);
        console.log("UserX initialisé, en attente de l'utilisateur depuis le contexte React");
    }


    /***********************************/
    /*              Friends            */
    /***********************************/

    async loadDataFriends() : Promise<{success: boolean, message: string}>
    {
        return (await this.friendManager.loadData());
    }

    async sendFriendInvite(
        username: string
    ) : Promise<{success: boolean, message?: string, data?: any}>
    {
        return (await this.friendManager.sendInvitation(username));
    }

    async deleteFriend(friend: Friend) : Promise<{success: boolean, message: string}>
    {
        return (await this.friendManager.deleteFriend(friend))
    }

    async updateInvitation(
        invitation: FriendInvitation,
        param: StatusInvitation
    ) : Promise<PromiseUpdateResponse>
    {
        return (await this.friendManager.updateInvitation(invitation, param));
    }

    async deleteInvitation(
        invitation: FriendInvitation
    ) : Promise<PromiseUpdateResponse>
    {
        return (await this.friendManager.deleteInvitation(invitation));
    }

    async deleteBlocked(
        username: string
    ) : Promise<PromiseUpdateResponse>
    {
        return (await this.friendManager.deleteBlocked(username));
    }

    async blockFriend(friend: Friend)
    {
        return (await this.friendManager.blockFriend(friend));
    }

    /***********************************/
    /*       Tournament / Matchs       */
    /***********************************/

    private extractNumericId(value: any): number
    {
        if (typeof value === "number" && Number.isFinite(value))
            return value;
        if (typeof value === "string") {
            const parsed = parseInt(value, 10);
            if (!Number.isNaN(parsed))
                return parsed;
        }
        return 0;
    }
    
    async createTournament(a: string) : Promise<boolean>
    {
        if (this.user === null)
        {
            // update user from profile
            console.error("Impossible de créer un tournoi: utilisateur non connecté");
            return (false);
        }
        // Utiliser le username de l'utilisateur comme alias si aucun alias n'est fourni
        const alias = a || this.user.username;
        const backendUser = userToBackendFormat(this.user);
        const p : TournamentParticipant = {
            login: backendUser.login,
            alias: alias,
            ready: true,
            id: this.user.id,
            eliminate: false
        } 
        this.tournament = new Tournament(this.sceneManager);
        const result = this.tournament.addParticipant(p);
        if (result === 0) {
            console.log(`Utilisateur ${this.user.username} ajouté automatiquement au tournoi`);
        } else {
            console.error(`Erreur lors de l'ajout de l'utilisateur ${this.user.username} au tournoi`);
            return (false);
        }

        // Créer le tournoi dans la base de données (sans règles pour l'instant, elles seront ajoutées plus tard)
        // Le tournoi sera créé avec les règles par défaut, puis mises à jour quand l'utilisateur les définit
        try {
            const response = await fetch(`${API_URL}/api/tournament/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    name: null,
                    speed: "1", // Valeur par défaut, sera mise à jour
                    scoreMax: "5", // Valeur par défaut, sera mise à jour
                    timeBefore: "3", // Valeur par défaut, sera mise à jour
                    player1_id: this.user.id || 0,
                    player1_login: backendUser.login, // Envoyer le login pour synchronisation avec le système d'auth
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Tournoi créé dans la base de données:", data.tournamentId);
                this.tournament.setDbTournamentId = data.tournamentId;
                
                // Mettre à jour l'ID du participant dans la base de données
                if (data.tournament && data.tournament.participants && data.tournament.participants.length > 0) {
                    p.dbParticipantId = data.tournament.participants[0].id;
                }
                
                return (true);
            } else {
                const errorData = await response.json();
                console.error("Erreur lors de la création du tournoi:", errorData);
                return (false);
            }
        } catch (error) {
            console.error("Erreur lors de l'appel API pour créer le tournoi:", error);
            return (false);
        }
    }
    playTournamentMatch(
        t: Tournament,
        m: Match,
        sceneManager: SceneManager
    ) : boolean
    {
        if (this.user === null) {
            console.error("Impossible de jouer un match de tournoi: utilisateur non connecté");
            return (false);
        }
        return (t.playMatch(m, this.user.id || 0, sceneManager));
    }
        async createFriendlyMatch(
        r: MatchRules,
        isOnline: boolean = false
    ) : Promise<boolean>
    {
        if (!this.user) {
            //  update user from profile
            console.error("Impossible de créer un match amical: utilisateur non défini dans UserX");
            return (false);
        }
        
        console.log("Création d'un match amical avec l'utilisateur:", this.user);
        console.log("Règles du match:", r);
        console.log("Mode:", isOnline ? "En ligne" : "Local");
        
        // Créer le match dans la base de données
        const backendUser = userToBackendFormat(this.user);
        try {
            const requestBody = {
                speed: r.speed || "1",
                scoreMax: r.score || "5",
                timeBefore: r.timeBefore || "3",
                player1_id: this.user.id || 0,
                player1_login: backendUser.login, // Envoyer le login pour synchronisation avec le système d'auth
                isOnline: isOnline,
            };
            console.log("Envoi de la requête POST /api/friendly/create avec:", requestBody);
            
            const response = await fetch(`${API_URL}/api/friendly/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify(requestBody),
            });

            console.log("Réponse reçue:", response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }
                console.error("Erreur lors de la création du match amical:", response.status, errorData);
                return (false);
            }

            const data = await response.json();
            console.log("Match amical créé dans la base de données:", data.matchId);
            console.log("Détails du match créé:", data.match);
            console.log("Statut du match créé:", data.match?.status || "N/A");

            // Important : synchroniser l'ID utilisateur local avec celui utilisé côté backend
            // Le service game peut créer / réutiliser un utilisateur avec un ID différent de this.user.id
            // (via prisma.user.upsert). On récupère donc l'ID réel pour que les prochains appels (join)
            // envoient le même playerId que celui stocké dans la DB (match.player1Id).
            if (data.match && data.match.player1 && typeof data.match.player1.id === "number") {
                const oldUser = { ...this.user };
                // this.user = {
                //     username: data.match.player1.login || this.user.username,
                //     id: data.match.player1.id,
                //     email: this.user.email,

                // };
                console.log("Synchronisation de l'utilisateur créateur avec la DB du service game:", {
                    oldUser,
                    newUser: this.user,
                });
            }
            
            // Le match est créé et en attente d'un joueur
            // L'écran d'attente sera géré par l'interface
            return (true);
        } catch (error) {
            console.error("Erreur lors de l'appel API pour créer le match amical:", error);
            return (false);
        }
    }

    async joinFriendlyMatch(
        r: MatchRules,
        idMatch: number,
        idOpp: number,
        loginOpp: string,
        env: Env
    ) : Promise<boolean>
    {
        console.log("joinFriendlyMatch appelé avec:", { idMatch, idOpp, loginOpp, user: this.user });
        if (!this.user) {
            console.error("this.user est null dans joinFriendlyMatch");
            return (false);
        }
        if (this.user.id === undefined || this.user.id === null || this.user.id === 0) {
            console.warn("this.user.id est invalide ou 0:", this.user.id, "- Continuons quand même pour déboguer");
            // On continue quand même pour voir ce qui se passe
        }
        
        // Appeler l'API pour rejoindre le match
        const backendUser = userToBackendFormat(this.user);
        try {
            const response = await fetch(`${API_URL}/api/friendly/${idMatch}/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    player2_id: this.user.id || 0,
                    player2_login: backendUser.login, // Envoyer le login pour synchronisation avec le système d'auth
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erreur lors de la jonction au match amical:", errorData);
                return (false);
            }

            const data = await response.json();
            console.log("Match amical rejoint:", data.match);
            console.log("Match en ligne:", data.match?.isOnline || false);

            const backendLogin = backendUser.login;
            const player1LoginDb = data.match?.player1?.login;
            const player2LoginDb = data.match?.player2?.login;
            const isCurrentPlayer1 = backendLogin && player1LoginDb && backendLogin === player1LoginDb;
            const isCurrentPlayer2 = backendLogin && player2LoginDb && backendLogin === player2LoginDb;

            if (isCurrentPlayer1 && data.match?.player1 && typeof data.match.player1.id === "number") {
                const oldUser = { ...this.user };
                // this.user = {
                //     username: data.match.player1.login || this.user.username,
                //     id: data.match.player1.id,
                //     email: this.user.email,
                //     avatar: this.user.avatar,
                // };
                console.log("Synchronisation (player1) avec la DB du service game dans joinFriendlyMatch:", {
                    oldUser,
                    newUser: this.user,
                });
            } else if (isCurrentPlayer2 && data.match?.player2 && typeof data.match.player2.id === "number") {
                const oldUser = { ...this.user };
                // this.user = {
                //     username: data.match.player2.login || this.user.username,
                //     id: data.match.player2.id,
                //     email: this.user.email,
                //     avatar: this.user.avatar,
                // };
                console.log("Synchronisation (player2) avec la DB du service game dans joinFriendlyMatch:", {
                    oldUser,
                    newUser: this.user,
                });
            } else {
                console.warn("Impossible de déterminer le rôle player1/player2 pour l'utilisateur courant lors de joinFriendlyMatch:", {
                    backendLogin,
                    player1Login: player1LoginDb,
                    player2Login: player2LoginDb
                });
            }

            const match = new MatchFriendlyOnline(idMatch, r, this.sceneManager);
            const isOnline = data.match?.isOnline || false;

            console.log("Création des joueurs pour le match:", { 
                user: this.user, 
                loginOpp, 
                idOpp,
                isOnline,
                player1Id: data.match?.player1Id,
                player2Id: data.match?.player2Id
            });
            
            // Déterminer l'ordre des participants selon player1Id et player2Id
            // player1 → équipe 1 (gauche), player2 → équipe 2 (droite)
            // Dans GameLogic, p[0] → équipe 1, p[1] → équipe 2
            let players: MatchParticipant[];
            
            const player1Id = data.match?.player1Id;
            const player2Id = data.match?.player2Id;
            const player1Login = data.match?.player1?.login;
            const player2Login = data.match?.player2?.login;
            
            console.log("Détails du match pour déterminer l'ordre:", {
                player1Id,
                player2Id,
                player1Login,
                player2Login,
                myUserId: this.user.id,
                loginOpp,
                idOpp,
                "player1Id === myUserId": player1Id === this.user.id,
                "player2Id === myUserId": player2Id === this.user.id
            });
            
            // Simplification: mapping déterministe et uniforme
            // Premier joueur (player1) → gauche (p[0])
            // Second joueur (player2) → droite (p[1])
            // Ce comportement s'applique aussi pour les matchs en ligne : premier arrivé = gauche, second = droite.
            players = [
                { alias: player1Login || loginOpp || "Player1", id: player1Id ?? idOpp ?? 0, ready: false, me: false },
                { alias: player2Login || loginOpp || "Player2", id: player2Id ?? idOpp ?? 0, ready: false, me: false }
            ];

            // Marquer "me" selon l'ID utilisateur
            if (player1Id && player1Id === this.user.id) {
                players[0].me = true;
                console.log("Utilisateur local est player1 → GAUCHE");
            } else if (player2Id && player2Id === this.user.id) {
                players[1].me = true;
                console.log("Utilisateur local est player2 → DROITE");
            } else {
                // cas où player2Id peut être absent (match en attente) : si je suis créateur, je suis player1
                if (!player2Id && player1Id === this.user.id) {
                    players[0].me = true;
                    console.log("player2 absent mais utilisateur local est créateur → traité comme player1 (GAUCHE)");
                } else {
                    console.log("Utilisateur local n'est pas encore assigné player1/player2 (spectateur ou attente)");
                }
            }

            console.log("Tableau players créé:", players.map(p => ({ id: p.id, alias: p.alias, me: p.me })));

            // Conserver les IDs tels que fournis par le serveur (DB IDs).
            // Ne pas écraser `id` ici : le mapping jeu (1=gauche, 2=droite) sera fait côté `MatchFriendlyOnLine`.
            console.log("Players prêts (IDs DB conservés):",
                players.map((p, idx) => ({
                    id: p.id,
                    alias: p.alias,
                    me: p.me,
                    position: idx === 0 ? "gauche" : "droite",
                }))
            );

            if (!match.init(players, isOnline))
                return (false);
            
            this.sceneManager.getSceneInteractor?.disableInteractions();
            // env.menuContainer.dispose();
            env.scoreboard.setClic = false;
            env.scoreboard.setPlayMatch = true;
            this.sceneManager.moveCameraTo(ZoneName.FIELD, () => {
                this.sceneManager.setSpecificMesh(false);
                this.sceneManager.getSceneInteractor?.enableInteractionScene();
            });

            match.play();
            return (true);
        } catch (error) {
            console.error("Erreur lors de l'appel API pour rejoindre le match amical:", error);
            return (false);
        }
    }
    
    

    async deleteTournament() : Promise<boolean>
    {
        /*
            Si le tournoi créer des timestamp ou appels réseaux etc
            les arrêter avant de mettre à NULL
        */
        const tournamentId = this.tournament?.getDbTournamentId ?? null;

        if (tournamentId !== null) {
            try {
                const response = await fetch(`${API_URL}/api/tournament/${tournamentId}`, {
                    method: "DELETE",
                    // Pas de body => ne pas envoyer Content-Type pour éviter FST_ERR_CTP_EMPTY_JSON_BODY
                    headers: {
                        Accept: "application/json",
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Erreur lors de la suppression du tournoi:", errorData);
                    // On remet quand même à null côté front pour éviter les fuites d'état locales
                } else {
                    console.log("Tournoi supprimé côté serveur:", tournamentId);
                }
            } catch (error) {
                console.error("Erreur réseau lors de la suppression du tournoi:", error);
            }
        }

        this.tournament = null;
        return true;
    }
    
    async deleteFriendlyMatch(
        matchId: number
    ) : Promise<boolean>
    {
        if (!this.user) {
            console.error("Impossible de supprimer un match amical: utilisateur non défini dans UserX");
            return (false);
        }
        
        console.log("Suppression du match amical:", matchId);
        
        try {
            const response = await fetch(`${API_URL}/api/friendly/${matchId}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                },
                credentials: "include",
            });

            console.log("Réponse reçue:", response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }
                console.error("Erreur lors de la suppression du match amical:", response.status, errorData);
                return (false);
            }

            const data = await response.json();
            console.log("Match amical supprimé:", data.message);
            
            return (true);
        } catch (error) {
            console.error("Erreur lors de l'appel API pour supprimer le match amical:", error);
            return (false);
        }
    }

    /***********************************/
    /*              Getters            */
    /***********************************/

    // == Friends == //
    get getFriends() : Friend[]
    {
        return (this.friendManager.getFriends);
    }

    get getFriendInvitations() : FriendInvitationsI
    {
        return (this.friendManager.getInvitations)
    }

    get getUserBlockeds() : string[]
    {
        return (this.friendManager.getBlockeds);
    }
    // ============ //

    // == Match / Tournament == //
    get getMatch() : Match | null
    {
        return (this.match);
    }

    get getTournament() : Tournament | null
    {
        return (this.tournament);
    }
    // ======================== //


    get getCurrentZone() : ZoneName | null
    {
        return (this.currentZone);
    }

    get getUser() : User | null
    {
        return (this.user);
    }

    /***********************************/
    /*             Setters             */
    /***********************************/

    // == Match / Tournament == //
    set setTournament(
        tournament: Tournament
    )
    {
        this.tournament = tournament;
    }

    set setMatch(
        match: Match
    )
    {
        this.match = match;
    }
    // ======================== //
    
    set setCurrentZone(
        zone: ZoneName
    )
    {
        this.currentZone = zone;
    }


    set setUser(
        user:User
    )
    {
            this.user = user;
        if (this.user !== null) {
            this.friendManager.loadData();
            console.log("Utilisateur authentifié défini dans UserX:", this.user);
        } else {
            console.warn("Aucun utilisateur authentifié exploitable fourni à UserX, réinitialisation du contexte utilisateur.");
            this.user = null;
        }
    }
    clearUser() : void
    {
        this.user = null;
    }
}
