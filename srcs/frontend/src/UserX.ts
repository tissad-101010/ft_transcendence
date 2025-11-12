import {
  Scene,
} from '@babylonjs/core';

import { ZoneName } from "./config.ts";
import { TournamentParticipant, Tournament } from "./Tournament.ts";

import { Match, MatchRules } from "./Match.ts";

import { SceneManager } from './scene/SceneManager.ts';

import { Friend } from './Friend.ts';
import { MatchFriendlyOnline } from './Match/MatchFriendlyOnLine.ts';

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
    private match: Match | null;
    private tournament: Tournament | null;
    private currentZone: ZoneName | null;

    private friends : Friend[];
    private sceneManager : SceneManager;
    private user: User;

    constructor(sceneManager : SceneManager)
    {
        this.match = null;
        this.tournament = null;
        this.currentZone = null;
        this.user = {login: "Nostag", id : 0}; // A changer avec la BDD suite a la connexion
        this.friends = [];
        this.sceneManager = sceneManager;
        this.simuEnAttendantBDD();
    }

    /* Juste garder le parametre login une fois le backend ajoute*/
    private addFriend(
        login: string,
        id: number,
        online: boolean
    ) : number
    {
        const test = this.friends.find((f) => f.getId === id || f.getLogin === login)
        if (test !== undefined)
        {
            console.log("Amis deja ajoute -> " + login);
            return (1);
        }
        this.friends.push(new Friend(id, login, online));
        return (0);
    }

    private simuEnAttendantBDD() : void
    {
        this.addFriend("Lolo", 1, true);
        this.addFriend("Tissad", 2, false);
        this.addFriend("GlitchGuru", 3, true);
        this.addFriend("BlazeWolf", 4, false);
        this.addFriend("LunarLion", 5, true);
        this.addFriend("VortexViper", 6, true);
        this.addFriend("MegaMage", 7, true);
        this.addFriend("PixelPilot", 8, true);
        this.addFriend("PixelPilot2", 9, true);
        this.addFriend("PixelPilot3", 10, true);
        this.addFriend("PixelPilot4", 11, true);
        this.addFriend("PixelPilot5", 12, true);
        this.addFriend("PixelPilot6", 13, true);
        this.addFriend("PixelPilot7", 14, true);
        this.addFriend("PixelPilot8", 15, true);
        this.addFriend("PixelPilot9", 16, true);
        this.addFriend("PixelPilot10", 17, true);
        this.addFriend("PixelPilot11", 18, true);
        this.addFriend("PixelPilot12", 19, true);
        this.addFriend("PixelPilot13", 20, true);
        this.addFriend("PixelPilot14", 21, true);
        this.addFriend("PixelPilot15", 22, true);
        this.addFriend("PixelPilot16", 23, true);
        this.addFriend("PixelPilot17", 24, true);
        this.addFriend("PixelPilot18", 25, true);
        this.addFriend("PixelPilot19", 26, true);
        this.addFriend("PixelPilot20", 27, true);
        this.addFriend("PixelPilot21", 28, true);
        this.addFriend("PixelPilot22", 29, true);
        this.addFriend("PixelPilot23", 30, true);
    }

    createTournament(a: string) : boolean
    {
        const p : TournamentParticipant = {
            login: this.user.login,
            alias: a,
            ready: true,
            id: this.user.id
        } 
        this.tournament = new Tournament(this.sceneManager);
        this.tournament.addParticipant(p);

        return (true);
    }

    playTournamentMatch(
        t: Tournament,
        m: Match,
        sceneManager: SceneManager
    ) : boolean
    {
        return (t.playMatch(m, this.user.id, sceneManager));
    }

    createFriendlyMatch(
        r: MatchRules
    ) : boolean
    {
        // Creer un nouveau match dans la bdd pour recuperer son ID, permet aussi de l'ajouter
        // dans une liste de matchs en attente d'un joueur (creer une colonne pour dans la BDD)
        /* var tmp en attendant bdd */ const idMatch = 2;
        const match = new MatchFriendlyOnline(idMatch, r, this.sceneManager);

        // Ecran d'attente d'un joueur


        // Recuperer les informations du joueur qui a rejoint
        const opp = {login: "test", id: 12};
        const players = [
            {alias: this.user.login, id: this.user.id, ready: false, me: true},
            {alias: opp.login, id: opp.id, ready: false, me: false}
        ];

        if (!match.init(players))
            return (false);

        return (true);
    }

    joinFriendlyMatch(
        r: MatchRules,
        idMatch: number,
        idOpp: number,
        loginOpp: string
    ) : boolean
    {
        
        
        const match = new MatchFriendlyOnline(idMatch, r, this.sceneManager);

        const players = [
            {alias: loginOpp, id: idOpp, ready: false, me: false},
            {alias: this.user.login, id: this.user.id, ready: false, me: true}
        ];

        if (!match.init(players))
            return (false);
        
        this.sceneManager.getSceneInteractor?.disableInteractions();
        this.sceneManager.moveCameraTo(ZoneName.FIELD, () => {
            this.sceneManager.setSpecificMesh(false);
            this.sceneManager.getSceneInteractor?.enableInteractionScene();
        });
        return (true);
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

    get getUser() : User
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
}