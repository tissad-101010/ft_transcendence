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
        // Initialiser un utilisateur de test par défaut
        // Cet utilisateur sera remplacé par l'utilisateur réel du contexte React
        // si l'utilisateur est connecté via BabylonScene.tsx
        this.user = { login: "test", id: 1 };
        console.log("🔧 UserX initialisé avec utilisateur de test:", this.user);
        
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
        r: MatchRules
    ) : Promise<boolean>
    {
        if (!this.user) {
            console.error("❌ Impossible de créer un match amical: utilisateur non défini dans UserX");
            return (false);
        }
        
        console.log("🔄 Création d'un match amical avec l'utilisateur:", this.user);
        console.log("📋 Règles du match:", r);
        
        // Créer le match dans la base de données
        try {
            const requestBody = {
                speed: r.speed || "1",
                scoreMax: r.score || "5",
                timeBefore: r.timeBefore || "3",
                player1_id: this.user.id,
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
        if (!this.user)
            return (false);
        
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

            const match = new MatchFriendlyOnline(idMatch, r, this.sceneManager);

            const players = [
                {alias: loginOpp, id: idOpp, ready: false, me: false},
                {alias: this.user.login, id: this.user.id, ready: false, me: true}
            ];

            if (!match.init(players))
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
        if (user) {
            this.user = {
                login: user.username || user.login || "Unknown",
                id: user.id || 0
            };
            console.log("✅ Utilisateur défini dans UserX:", this.user);
            console.log("📋 Détails de l'utilisateur - ID:", this.user.id, "Login:", this.user.login);
        } else {
            this.user = null;
            console.log("⚠️ Utilisateur défini à null dans UserX");
        }
    }
    
    public get getUser() : User | null
    {
        return (this.user);
    }
}