import {
  Scene,
} from '@babylonjs/core';

import { ZoneName } from "./config.ts";
import { TournamentParticipant, Tournament } from "./Tournament.ts";

import { Match, MatchRules } from "./Match.ts";

import { SceneManager } from './scene/SceneManager.ts';

import { Friend } from './Friend.ts';
import { MatchFriendlyOnline } from './Match/MatchFriendlyOnLine.ts';

import { Env } from './lockerRoom/scoreboardUI/menuCreate.ts';

interface User
{
    login: string,
    id: number
}

/*
    Classe permettant de gérer les actions de l'utilisateur, lieu où seront stockées les données
*/

export class UserX 
{
    private match: Match | null = null;
    private tournament: Tournament | null = null;
    private currentZone: ZoneName | null = null;

    private friends : Friend[] = [];
    private sceneManager : SceneManager;
    private user: User | null = null;

    constructor(sceneManager : SceneManager)
    {
        this.sceneManager = sceneManager;
        this.simuEnAttendantBDD();
    }

    /* Juste garder le parametre login une fois le backend ajoute*/
    public addFriend(
        login: string,
    ) : number
    {
        const test = this.friends.find((f) => f.getLogin === login)
        if (test !== undefined)
        {
            console.log("Amis deja ajoute -> " + login);
            return (1);
        }
        this.friends.push(new Friend(1, login, true));
        return (0);
    }

    private simuEnAttendantBDD() : void
    {
        // Initialiser un utilisateur de test par défaut avec un ID unique
        // Cet utilisateur sera remplacé par l'utilisateur réel du contexte React
        // si l'utilisateur est connecté via BabylonScene.tsx
        const uniqueId = Math.floor(Math.random() * 1000000) + 1; // Génère un ID aléatoire entre 1 et 1000000
        this.user = { login: `test_user_${uniqueId}`, id: uniqueId };
        console.log("🔧 UserX initialisé avec utilisateur de test unique:", this.user);
        
        this.addFriend("Lolo");
        this.addFriend("Tissad");
        this.addFriend("Val");
    }

