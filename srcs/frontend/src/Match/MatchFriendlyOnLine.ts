
import { MatchParticipant, MatchRules } from "../Match.ts";
import { SceneManager } from "../scene/SceneManager.ts";
import { MatchBase, MatchStatus } from "./MatchBase.ts";

import Game3D from "../gameplay/Game3D.ts";
import GameLogic from "../gameplay/GameLogic.ts";
/*
    Classe pour gerer un match amical en ligne (remote players)
    
    Etapes de fonctionnement :
     1. 
     2. Mettre en place l'environnement 3D (Lumieres, Mesh player, deplacement camera)
     3. Lancer le fonctionnement remote players
     4. S'assurer que les deux utilisateurs soient bien sur le terrain + env 3D bien construit
     5. Le match continue jusqu'a detection d'un vainqueur
     6. Enregistrer dans la BDD le resultat du match
     7. Detruire l'env 3D + eteindre lumiere + detruire ce qui permet le remote player
*/

export class MatchFriendlyOnline extends MatchBase
{
    constructor(id : number, rules : MatchRules, sceneManager: SceneManager)
    {
        super(id, rules, sceneManager);
    }

    init(players: MatchParticipant[]): boolean
    {
        if (players.length != 2)
            return (false);
        this.participants = players;

        this.game = {
            logic: new GameLogic(
                {
                    scoreMax: parseInt(this.rules.score),
                    ballSpeed: 0.3 * parseInt(this.rules.speed),
                    playerSpeed: 1.25 * parseInt(this.rules.speed),
                    countDownGoalTime: parseInt(this.rules.timeBefore),
                    allowPause: false
                },
                [this.participants[0], this.participants[1]],
                0
            ),
            interface: new Game3D(this.sceneManager)
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
            // allumage des lumieres
            if (this.sceneManager) {
                this.sceneManager.getLights().turnOffLights();
            } else {
                console.error("sceneManager is undefined");
            }
        }
        else
        {
            console.error("Le match ne peut pas etre lance");
            return (false);
        } 

        return (true);
    }

    play() : boolean
    {
        if (!this.game)
            return (false);

        /*
            Ajouter qqchose qui permet de verifier si les deux utilisateurs sont bien sur le terrain avec tout de charges
            pour que le match se lance vraiment en meme temps des deux cotes
        */

        this.game.logic.start();
        this.renderObserver = this.sceneManager.getScene().onBeforeRenderObservable.add(() => {
            if (this.game && this.game.logic.getState !== 3)
                this.game.interface.update(this.keys);
            else if (this.game && this.game.logic.getState === 3)
                this.onFinish();
        })
        return (true);
    }

    onFinish() : void
    {
        if (!this.game)
            return ;
        this.game.interface.getPlayers.forEach((p) => {
            p.mesh.dispose();
        });
        this.score[0] = this.game.logic.getScore1;
        this.score[1] = this.game.logic.getScore2;
        if (this.score[0] > this.score[1])
            this.winner = this.participants[0];
        else
            this.winner = this.participants[1];

        this.status = 2;
            
        console.log("Match amical terminé", this);

        window.removeEventListener("keydown", this.keyDownHandler);
        window.removeEventListener("keyup", this.keyUpHandler);
        this.sceneManager.getScene().onBeforeRenderObservable.remove(this.renderObserver);

        // Passer l'information à showWinner pour redirection vers le menu principal (avant de mettre game à null)
        if (this.game && this.game.interface) {
            this.game.interface.showWinner(true); // true = rediriger vers le menu principal
        }
        
        // Nettoyer le game après avoir appelé showWinner
        this.game = null;

        // ENREGISTRE LE SCORE DANS LA BDD
    }
};