import GameLogic from "./GameLogic.ts";
import Game3D from "./Game3D.ts";

import {
  Scene,
} from '@babylonjs/core';

interface IRules
{
    nbPlayers: number,
    scoreMax: number,
    ballSpeed: number,
    playerSpeed: number,
    countDownGoalTime: number,
    allowPause: boolean
}

interface IGame
{
    logic: GameLogic | null,
    interface: Game3D | null,
    ready: boolean
}

export default class GameManager
{
    #game: IGame | null;
    constructor()
    {
        this.#game = null;
    };

    createGame(rules: IRules, scene: Scene) : void
    { 
        if (this.#game)
            throw new Error("Une partie est deja en cours de creation ou lancee");
        this.#game = {
            logic: new GameLogic(rules),
            interface: new Game3D(scene),
            ready: false
        };
    };

    start() : void
    {
        if (!this.#game || !this.#game.logic)
            console.log("Aucune partie en cours de creation");
        else if (!this.#game.interface)
            console.log("Aucune interface graphique associee a la partie");
        else if (!this.#game.ready)
            console.log("La game n'est pas prete pour etre lancee");
        else
            this.#game.logic.start();
    };

    finishGame() : void
    {
        this.#game?.interface?.players.forEach((player) => {
            player.mesh.dispose();
        });
        this.#game = null;
    }

    updateGame(keys : Set<string>) : void
    {
        this.#game?.interface?.update(keys);
    }

    initGame() : void
    {
        if (!this.#game || !this.#game.interface || !this.#game.logic
            || this.#game.logic.players.length !== this.#game.logic.players.length)
            throw new Error("Il manque des infos pour initialiser la game");
        else
        {
            if (
                !this.#game.interface.initField(this.#game.logic) ||
                !this.#game.interface.initBall(this.#game.logic.ball)
            )
                throw new Error("Error dans initGame (1)");
            this.#game.logic.players.forEach((player, index) => {
                if (!this.#game?.interface?.initPlayer(player, index))
                    throw new Error("Error dans initGame (2)");
            });
        }
        this.#game.ready = true;
    };

    get gameLogic() : GameLogic | null
    {
        if (this.#game)
            return (this.#game.logic);
        else
            return (null);
    }

    get gameInterface() : Game3D | null
    {
        if (this.#game)
            return (this.#game.interface);
        else
            return (null);
    };

    get ready()
    {
        return (this.#game?.ready);
    }

    // get game() : GameLogic | null
    // {
    //     return (this.#logic);
    // }
};