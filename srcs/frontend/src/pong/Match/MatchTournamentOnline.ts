import { MatchBase, MatchStatus } from "./MatchBase";
import { MatchTournament, MatchRules, MatchParticipant } from "../../types.ts";

import { SceneManager } from "../../scene/SceneManager.ts";

import Game3D from "../gameplay/Game3D.ts";
import GameLogic from "../gameplay/GameLogic.ts";

export class MatchTournamentOnline extends MatchBase {
    private matchInfo: MatchTournament;
    
    // ID utilisateur courant (du système d'auth)
    private myUserId: number | null = null;

    constructor(id: number, rules: MatchRules, sceneManager: SceneManager, matchInfo: MatchTournament) {
        super(id, rules, sceneManager);
        this.matchInfo = matchInfo;
        console.log("DEIJIFJEIFJEJFE");
        // Récupérer l'ID utilisateur depuis le système d'auth (currentUser hérité de MatchBase)
        this.myUserId = this.currentUser?.id || null;
    }

    init(players?: MatchParticipant[]): boolean {
        // Si des joueurs sont fournis, les utiliser
        if (players && players.length === 2) {
            this.matchInfo.sloatA = players[0];
            this.matchInfo.sloatB = players[1];
        }
        return true;
    }

    play(): boolean {
        if (!this.matchInfo.sloatA || !this.matchInfo.sloatB) {
            console.error("Les participants ne sont pas prêts");
            return false;
        }

        // Déterminer quel joueur est l'utilisateur courant
        const isUserSloatA = this.matchInfo.sloatA.id === this.myUserId;
        const isUserSloatB = this.matchInfo.sloatB.id === this.myUserId;
        
        // Créer les participants de jeu avec les positions (1 = gauche, 2 = droite)
        const gameParticipantA = {
            ...this.matchInfo.sloatA,
            id: 1,  // Position de jeu gauche
            me: isUserSloatA
        };
        const gameParticipantB = {
            ...this.matchInfo.sloatB,
            id: 2,  // Position de jeu droite
            me: isUserSloatB
        };

        this.game = {
            logic: new GameLogic(
                {
                    scoreMax: parseInt(this.rules.score),
                    ballSpeed: 0.3 * parseInt(this.rules.speed),
                    playerSpeed: 1.25 * parseInt(this.rules.speed),
                    countDownGoalTime: parseInt(this.rules.timeBefore),
                    allowPause: false
                },
                [gameParticipantA, gameParticipantB],
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

        if (!this.gameReady())
            return false;

        // Ajouter les event listeners pour les touches
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        window.addEventListener("keydown", this.keyDownHandler);
        window.addEventListener("keyup", this.keyUpHandler);

        // Allumage des lumières
        if (this.sceneManager) {
            this.sceneManager.getLights().turnOffLights();
        }

        this.status = MatchStatus.ONGOING;
        this.game.logic.start();

        this.renderObserver = this.sceneManager.getScene().onBeforeRenderObservable.add(() => {
            if (this.game && this.game.logic.getState !== 3)
                this.game.interface.update(this.keys);
            else this.onFinish();
        });

        return true;
    }

    onFinish(): void {
        if (!this.game) return;
        
        this.game.interface.getPlayers.forEach((p) => {
            p.mesh.dispose();
        });
        
        this.score = [this.game.logic.getScore1, this.game.logic.getScore2];
        this.winner =
            this.score[0] > this.score[1]
                ? this.matchInfo.sloatA
                : this.matchInfo.sloatB;
        this.status = MatchStatus.FINISHED;
        
        console.log("Match de tournoi terminé:", {
            myUserId: this.myUserId,
            score: this.score,
            winner: this.winner
        });
        
        // Nettoyer les event listeners
        window.removeEventListener("keydown", this.keyDownHandler);
        window.removeEventListener("keyup", this.keyUpHandler);
        this.sceneManager.getScene().onBeforeRenderObservable.remove(this.renderObserver);
        
        // Afficher le gagnant
        if (this.game && this.game.interface) {
            const isTournamentFinished = this.matchInfo.tournament?.matchFinish(this) || false;
            this.game.interface.showWinner(isTournamentFinished);
        }
        
        this.game = null;
    }
}
