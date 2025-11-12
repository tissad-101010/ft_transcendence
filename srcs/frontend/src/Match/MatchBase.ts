import { Scene } from "@babylonjs/core";
import { Observer } from "@babylonjs/core/Misc/observable";

import { SceneManager } from "../scene/SceneManager.ts";

import { 
    MatchParticipant,
    MatchRules 
} from "../types.ts";

import Game3D from "../gameplay/Game3D.ts";
import GameLogic from "../gameplay/GameLogic.ts";
import { Participant } from "../lockerRoom/utils.js";

export enum MatchStatus {
    PENDING,
    ONGOING,
    FINISHED
}

export interface IGame {
    interface: Game3D;
    logic: GameLogic;
}

export abstract class MatchBase {
    protected id: number;
    protected rules: MatchRules;
    protected sceneManager: SceneManager;
    protected winner: MatchParticipant | null = null;
    protected score: number[] = [0, 0];
    protected status: MatchStatus = MatchStatus.PENDING;
    protected renderObserver: Observer<Scene> | null = null;
    protected participants: MatchParticipant[] = [];
    protected keys: Set<string> = new Set<string>();
    protected game: IGame | null = null;

    constructor(id: number, rules: MatchRules, sceneManager: SceneManager) {
        this.id = id;
        this.rules = rules;
        this.sceneManager = sceneManager;
    }

    protected keyDownHandler(e: KeyboardEvent): void {
        this.keys.add(e.key);
    }

    protected keyUpHandler(e: KeyboardEvent): void {
        this.keys.delete(e.key);
    }

    protected gameReady(): boolean {
        return !!(this.game && this.game.logic && this.game.interface);
    }

    abstract init(players: MatchParticipant[]): boolean;
    abstract play(): boolean;
    abstract onFinish(): void;

    get getScore(): number[] {
        return (this.score);
    }

    get getWinner(): MatchParticipant | null {
        return (this.winner);
    }

    get getStatus(): MatchStatus {
        return (this.status);
    }

    get getParticipants() : MatchParticipant[]
    {
        return (this.participants);
    }
}
