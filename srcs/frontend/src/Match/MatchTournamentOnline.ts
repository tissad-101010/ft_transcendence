import { MatchBase, MatchStatus } from "./MatchBase";
import { MatchTournament } from "../types.ts";

import { SceneManager } from "../scene/SceneManager.ts";

import Game3D from "../gameplay/Game3D.ts";
import GameLogic from "../gameplay/GameLogic.ts";

import { MatchRules } from "../Match.ts";

export class MatchTournamentOnline extends MatchBase {
    private matchInfo: MatchTournament;

    constructor(id: number, rules: MatchRules, sceneManager: SceneManager, matchInfo: MatchTournament) {
        super(id, rules, sceneManager);
        this.matchInfo = matchInfo;
    }

    init(): void {
        // Chargement réseau : récupérer état depuis le serveur
    }

    play(): boolean {
        if (!this.matchInfo.sloatA || !this.matchInfo.sloatB) {
            console.error("Les participants ne sont pas prêts");
            return false;
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
            interface: new Game3D(this.sceneManager)
        };

        if (!this.game.interface.initField(this.game.logic)) return false;
        if (!this.game.interface.initBall(this.game.logic.getBall)) return false;

        this.game.logic.getPlayers.forEach((player, index) => {
            this.game?.interface.initPlayer(player, index);
        });

        this.game.interface.initScoreBoard();
        this.game.interface.initTimeBefore();

        if (!this.gameReady()) {
            console.error("Le jeu n’est pas prêt");
            return false;
        }

        this.status = MatchStatus.ONGOING;
        this.game.logic.start();

        this.sceneManager.getScene().onBeforeRenderObservable.add(() => {
            if (this.game && this.game.logic.getState !== 3)
                this.game.interface.update(this.keys);
            else this.onFinish();
        });

        return true;
    }

    onFinish(): void {
        if (!this.game) return;
        this.score = [this.game.logic.getScore1, this.game.logic.getScore2];
        this.winner =
            this.score[0] > this.score[1]
                ? this.matchInfo.sloatA
                : this.matchInfo.sloatB;
        this.status = MatchStatus.FINISHED;
        this.game = null;
        this.matchInfo.tournament?.matchFinish(this);
    }
}
