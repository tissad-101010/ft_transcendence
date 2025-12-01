import {
  Scene,
} from '@babylonjs/core';

import { SceneManager } from './scene/SceneManager.ts';
import { ZoneName } from "./config.ts";

import {
    TournamentParticipant,
    Tournament 
} from "./Tournament.ts";
import {
    Match,
    MatchRules
} from "./Match.ts";
import { MatchFriendlyOnline } from './Match/MatchFriendlyOnLine.ts';
import { Env } from './lockerRoom/scoreboardUI/menuCreate.ts';


import {
    FriendManager,
    FriendInvitationsI
} from './friends/FriendsManager.ts';
import { Friend } from './friends/Friend.ts';
import { FriendInvitation } from './friends/FriendInvitation.ts';
import { PromiseUpdateResponse, StatusInvitation } from './friends/api/friends.api.ts';


interface TwoFactorMethods
{
    type: string,
    enabled: boolean    
}

interface User
{
    login: string,
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

/*
    Classe permettant de gérer les actions de l'utilisateur, lieu où seront stockées les données
*/

export class UserX 
{
    // PROPS
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
    }


    /***********************************/
    /*              Friends            */
    /***********************************/


    async sendFriendInvite(
        username: string
    ) : Promise<{success: boolean, message?: string, data?: any}>
    {
        return (await this.friendManager.sendInvitation(username));
    }

    async deleteFriend(friend: Friend) : Promise<boolean>
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

    /***********************************/
    /*       Tournament / Matchs       */
    /***********************************/

    joinFriendlyMatch(
        r: MatchRules,
        idMatch: number,
        idOpp: number,
        loginOpp: string,
        env: Env
    ) : boolean
    {
        if (!this.user)
            return (false);
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
    }

    createFriendlyMatch(
        r: MatchRules
    ) : boolean
    {
        if (!this.user)
            return (false);
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

    createTournament(a: string) : boolean
    {
        if (this.user === null)
            return (false);
        const p : TournamentParticipant = {
            login: this.user.login,
            alias: a,
            ready: true,
            id: this.user.id,
            eliminate: false
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
    

    deleteTournament() : void
    {
        /*
            Si le tournoi créer des timestamp ou appels réseaux etc
            les arrêter avant de mettre à NULL
        */
        this.tournament = null;
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
        user: any
    )
    {
        this.user = user;
        this.friendManager.loadData();
        console.log("user vaut mtn", this.user);
    }
    clearUser() : void
    {
        this.user = null;
    }
}