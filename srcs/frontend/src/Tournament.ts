import {
  Scene,
} from '@babylonjs/core';

import { Match, MatchRules, MatchTournament, MatchParticipant } from "./Match.ts"
import { shuffleArray } from "./utils.ts";

import { SceneManager } from './scene/SceneManager.ts';
import { displayPlayers } from './utils.ts';

export interface TournamentParticipant
{
    login: string,
    alias: string,
    ready: boolean,
    id: number
}

interface TournamentRules
{
    mode: number,
    match: MatchRules
}

export class Tournament
{
    private participants : TournamentParticipant[];
    private rules: TournamentRules;
    private matchs: Match[];
    private sceneManager : SceneManager;

    constructor(sceneManager : SceneManager)
    {
        this.participants = [];
        this.rules = {
            mode : -1,
            match : {
                speed : "",
                score : "",
                timeBefore : ""
            }
        }
        this.matchs = [];
        this.sceneManager = sceneManager;
    }

    playMatch(match: Match, id: number, sceneManager: SceneManager) : boolean
    {

        return (match.play(id, sceneManager));
    }

    matchFinish(match: Match) : void
    {
        if (match.getStatus !== 2 || !match.getWinner)
        {
            console.error("Le match n'est pas termine ou n'a pas de vainqueur");
            return ;
        }
        const nextMatchId = match.getTournamentInfo?.nextMatchId;
        const nextMatch = this.matchs.find((m) => m.getId === nextMatchId);
        if (nextMatch === undefined)
            {
                console.error("Match suivant pas trouve");
                return ;
            }
            if (match.getTournamentInfo?.nextMatchSlot === 0)
                nextMatch.setSloatA = match.getWinner;
            else
                nextMatch.setSloatB = match.getWinner;
        console.log("Le match est termine, etat de tournoi : ", this);
    }

    addRules(v: string, m: number) : void
    {
        switch (m)
        {
            case 0: 
                this.rules.match.speed = v;
                break;
            case 1:
                this.rules.match.score = v;
                break;
            case 2:
                this.rules.match.timeBefore = v;
        }
    }

    addParticipant(p: TournamentParticipant) : number
    {
        let stop = false;
        this.participants.forEach((a) => {
            if (a.login === p.login)
                stop = true;
        })
        if (stop)
            return (1);
        this.participants.push(p);
        return (0);
    }

    removeParticipant(p: TournamentParticipant) : void
    {
        const index = this.participants.indexOf(p);
        if (index > -1)
            this.participants.splice(index, 1);
        else
            console.log(p.login + " n'est pas present dans ce tournoi");
    }

    checkReady() : number
    {
        if (this.rules.match.speed !== "1" && this.rules.match.speed !== "2" &&
            this.rules.match.speed !== "3")
            return (1);
        if (this.rules.match.score === "")
            return (2);
        if (this.rules.match.timeBefore === "")
            return (3);
        if (this.participants.length < 4)
            return (4);
        if (this.participants.length % 2 !== 0)
            return (5);
        if ((this.participants.length & (this.participants.length - 1)) !== 0)
            return (7);
        let unready = 0;
        this.participants.forEach((p) => {
            if (p.ready === false)
                unready++;
        })
        if (unready !== 0)
            return (6);
        return (0);
    }

    createMatchs(p : TournamentParticipant[]) : void
    {
        const nbTour = Math.log(p.length) / Math.log(2); /* Nombre de tours du tournoi */
        let nbMatch = p.length / 2; // Nombre de mathc du tournoi
        let targetSlot = 0; // Position dans le match suivant
        let targetMatch : number | undefined = nbMatch; // Reference sur le match du prochain tour
        let indexP = 0;
        let indexM = 0;
        for (let i = 0; i < nbMatch; i++)
        {
            if (i % 2 === 0 && i !== 0)
                targetMatch += 1;
            const match = new Match(this.rules.match, "tournament", indexM, this.sceneManager);
            const settings : MatchTournament = {
                round: 1,
                sloatA: {
                    alias: p[indexP].alias,
                    id: p[indexP].id,
                    ready: true
                },
                sloatB: {
                    alias: p[indexP + 1].alias,
                    id: p[indexP + 1].id,
                    ready: true
                },
                nextMatchId: targetMatch,
                nextMatchSlot: targetSlot,
                status: 0,
                tournament: this
            }
            indexP += 2;
            indexM++;
            if (targetSlot === 1)
                targetSlot = 0;
            else
                targetSlot = 1;
            match.setTournamentInfo = settings;
            this.matchs.push(match);
        }
        for (let i = 2; i <= nbTour; i++)
        {
            let mem = indexM;
            nbMatch /= 2;
            targetSlot = 0;
            if (nbMatch === 1)
                targetMatch = undefined;
            for (let j = 0; j < nbMatch; j++)
            {
                if (targetMatch !== undefined && j % 2 === 0 && j !== mem)
                    targetMatch += 1;
                if (targetSlot === 1)
                    targetSlot = 0;
                else
                    targetSlot = 1;
                const match = new Match(this.rules.match, "tournament", indexM, this.sceneManager);
                const settings : MatchTournament = {
                    round: i,
                    sloatA: null,
                    sloatB: null,
                    nextMatchId: targetMatch,
                    nextMatchSlot: targetSlot,
                    status: 0,
                    tournament: this
                }
                indexM++;
                match.setTournamentInfo = settings;
                this.matchs.push(match);
            }
        }
    }

    start() : void
    {
        this.createMatchs(shuffleArray(this.participants));
        displayPlayers(this.sceneManager.getScene(), this.participants, this.sceneManager.getTshirt);
    }

    get getParticipants() : TournamentParticipant[]
    {
        return (this.participants);
    }

    get getRules() : MatchRules
    {
        return (this.rules.match);
    }

    get getMatchs() : Match[]
    {
        return (this.matchs);
    }
}