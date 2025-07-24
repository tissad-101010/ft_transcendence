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
    nbPlayers: number,
    scoreMax: number,
    ballSpeed: number,
    playerSpeed: number,
    countDownGoalTime: number,
    allowPause: boolean
};

interface IField
{
    width: number,
    height: number
};

export default class GameLogic
{
    #players: PlayerLogic[];
    #ball: BallLogic;
    #state: number; // 0 : Pause | 1 : En cours | 2 : Engagement | 3 : termine
    #control: IControl;
    #countDownGoal: ICountDownGoal; // Utile pour le compteur de l'engagement
    #rules: IRules;
    #winner: PlayerLogic | null;
    #field: IField | null;
    constructor(rules : IRules)
    {
        this.#rules = rules;
        this.#field = null;
        this.#state = 0;
        this.#control = {pause: "p"};
        this.#ball = new BallLogic(this.#rules.ballSpeed);
        this.#countDownGoal = {active: false, value: this.#rules.countDownGoalTime, id: 0};
        this.#players = [];
        this.#winner = null;
    };

    addPlayers(team: number) : void
    {
        if (this.#players.length < this.#rules.nbPlayers)
        {
            const player = new PlayerLogic(this.#players.length, this.#rules.ballSpeed, team);
            this.#players.push(player);
        }
        else
            console.log("Ajout du player impossible, deja le nombre necessaire");
    }

    get players() : PlayerLogic[]
    {
        return (this.#players);
    };

    get Ball() : BallLogic
    {
        return (this.#ball);
    }

    // startCountDown() : void
    // {
    //     this.#state = 2;
    //     this.#countDownGoal.id = setInterval(() => {
    //         this.#countDownGoal.value--;
    //         if (this.#countDownGoal.value === 0)
    //         {
    //             this.#state = 1;
    //             this.#countDownGoal.active = false;
    //             clearInterval(this.#countDownGoal.id);
    //         }
    //     }, 1000);
    // }

    // // Methode appele lorsqu'un player marque un point
    // goal(player : PlayerLogic) : void
    // {
    //     player.addScore();
    // }

    // hasWinner() : void
    // {
    //     if (this.#player1.score >= this.#rules.scoreMax)
    //         this.#winner = this.#player1;
    //     else if (this.#player2.score >= this.#rules.scoreMax)
    //         this.#winner = this.#player2;
    // };

    // // Methode qui met a jour l'etat de la partie a chaque appel de window.requestAnimationFrame
    // update(keys: Set<string>) : void
    // {
    //     if (this.#state !== 3)
    //     {
    //         this.handleKeys(keys);
    //         if (this.#state === 1)
    //         {
    //             this.#ball.move();
    //             let tmp = this.#ball.goal;
    //             if (tmp !== 0)
    //             {
    //                 if (tmp === 1)
    //                     this.goal(this.#player1);
    //                 else if (tmp === 2)
    //                     this.goal(this.#player2);
    //                 this.hasWinner();
    //                 if (this.#winner !== null)
    //                     this.#state = 3;
    //                 else
    //                 {
    //                     this.#ball.reset();
    //                     this.#countDownGoal.value = this.#rules.countDownGoalTime;
    //                     this.#countDownGoal.active = true;
    //                     this.startCountDown();
    //                 }
    //             }
    //             this.#ball.bounce();
    //             this.#ball.hit(this.#player1);
    //             this.#ball.hit(this.#player2);
    //         }
    //     }
    // };

    // setStartPosition() : void
    // {
    //     this.#ball.posX = this.#field.width / 2;
    //     this.#ball.posY = this.#field.height / 2;

    //     this.#player1.posX = 20;
    //     this.#player1.posY = this.#field.height / 2;
    
    //     this.#player2.posX = this.#field.width - 20;
    //     this.#player2.posY = this.#field.height / 2;
    // };


    // // Methode qui gere les actions selon les touches appuyees
    // handleKeys(keys: Set<string>) : void
    // {
    //     if (keys.size === 0)
    //         return ;
    //     if (this.#state >= 1 && this.#state <= 2)
    //     {
    //         if (keys.has(this.#player2.down))
    //             this.#player2.update(-1);
    //         else if (keys.has(this.#player2.up))
    //             this.#player2.update(1);
    
    //         if (keys.has(this.#player1.down))
    //             this.#player1.update(-1);
    //         else if (keys.has(this.#player1.up))
    //             this.#player1.update(1);

    //         if (keys.has(this.#control.pause) && this.#rules.allowPause === true)
    //         {
    //             keys.delete(this.#control.pause);
    //             if (this.#countDownGoal.active === true)
    //                 clearInterval(this.#countDownGoal.id);
    //             this.#state = 0;
    //         }
    //     } else
    //     {
    //         if (keys.has(this.#control.pause) && this.#rules.allowPause === true)
    //         {
    //             keys.delete(this.#control.pause);
    //             if (this.#countDownGoal.active === true)
    //                 this.startCountDown();
    //             else
    //                 this.#state = 1;
    //         }
    //     }
    // };

    // start() : void
    // {
    //     this.#state = 1;
    // }

    // get player1() : PlayerLogic
    // {
    //     return (this.#player1);
    // }

    // get player2() : PlayerLogic
    // {
    //     return (this.#player2)
    // }

    // get ball() : BallLogic
    // {
    //     return (this.#ball);
    // }

    // get width() : number
    // {
    //     return this.#field.width;
    // }

    // get height(): number
    // {
    //     return this.#field.height;
    // }

    // get state() : number
    // {
    //     return this.#state;
    // }

    // set state(val: number)
    // {
    //     this.#state = val;
    // }

    // set field(size : IField)
    // {
    //     this.#field = {width: size.width, height: size.height};
    // };

};
