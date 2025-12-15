import {
  Scene,
} from '@babylonjs/core';
import { Observer } from "@babylonjs/core/Misc/observable";
import Game3D from "./gameplay/Game3D.ts";
import GameLogic from "./gameplay/GameLogic.ts";
import { Tournament } from './Tournament.ts';
import { SceneManager } from './scene/SceneManager.ts';

// Import des types centralisés (type-only pour éviter les exports runtime)
import type {
    MatchParticipant,
    MatchRules,
    MatchTournament,
    MatchFriendly
} from './types.ts';

// Ré-exporter uniquement les types pour conserver la compatibilité
export type { MatchParticipant, MatchRules, MatchTournament, MatchFriendly } from './types.ts';

interface IGame
{
    interface: Game3D,
    logic: GameLogic
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
    private isFinishing: boolean = false;
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
                [this.matchInfo.sloatA, this.matchInfo.sloatB],
                0  // mode: 0 pour créer les joueurs (mode local)
            ),
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
                else if (this.game && this.game.logic.getState === 3 && !this.isFinishing)
                {
                    if (!this.matchInfo || !this.matchInfo.sloatA
                        || !this.matchInfo.sloatB)
                        return ;
                    
                    // Marquer que le match est en train de se terminer pour éviter les appels multiples
                    this.isFinishing = true;
                    
                    // Appeler la fonction async pour gérer la fin du match
                    this.handleMatchFinish(sceneManager).catch((error) => {
                        console.error("Erreur lors de la gestion de la fin du match:", error);
                        this.isFinishing = false; // Réinitialiser en cas d'erreur
                    });
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

    private async handleMatchFinish(sceneManager: SceneManager): Promise<void> {
        if (!this.game || !this.matchInfo || !this.matchInfo.sloatA || !this.matchInfo.sloatB)
            return;
        
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
        
        let isTournamentFinished = false;
        let isFriendlyMatch = false;
        
        if (this.matchInfo && this.matchInfo.type === "tournament" && this.matchInfo.tournament) {
            try {
                isTournamentFinished = await this.matchInfo.tournament.matchFinish(this);
            } catch (error) {
                console.error("Erreur lors de la fin du match:", error);
            }
        } else if (this.matchInfo && this.matchInfo.type === "friendly") {
            isFriendlyMatch = true;
            console.log("Match amical terminé");
        }
        
        window.removeEventListener("keydown", this.keyDownHandler);
        window.removeEventListener("keyup", this.keyUpHandler);
        sceneManager.getScene().onBeforeRenderObservable.remove(this.renderObserver);
        
        // Passer l'information à showWinner pour redirection (avant de mettre game à null)
        if (this.game && this.game.interface) {
            this.game.interface.showWinner(isTournamentFinished || isFriendlyMatch);
        }
        
        // Nettoyer le game après avoir appelé showWinner
        this.game = null;
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