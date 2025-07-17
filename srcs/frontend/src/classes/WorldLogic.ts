import GameManager from "./Game/GameManager.ts";
import GameLogic from "./Game/GameLogic.ts";

interface IRules
{
    scoreMax: number,
    ballSpeed: number,
    playerSpeed: number,
    countDownGoalTime: number,
    allowPause: boolean
}

export default class WorldLogic
{
    #gameManager: GameManager;

    constructor()
    {
        this.#gameManager = new GameManager();
    };

    createGame(rules: IRules) : boolean
    {
        try
        {
            this.#gameManager.createGame(rules);
        } catch (error: unknown)
        {
            if (error instanceof Error)
                console.log(error.message);
            else
                console.log("Erreur inconnue", error);
            return (false);
        }
        return (true);
    }

    get game() : GameLogic | null
    {
        return (this.#gameManager.game);
    }

    get gameManager() : GameManager
    {
        return (this.#gameManager);
    }
};