    async createTournament(a: string) : Promise<boolean>
    {
        if (this.user === null)
        {
            console.error("Impossible de créer un tournoi: utilisateur non connecté");
            return (false);
        }
        // Utiliser le login de l'utilisateur comme alias si aucun alias n'est fourni
        const alias = a || this.user.login;
        const p : TournamentParticipant = {
            login: this.user.login,
            alias: alias,
            ready: true,
            id: this.user.id,
            eliminate: false
        } 
        this.tournament = new Tournament(this.sceneManager);
        const result = this.tournament.addParticipant(p);
        if (result === 0) {
            console.log(`✅ Utilisateur ${this.user.login} ajouté automatiquement au tournoi`);
        } else {
            console.error(`❌ Erreur lors de l'ajout de l'utilisateur ${this.user.login} au tournoi`);
            return (false);
        }

        // Créer le tournoi dans la base de données (sans règles pour l'instant, elles seront ajoutées plus tard)
        // Le tournoi sera créé avec les règles par défaut, puis mises à jour quand l'utilisateur les définit
        try {
            const response = await fetch("https://localhost:8443/api/tournament/create", {
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
                    player1_id: this.user.id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("✅ Tournoi créé dans la base de données:", data.tournamentId);
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
        return (t.playMatch(m, this.user.id, sceneManager));
    }

    async createFriendlyMatch(
        r: MatchRules,
        isOnline: boolean = false
    ) : Promise<boolean>
    {
        if (!this.user) {
            console.error("❌ Impossible de créer un match amical: utilisateur non défini dans UserX");
            return (false);
        }
        
        console.log("🔄 Création d'un match amical avec l'utilisateur:", this.user);
        console.log("📋 Règles du match:", r);
        console.log("🌐 Mode:", isOnline ? "En ligne" : "Local");
        
        // Créer le match dans la base de données
        try {
            const requestBody = {
                speed: r.speed || "1",
                scoreMax: r.score || "5",
                timeBefore: r.timeBefore || "3",
                player1_id: this.user.id,
                isOnline: isOnline,
            };
            console.log("📤 Envoi de la requête POST /api/friendly/create avec:", requestBody);
            
            const response = await fetch("https://localhost:8443/api/friendly/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify(requestBody),
            });

            console.log("📡 Réponse reçue:", response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }
                console.error("❌ Erreur lors de la création du match amical:", response.status, errorData);
                return (false);
            }

            const data = await response.json();
            console.log("✅ Match amical créé dans la base de données:", data.matchId);
            console.log("📋 Détails du match créé:", data.match);
            console.log("📊 Statut du match créé:", data.match?.status || "N/A");

            // 🔧 Important : synchroniser l'ID utilisateur local avec celui utilisé côté backend
            // Le service game peut créer / réutiliser un utilisateur avec un ID différent de this.user.id
            // (via prisma.user.upsert). On récupère donc l'ID réel pour que les prochains appels (join)
            // envoient le même playerId que celui stocké dans la DB (match.player1Id).
            if (data.match && data.match.player1 && typeof data.match.player1.id === "number") {
                const oldUser = { ...this.user };
                this.user = {
                    login: data.match.player1.login || this.user.login,
                    id: data.match.player1.id,
                };
                console.log("🔄 Synchronisation de l'utilisateur créateur avec la DB du service game:", {
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
        console.log("🔍 joinFriendlyMatch appelé avec:", { idMatch, idOpp, loginOpp, user: this.user });
        if (!this.user) {
            console.error("❌ this.user est null dans joinFriendlyMatch");
            return (false);
        }
        if (this.user.id === undefined || this.user.id === null || this.user.id === 0) {
            console.warn("⚠️ this.user.id est invalide ou 0:", this.user.id, "- Continuons quand même pour déboguer");
            // On continue quand même pour voir ce qui se passe
        }
        
        // Appeler l'API pour rejoindre le match
        try {
            const response = await fetch(`https://localhost:8443/api/friendly/${idMatch}/join`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    player2_id: this.user.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Erreur lors de la jonction au match amical:", errorData);
                return (false);
            }

            const data = await response.json();
            console.log("✅ Match amical rejoint:", data.match);
            console.log("🌐 Match en ligne:", data.match?.isOnline || false);

            // 🔧 Synchroniser l'utilisateur local avec celui retourné par le service game
            // Cas 1: je suis le créateur (player1)
            if (data.match?.player1 && typeof data.match.player1.id === "number") {
                // Si mon ID actuel ne correspond pas à l'ID player1 de la DB, on le met à jour
                if (this.user.id !== data.match.player1.id && this.user.login !== data.match.player1.login) {
                    const oldUser = { ...this.user };
                    this.user = {
                        login: data.match.player1.login || this.user.login,
                        id: data.match.player1.id,
                    };
                    console.log("🔄 Synchronisation de l'utilisateur (créateur) avec la DB du service game dans joinFriendlyMatch:", {
                        oldUser,
                        newUser: this.user,
                    });
                }
            }
            // Cas 2: je suis le second joueur (player2)
            if (data.match?.player2 && typeof data.match.player2.id === "number") {
                // Si je ne corresponds ni à player1Id ni à player2Id avec mon ID actuel,
                // il y a de fortes chances que la DB ait créé un utilisateur de test (playerXXXX).
                // Dans ce cas, on se synchronise sur player2.
                const player1Id = data.match.player1Id;
                const player2Id = data.match.player2Id;
                if (this.user.id !== player1Id && this.user.id !== player2Id) {
                    const oldUser = { ...this.user };
                    this.user = {
                        login: data.match.player2.login || this.user.login,
                        id: data.match.player2.id,
                    };
                    console.log("🔄 Synchronisation de l'utilisateur (second joueur) avec la DB du service game dans joinFriendlyMatch:", {
                        oldUser,
                        newUser: this.user,
                    });
                }
            }

            const match = new MatchFriendlyOnline(idMatch, r, this.sceneManager);
            const isOnline = data.match?.isOnline || false;

            console.log("👥 Création des joueurs pour le match:", { 
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
            
            console.log("🔍 Détails du match pour déterminer l'ordre:", {
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
            
            // IMPORTANT: Utiliser strictement player1Id et player2Id de l'API pour déterminer qui est qui
            // Ne pas utiliser idOpp ou loginOpp car ils peuvent être incorrects
            // NOTE: 
            // - Pour les matchs EN LIGNE: player1 (créateur) → droite (p[1]), player2 → gauche (p[0]) - INVERSÉ
            // - Pour les matchs LOCAUX: player1 (créateur) → gauche (p[0]), player2 → droite (p[1]) - ORDRE NORMAL
            
            // Cas spécial : si player2Id === player1Id pour un match en ligne, c'est que le créateur a rejoint son propre match
            // Dans ce cas, si je ne suis pas le créateur, je dois être player2 (même si player2Id n'est pas encore mis à jour dans la réponse)
            if (isOnline && player2Id === player1Id && player1Id !== this.user.id) {
                // Le créateur a rejoint son propre match, mais je ne suis pas le créateur
                // Je dois être player2 (même si player2Id n'est pas encore mis à jour dans la réponse)
                console.log("🔄 Match en ligne: créateur a rejoint, je suis le second joueur (player2)");
                const opponentId = player1Id || idOpp;
                const opponentLogin = player1Login || loginOpp;
                // Match EN LIGNE: player2 → gauche (p[0])
                players = [
                    {alias: this.user.login, id: this.user.id, ready: false, me: true},  // p[0] = moi (équipe 1, gauche)
                    {alias: opponentLogin, id: opponentId, ready: false, me: false}   // p[1] = adversaire (équipe 2, droite)
                ];
                console.log("✅ Je suis player2 (second joueur, match EN LIGNE, équipe 1, gauche)", { 
                    players: players.map(p => ({ id: p.id, alias: p.alias, me: p.me, position: players.indexOf(p) === 0 ? "gauche" : "droite" }))
                });
            } else if (player1Id === this.user.id) {
                // Je suis player1 (créateur)
                // L'adversaire est player2 (doit être défini si le match est en cours)
                if (!player2Id) {
                    console.warn("⚠️ Je suis player1 mais player2Id n'est pas défini, utilisation de idOpp comme fallback");
                }
                const opponentId = player2Id || idOpp;
                const opponentLogin = player2Login || loginOpp;
                
                if (isOnline) {
                    // Match EN LIGNE: player1 → droite (p[1])
                    players = [
                        {alias: opponentLogin, id: opponentId, ready: false, me: false},                      // p[0] = adversaire (équipe 1, gauche)
                        {alias: player1Login || this.user.login, id: this.user.id, ready: false, me: true}   // p[1] = moi (équipe 2, droite)
                    ];
                    console.log("✅ Je suis player1 (créateur, match EN LIGNE, équipe 2, droite)", { 
                        players: players.map(p => ({ id: p.id, alias: p.alias, me: p.me, position: players.indexOf(p) === 0 ? "gauche" : "droite" }))
                    });
                } else {
                    // Match LOCAL: player1 → gauche (p[0])
                    players = [
                        {alias: player1Login || this.user.login, id: this.user.id, ready: false, me: true},  // p[0] = moi (équipe 1, gauche)
                        {alias: opponentLogin, id: opponentId, ready: false, me: false}                      // p[1] = adversaire (équipe 2, droite)
                    ];
                    console.log("✅ Je suis player1 (créateur, match LOCAL, équipe 1, gauche)", { 
                        players: players.map(p => ({ id: p.id, alias: p.alias, me: p.me, position: players.indexOf(p) === 0 ? "gauche" : "droite" }))
                    });
                }
            } else if (player2Id === this.user.id) {
                // Je suis player2 (second joueur)
                // L'adversaire est player1 (doit être défini)
                if (!player1Id) {
                    console.error("❌ Je suis player2 mais player1Id n'est pas défini!");
                }
                const opponentId = player1Id || idOpp;
                const opponentLogin = player1Login || loginOpp;
                
                if (isOnline) {
                    // Match EN LIGNE: player2 → gauche (p[0])
                    players = [
                        {alias: player2Login || this.user.login, id: this.user.id, ready: false, me: true},  // p[0] = moi (équipe 1, gauche)
                        {alias: opponentLogin, id: opponentId, ready: false, me: false}                      // p[1] = adversaire (équipe 2, droite)
                    ];
                    console.log("✅ Je suis player2 (second joueur, match EN LIGNE, équipe 1, gauche)", { 
                        players: players.map(p => ({ id: p.id, alias: p.alias, me: p.me, position: players.indexOf(p) === 0 ? "gauche" : "droite" }))
                    });
                } else {
                    // Match LOCAL: player2 → droite (p[1])
                    players = [
                        {alias: opponentLogin, id: opponentId, ready: false, me: false},                      // p[0] = adversaire (équipe 1, gauche)
                        {alias: player2Login || this.user.login, id: this.user.id, ready: false, me: true}   // p[1] = moi (équipe 2, droite)
                    ];
                    console.log("✅ Je suis player2 (second joueur, match LOCAL, équipe 2, droite)", { 
                        players: players.map(p => ({ id: p.id, alias: p.alias, me: p.me, position: players.indexOf(p) === 0 ? "gauche" : "droite" }))
                    });
                }
            } else if (player1Id && player2Id && player2Id !== player1Id) {
                // Les deux joueurs sont définis et différents, mais je ne suis ni l'un ni l'autre (cas étrange)
                // Cela ne devrait pas arriver, mais on utilise l'ordre par défaut
                console.error("❌ ERREUR: Je ne suis ni player1 ni player2!", {
                    player1Id,
                    player2Id,
                    myUserId: this.user.id
                });
                // Utiliser l'ordre par défaut basé sur les IDs reçus
                players = [
                    {alias: player1Login || loginOpp, id: player1Id, ready: false, me: false},  // p[0] = player1 (équipe 1, gauche)
                    {alias: player2Login || this.user.login, id: player2Id, ready: false, me: false}  // p[1] = player2 (équipe 2, droite)
                ];
                console.warn("⚠️ Cas étrange : je ne suis ni player1 ni player2, utilisation de l'ordre par défaut");
            } else {
                // Fallback : si player2Id n'est pas encore défini (match en attente)
                if (player1Id === this.user.id) {
                    // Je suis le créateur (player1)
                    if (isOnline) {
                        // Match EN LIGNE: player1 → droite (p[1])
                        players = [
                            {alias: loginOpp, id: idOpp, ready: false, me: false},                                  // p[0] = adversaire (équipe 1, gauche)
                            {alias: player1Login || this.user.login, id: this.user.id, ready: false, me: true}   // p[1] = moi (équipe 2, droite)
                        ];
                        console.log("✅ Je suis player1 (match en attente, EN LIGNE), équipe 2 (droite)", { 
                            players: players.map(p => ({ id: p.id, alias: p.alias, me: p.me, position: players.indexOf(p) === 0 ? "gauche" : "droite" }))
                        });
                    } else {
                        // Match LOCAL: player1 → gauche (p[0])
                        players = [
                            {alias: player1Login || this.user.login, id: this.user.id, ready: false, me: true},  // p[0] = moi (équipe 1, gauche)
                            {alias: loginOpp, id: idOpp, ready: false, me: false}                                  // p[1] = adversaire (équipe 2, droite)
                        ];
                        console.log("✅ Je suis player1 (match en attente, LOCAL), équipe 1 (gauche)", { 
                            players: players.map(p => ({ id: p.id, alias: p.alias, me: p.me, position: players.indexOf(p) === 0 ? "gauche" : "droite" }))
                        });
                    }
                } else {
                    // Sinon, je dois être player2 (même si pas encore défini dans la DB)
                    // Mais si player1Id n'est pas défini non plus, c'est un problème
                    if (!player1Id) {
                        console.error("❌ ERREUR: player1Id n'est pas défini et je ne suis pas player1!");
                    }
                    if (isOnline) {
                        // Match EN LIGNE: player2 → gauche (p[0])
                        players = [
                            {alias: this.user.login, id: this.user.id, ready: false, me: true},                  // p[0] = moi (équipe 1, gauche)
                            {alias: player1Login || loginOpp, id: player1Id || idOpp, ready: false, me: false}   // p[1] = adversaire (équipe 2, droite)
                        ];
                        console.log("✅ Je serai player2 (match en attente, EN LIGNE), équipe 1 (gauche)", { 
                            players: players.map(p => ({ id: p.id, alias: p.alias, me: p.me, position: players.indexOf(p) === 0 ? "gauche" : "droite" }))
                        });
                    } else {
                        // Match LOCAL: player2 → droite (p[1])
                        players = [
                            {alias: player1Login || loginOpp, id: player1Id || idOpp, ready: false, me: false},  // p[0] = adversaire (équipe 1, gauche)
                            {alias: this.user.login, id: this.user.id, ready: false, me: true}                    // p[1] = moi (équipe 2, droite)
                        ];
                        console.log("✅ Je serai player2 (match en attente, LOCAL), équipe 2 (droite)", { 
                            players: players.map(p => ({ id: p.id, alias: p.alias, me: p.me, position: players.indexOf(p) === 0 ? "gauche" : "droite" }))
                        });
                    }
                }
            }
            
            console.log("👥 Tableau players créé:", players.map(p => ({ id: p.id, alias: p.alias, me: p.me })));

            // 🔧 Normalisation des IDs pour le jeu en ligne :
            // On force des IDs "logiques" côté jeu:
            // - players[0].id = 1  → paddle gauche
            // - players[1].id = 2  → paddle droite
            // Ainsi, myPlayerId sera 1 ou 2 selon la position dans le tableau,
            // et sera différent sur les deux navigateurs.
            players = players.map((p, idx) => ({
                ...p,
                id: idx === 0 ? 1 : 2,
            }));
            console.log("👥 Players après normalisation des IDs (1=gauche, 2=droite):",
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

    async deleteFriendlyMatch(
        matchId: number
    ) : Promise<boolean>
    {
        if (!this.user) {
            console.error("❌ Impossible de supprimer un match amical: utilisateur non défini dans UserX");
            return (false);
        }
        
        console.log("🔄 Suppression du match amical:", matchId);
        
        try {
            const response = await fetch(`https://localhost:8443/api/friendly/${matchId}`, {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                },
                credentials: "include",
            });

            console.log("📡 Réponse reçue:", response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }
                console.error("❌ Erreur lors de la suppression du match amical:", response.status, errorData);
                return (false);
            }

            const data = await response.json();
            console.log("✅ Match amical supprimé:", data.message);
            
            return (true);
        } catch (error) {
            console.error("Erreur lors de l'appel API pour supprimer le match amical:", error);
            return (false);
        }
    }

    
    deleteFriend(
        f: Friend
    ) : void
    {
        this.friends.splice(this.friends.findIndex(
            (e) => e.getId === f.getId),
            1
        );
    }

    deleteTournament() : void
    {
        /*
            Si le tournoi créer des timestamp ou appels réseaux etc
            les arrêter avant de mettre à NULL
        */
        this.tournament = null;
    }

    get getMatch() : Match | null
    {
        return (this.match);
    }

    get getTournament() : Tournament | null
    {
        return (this.tournament);
    }

    get getFriends() : Friend[]
    {
        return (this.friends);
    }

    get getCurrentZone() : ZoneName | null
    {
        return (this.currentZone);
    }

    get getUser() : User | null
    {
        return (this.user);
    }

    set setCurrentZone(
        zone: ZoneName
    )
    {
        this.currentZone = zone;
    }

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

    set setUser(
        user: any
    )
    {
        // Adapter la structure de l'utilisateur du contexte React vers UserX
        // Le contexte React utilise 'username' mais UserX attend 'login'
        if (user && user.id !== undefined && user.id !== null && user.id > 0) {
            // Si l'utilisateur est authentifié et a un ID valide, l'utiliser
            this.user = {
                login: user.username || user.login || "authenticated_user",
                id: user.id
            };
            console.log("✅ Utilisateur authentifié défini dans UserX:", this.user);
            console.log("📋 Détails de l'utilisateur - ID:", this.user.id, "Login:", this.user.login, "ID source:", user.id);
        } else {
            // Si user est null ou non authentifié, garder l'ID existant s'il existe
            // Sinon, générer un ID unique pour l'utilisateur de test
            if (!this.user || this.user.id === 0) {
                const uniqueId = Math.floor(Math.random() * 1000000) + 1;
                this.user = { login: `test_user_${uniqueId}`, id: uniqueId };
                console.log("⚠️ Utilisateur non authentifié ou invalide reçu, création d'un utilisateur de test unique:", this.user);
            } else {
                // Conserver l'utilisateur existant pour maintenir la cohérence des IDs
                console.log("⚠️ Utilisateur non authentifié reçu, conservation de l'utilisateur existant:", this.user);
            }
        }
    }
    
    public get getUser() : User | null
    {
        return (this.user);
    }
}