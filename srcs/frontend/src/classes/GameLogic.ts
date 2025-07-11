import PlayerLogic from './PlayerLogic.ts';
import BallLogic from './BallLogic.ts';

interface IControl
{
    pause: string
};

interface ICountDownGoal
{
    active: boolean,
    value: number,
    id: number
};


interface IRules
{
    scoreMax: number,
    timeLimit: number,
    ballSpeed: number,
    playerSpeed: number,
    countDownGoalTime: number,
    allowPause: boolean
}

interface IField
{
    width: number,
    height: number
}

export default class GameLogic
{
    #player1: PlayerLogic;
    #player2: PlayerLogic;
    #ball: BallLogic;
    #ctx: CanvasRenderingContext2D;
    #canvas: HTMLCanvasElement;
    #state: number; // 0 : Pause | 1 : En cours | 2 : Engagement | 3 : termine
    #control: IControl;
    #countDownGoal: ICountDownGoal; // Utile pour le compteur de l'engagement
    #rules: IRules;
    #winner: PlayerLogic | null;
    #field: IField;
    constructor(rules : IRules)
    {
        this.#rules = rules;
        this.#canvas = document.getElementById("bkgdPong") as HTMLCanvasElement;
        if (this.#canvas.getContext)
            this.#ctx = this.#canvas.getContext("2d") as CanvasRenderingContext2D;
        else
            throw new Error("canvas not compatible");
        this.#field = {width: 250, height: 125};
        this.#player1 = new PlayerLogic(1, "rgb(255, 255, 255)", this.#rules.playerSpeed, this.#field);
        this.#player2 = new PlayerLogic(2, "rgb(255, 255, 255)", this.#rules.playerSpeed, this.#field);
        this.#ball = new BallLogic("rgb(255, 255, 255)", this.#rules.ballSpeed, this.#field);
        this.#state = 0;
        this.#control = {pause: "p"};
        this.#countDownGoal = {active: false, value: this.#rules.countDownGoalTime, id: 0};
        this.#winner = null;
    };

    // // Methode de rendu pour le compteur lors de l'engagement
    // renderCountDown() : void
    // {
    //     this.#ctx.font = "50px Arial";
    //     this.#ctx.fillStyle = "rgb(75, 75, 75)";
    //     if (this.#countDownGoal.value !== 0)
    //         this.#ctx.fillText(`${this.#countDownGoal.value}`, this.#canvas.width / 2, this.#canvas.height / 2);
    // }

    // Methode de rendu graphique pour le canvas
    // render() : void
    // {
    //     this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    //     this.#ctx.fillStyle = "rgb(0, 0, 0)";
    //     this.#ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

    //     if (this.#countDownGoal.active === true)
    //         this.renderCountDown();

    //     if (this.#state === 0)
    //     {
    //         this.#ctx.fillStyle = "rgb(255, 255, 255)";
    //         this.#ctx.font = "30px Arial";
    //         let text = "Jeu en pause !"
    //         this.#ctx.fillText("Jeu en pause !", this.#canvas.width / 2 - this.#ctx.measureText(text).width / 2, 50);
    //     }

    //     if (this.#state !== 3)
    //         this.#ball.render(this.#ctx);
    //     else
    //     {
    //         this.#ctx.fillStyle = "rgb(255, 255, 255)";
    //         this.#ctx.font = "30px Arial";
    //         let text = "undefinied";
    //         if (this.#winner)
    //             text = `Player ${this.#winner.id} wins!`;
    //         this.#ctx.fillText(text, this.#canvas.width / 2 - this.#ctx.measureText(text).width / 2, this.#canvas.height / 2);
    //     }
        
    //     this.#player1.render();
    //     this.#player2.render();
        
    //     this.#ctx.font = "30px Arial";
    //     this.#ctx.fillText(`${this.#player1.score}`, this.#canvas.width / 2 - this.#canvas.width / 4, this.#canvas.height / 2);
    //     this.#ctx.fillText(`${this.#player2.score}`, this.#canvas.width / 2 + this.#canvas.width / 4, this.#canvas.height / 2);
    // };

    startCountDown() : void
    {
        this.#state = 2;
        this.#countDownGoal.id = setInterval(() => {
            this.#countDownGoal.value--;
            if (this.#countDownGoal.value === 0)
            {
                this.#state = 1;
                this.#countDownGoal.active = false;
                clearInterval(this.#countDownGoal.id);
            }
        }, 1000);
    }

    // Methode appele lorsqu'un player marque un point
    goal(player : PlayerLogic) : void
    {
        player.addScore();
    }

    hasWinner() : void
    {
        if (this.#player1.score >= this.#rules.scoreMax)
            this.#winner = this.#player1;
        else if (this.#player2.score >= this.#rules.scoreMax)
            this.#winner = this.#player2;
    };

    // Methode qui met a jour l'etat de la partie a chaque appel de window.requestAnimationFrame
    update(keys: Set<string>) : void
    {
        if (this.#state !== 3)
        {
            this.handleKeys(keys);
            if (this.#state === 1)
            {
                this.#ball.move();
                let tmp = this.#ball.goal;
                if (tmp !== 0)
                {
                    if (tmp === 1)
                        this.goal(this.#player1);
                    else if (tmp === 2)
                        this.goal(this.#player2);
                    this.hasWinner();
                    if (this.#winner !== null)
                        this.#state = 3;
                    else
                    {
                        this.#ball.reset();
                        this.#countDownGoal.value = this.#rules.countDownGoalTime;
                        this.#countDownGoal.active = true;
                        this.startCountDown();
                    }
                }
                this.#ball.bounce();
                this.#ball.hit(this.#player1);
                this.#ball.hit(this.#player2);
            }
        }
    };

    setStartPosition() : void
    {
        this.#ball.posX = this.#field.width / 2;
        this.#ball.posY = this.#field.height / 2;

        this.#player1.posX = 20;
        this.#player1.posY = this.#field.height / 2;
    
        this.#player2.posX = this.#field.width - 20;
        this.#player2.posY = this.#field.height / 2;
    };


    // Methode qui gere les actions selon les touches appuyees
    handleKeys(keys: Set<string>) : void
    {
        if (this.#state >= 1 && this.#state <= 2)
        {
            if (keys.has(this.#player2.down))
                this.#player2.update(1);
            else if (keys.has(this.#player2.up))
                this.#player2.update(-1);
    
            if (keys.has(this.#player1.down))
                this.#player1.update(1);
            else if (keys.has(this.#player1.up))
                this.#player1.update(-1);

            if (keys.has(this.#control.pause) && this.#rules.allowPause === true)
            {
                keys.delete(this.#control.pause);
                if (this.#countDownGoal.active === true)
                    clearInterval(this.#countDownGoal.id);
                this.#state = 0;
            }
        } else
        {
            if (keys.has(this.#control.pause) && this.#rules.allowPause === true)
            {
                keys.delete(this.#control.pause);
                if (this.#countDownGoal.active === true)
                    this.startCountDown();
                else
                    this.#state = 1;
            }
        }
    };

    get player1() : PlayerLogic
    {
        return (this.#player1);
    }

    get player2() : PlayerLogic
    {
        return (this.#player2)
    }

    get ball() : BallLogic
    {
        return (this.#ball);
    }

    get width() : number
    {
        return this.#field.width;
    }

    get height(): number
    {
        return this.#field.height;
    }

    set state(val: number)
    {
        this.#state = val;
    }

    set field(size : IField)
    {
        this.#field = {width: size.width, height: size.height};
    };

};

// export function pong(): void
// {
//     try {
//         let rules = {
//                 scoreMax: 3,
//                 timeLimit: 5,
//                 ballSpeed: 8,
//                 playerSpeed: 10,
//                 allowPause: true,
//                 countDownGoalTime: 3
//             };
//     } catch (err : unknown)
//     {
//         if (err instanceof Error)
//             console.error("Error : ", err.message);
//         else
//             console.error("Error : unknown");
//     }
// }




