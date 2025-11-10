import {
  Scene,
} from '@babylonjs/core';

import { ZoneName } from "./config";
import { TournamentParticipant, Tournament } from "./Tournament.ts";

import { Match } from "./Match.ts";

import { SceneManager } from './scene/SceneManager.ts';

import { Friend } from './Friend.ts';

interface User
{
    login: string,
    id: number
}

/*
    Classe permettant de gérer les actions de l'utilisateur, lieu où seront stockées les données
*/

export class UserX {
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
    private addFriend(login: string, id: number, online: boolean) : number
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

    private simuEnAttendantBDD()
    {
        this.addFriend("Lolo", 1, true);
        this.addFriend("Tissad", 2, false);
        this.addFriend("GlitchGuru", 3, true);
        this.addFriend("BlazeWolf", 4, false);
        this.addFriend("LunarLion", 5, true);
        this.addFriend("VortexViper", 6, true);
        this.addFriend("MegaMage", 7, true);
        this.addFriend("PixelPilot", 8, false);
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

    playTournamentMatch(t: Tournament, m: Match, sceneManager: SceneManager) : boolean
    {
        return (t.playMatch(m, this.user.id, sceneManager));
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

    set setCurrentZone(zone: ZoneName)
    {
        this.currentZone = zone;
    }

    set setTournament(tournament: Tournament)
    {
        this.tournament = tournament;
    }

    set setMatch(match: Match)
    {
        this.match = match;
    }
}