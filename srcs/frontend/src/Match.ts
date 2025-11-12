import {
  Scene,
} from '@babylonjs/core';
import { Observer } from "@babylonjs/core/Misc/observable";
import Game3D from "./gameplay/Game3D.ts";
import GameLogic from "./gameplay/GameLogic.ts";
import { Tournament } from './Tournament.ts';
import { SceneManager } from './scene/SceneManager.ts';


export interface MatchParticipant
{
    alias: string;
    id: number;
    ready: boolean;
    me: boolean;
}

export interface MatchRules
{
    speed: string,
    timeBefore: string,
    score: string
}

interface IGame
{
    interface: Game3D,
    logic: GameLogic
}

/*
    Status : 0 (en attente) 1 (en cours) 2(termine)
*/
export interface MatchTournament
{
    sloatA: MatchParticipant | null;
    sloatB: MatchParticipant | null;
    round: number | undefined;
    nextMatchId: number | undefined;
    nextMatchSlot: number | undefined;
    tournament: Tournament | undefined;
    type: "tournament";
}

export interface MatchFriendly
{
    sloatA: MatchParticipant | null;
    sloatB: MatchParticipant | null;
    type: "friendly";
}

enum MatchStatus
{
    PENDING,
    ONGOING,
    FINISHED
}

export class Match
{
    // private lightInteractor : LightInteractor;
    private sceneManager : SceneManager;
    private id: number;
    private mode: string;
    private matchInfo: MatchTournament | MatchFriendly | null;
    private winner: MatchParticipant | null;
    private score : number[];
    private rules: MatchRules;
    private game: IGame | null;
    private renderObserver: Observer<Scene> | null;
    private keys: Set<string>;
    private scene: Scene;
    private status: MatchStatus;
    constructor(r: MatchRules, m: string, id: number, sceneManager : SceneManager)
    {
        this.sceneManager = sceneManager;
        this.id = id;
        this.mode = m;
        this.rules = r;
        if (this.mode = "tournament")
        {
            this.matchInfo = {
                round: undefined,
                sloatA: null,
                sloatB: null,
                nextMatchId: undefined,
                nextMatchSlot: undefined,
                tournament: undefined,
                type: "tournament"
            }
        } else
            this.matchInfo = {
                sloatA: null,
                sloatB: null,
                type: "friendly"
            };
        this.winner = null;
        this.score = [0,0];
        this.game = null;
        this.renderObserver = null;
        this.status = MatchStatus.PENDING;
        this.keys = new Set<string>();
    }

    keyDownHandler(e: KeyboardEvent): void
    {
        this.keys.add(e.key);
    }

    keyUpHandler(e: KeyboardEvent): void
    {
        this.keys.delete(e.key);
    }

    /* Fonction qui vérifie si une partie est prête à être lancée */
    gameReady() : boolean
    {
        if (!this.game || !this.game.logic || !this.game.interface)
            return (false);
        return (true);
    }

    play(id: number, sceneManager: SceneManager) : boolean
    {
        if (!this.matchInfo || !this.matchInfo.sloatA || !this.matchInfo.sloatB
            || !this.matchInfo.sloatA.ready 
            || !this.matchInfo.sloatB.ready)
        {
            console.error("Le match ne peut pas être lancé");
            return (false);
        }
        this.game = {
            logic: new GameLogic(
                {
                    scoreMax: parseInt(this.rules.score),
                    ballSpeed: 0.3 * parseInt(this.rules.speed),
                    playerSpeed: 1.25 * parseInt(this.rules.speed),
                    countDownGoalTime: parseInt(this.rules.timeBefore),
                    allowPause: false
                },
                [this.matchInfo.sloatA, this.matchInfo.sloatB]),
            interface: new Game3D(sceneManager)
        };

        if (!this.game.interface.initField(this.game.logic))
        {
            console.error("initField a echouée");
            return (false);
        }
        else if (!this.game.interface.initBall(this.game.logic.getBall))
        {
            console.error("initBall a échouée");
            return (false);
        }
        else 
        {
            this.game.logic.getPlayers.forEach((player, index) => {
                if (!this.game?.interface.initPlayer(player, index))
                {
                    console.error("iniPlayer a échouée " + index);
                    return (false);
                }
            });
        }
        this.game.interface.initScoreBoard();
        this.game.interface.initTimeBefore();

        if (this.gameReady())
        {
            this.keyDownHandler = this.keyDownHandler.bind(this);
            this.keyUpHandler = this.keyUpHandler.bind(this);
            window.addEventListener("keydown", this.keyDownHandler);
            window.addEventListener("keyup", this.keyUpHandler);
            // Lancement de la partie + allumage des lumieres
            if (this.sceneManager) {
                this.sceneManager.getLights().turnOffLights();
            } else {
                console.error("sceneManager is undefined");
            }

            this.game.logic.start();
            this.renderObserver = sceneManager.getScene().onBeforeRenderObservable.add(() => {
                if (this.game && this.game.logic.getState !== 3)
                    this.game.interface.update(this.keys);
                else if (this.game && this.game.logic.getState === 3)
                {
                    if (!this.matchInfo || !this.matchInfo.sloatA
                        || !this.matchInfo.sloatB)
                        return ;
                    this.game.interface.getPlayers.forEach((p) => {
                        p.mesh.dispose();
                    });
                    this.score[0] = this.game.logic.getScore1;
                    this.score[1] = this.game.logic.getScore2;
                    if (this.score[0] > this.score[1])
                        this.winner = this.matchInfo.sloatA;
                    else
                        this.winner = this.matchInfo.sloatB;
                    this.status = 2;
                    this.game = null;
                    if (this.matchInfo && this.matchInfo.type === "tournament" && this.matchInfo.tournament)
                        this.matchInfo.tournament.matchFinish(this);
                    else if (this.matchInfo && this.matchInfo.type === "friendly")
                        console.log("Pas encore gere");
                    window.removeEventListener("keydown", this.keyDownHandler);
                    window.removeEventListener("keyup", this.keyUpHandler);
                    sceneManager.getScene().onBeforeRenderObservable.remove(this.renderObserver);
                    return (true);
                }
            })
        }
        else
        {
            console.error("Le match ne peut pas etre lance");
            return (false);
        } 
        return (true);
    }

    public set setMatchInfo(i: MatchTournament | MatchFriendly)
    {
        this.matchInfo = i;
    }

    get getSloatA() : MatchParticipant | null
    {
        if (!this.matchInfo)
            return (null);
        return (this.matchInfo.sloatA);
    }

    get getSloatB() : MatchParticipant | null
    {
        if (!this.matchInfo)
            return (null);
        return (this.matchInfo.sloatB);
    }

    get getStatus() : number | undefined
    {
        return (this.status);
    }

    get getMatchInfo() : MatchTournament | MatchFriendly | null
    {
        return (this.matchInfo);
    }

    get getId() : number
    {
        return (this.id);
    }

    get getScore() : number[]
    {
        return (this.score);
    }

    get getWinner() : MatchParticipant | null
    {
        return (this.winner);
    }

    set setRules(r: MatchRules)
    {
        this.rules = r;
    }

    set setSloatA(p: MatchParticipant)
    {
        if(this.matchInfo)
            this.matchInfo.sloatA = p;
    }

    set setSloatB(p: MatchParticipant)
    {
        if(this.matchInfo)
            this.matchInfo.sloatB = p;
    }
}