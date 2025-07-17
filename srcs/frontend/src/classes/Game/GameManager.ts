import GameLogic from "./GameLogic.ts";

interface IRules
{
    scoreMax: number,
    ballSpeed: number,
    playerSpeed: number,
    countDownGoalTime: number,
    allowPause: boolean
}

export default class GameManager
{
    #game: GameLogic | null;

    constructor()
    {
        this.#game = null;
    };

    createGame(rules: IRules) : void
    {
        if (this.#game)
            throw new Error("Partie deja en cours");
        this.#game = new GameLogic(rules);
    }

    start() : void
    {
        if (!this.#game)
            console.log("Game pas prete");
        else
        {
            this.#game.start();
        }
    }

    get game() : GameLogic | null
    {
        return (this.#game);
    }
};