import PlayerLogic from './PlayerLogic.ts';
import BallLogic from './BallLogic.ts';

import { MatchParticipant } from '../Match.ts';

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

interface IScore
{
    team1: number,
    team2: number
}

export default class GameLogic
{
    private players: PlayerLogic[];
    private ball: BallLogic;
    private state: number; // 0 : Pause | 1 : En cours | 2 : Engagement | 3 : termine
    private control: IControl;
    private countDownGoal: ICountDownGoal; // Utile pour le compteur de l'engagement
    private rules: IRules;
    private winner: number;
    private field: IField | null;
    private score: IScore;
    private scored: number;
    constructor(rules : IRules, p: MatchParticipant[], mode: number)
    {
        this.rules = rules;
        this.field = null;
        this.state = 0;
        this.control = {pause: "p"};
        this.ball = new BallLogic(this.rules.ballSpeed);    
        this.countDownGoal = {active: false, value: this.rules.countDownGoalTime, id: 0};
        if (mode === 0)
            // Mode local : deux joueurs sur le même clavier
            this.players = [new PlayerLogic(p[0], this.rules.playerSpeed, 1, 0),
                new PlayerLogic(p[1], this.rules.playerSpeed, 2, 0)];
        else if (mode === 1)
            // Mode remote : joueurs en ligne via websockets
            this.players = [new PlayerLogic(p[0], this.rules.playerSpeed, 1, 1),
                new PlayerLogic(p[1], this.rules.playerSpeed, 2, 1)];
        else
            this.players = [];
        this.winner = 0;
        this.score = {team1: 0, team2: 0};
        this.scored = 0;
    };

    start() : void
    {
        this.state = 1;
        this.startCountDown();
    }

    startCountDown() : void
    {
        this.state = 2;
        this.countDownGoal.id = setInterval(() => {
            this.countDownGoal.value--;
            if (this.countDownGoal.value === -1)
            {
                this.state = 1;
                this.countDownGoal.active = false;
                clearInterval(this.countDownGoal.id);
            }
        }, 1000);
    }

    // Methode appele lorsqu'un player marque un point
    goal(value : number) : void
    {
        if (value === 1)
        {
            this.score.team1 += 1;
            this.scored = 1;
        }
        else if (value === 2)
        {
            this.score.team2 += 1;
            this.scored = 2;
        }
    }

    hasWinner() : void
    {
        if (this.score.team1 >= this.rules.scoreMax)
            this.winner = 1;
        else if (this.score.team2 >= this.rules.scoreMax)
            this.winner = 2;
    };

    // Methode qui met a jour l'etat de la partie a chaque appel de window.requestAnimationFrame
    update(keys: Set<string>) : void
    {
        this.scored = 0;
        if (this.state !== 3)
        {
            this.handleKeys(keys);
            if (this.state === 1)
            {
                this.ball.move();
                let tmp = this.ball.goal;
                if (tmp !== 0)
                {
                    this.goal(tmp);
                    this.hasWinner();
                    if (this.winner !== 0)
                        this.state = 3;
                    else
                    {
                        this.ball.reset();
                        this.countDownGoal.value = this.rules.countDownGoalTime;
                        this.countDownGoal.active = true;
                        this.startCountDown();
                    }
                }
                this.players.forEach((player) => {
                    this.ball.hit(player);
                });
                this.ball.bounce();
            }
        }
    };

    // Methode qui gere les actions selon les touches appuyees
    handleKeys(keys: Set<string>) : void
    {
        if (keys.size === 0)
            return ;
        if (this.state >= 1 && this.state <= 2)
        {
            this.players.forEach((player) => {
                const up = player.up;
                const down = player.down
                if (up && keys.has(up))
                    player.update(-1);
                else if (down && keys.has(down))
                    player.update(1);
            });
            if (keys.has(this.control.pause) && this.rules.allowPause === true)
            {
                keys.delete(this.control.pause);
                if (this.countDownGoal.active === true)
                    clearInterval(this.countDownGoal.id);
                this.state = 0;
            }
        } else
        {
            if (keys.has(this.control.pause) && this.rules.allowPause === true)
            {
                keys.delete(this.control.pause);
                if (this.countDownGoal.active === true)
                    this.startCountDown();
                else
                    this.state = 1;
            }
        }
    };

    get getWinner()
    {
        return (this.winner)
    }

    get getState()
    {
        return (this.state);
    }

    get getPlayers() : PlayerLogic[]
    {
        return (this.players);
    };

    get getBall() : BallLogic
    {
        return (this.ball);
    }

    get getRules() : IRules
    {
        return (this.rules);
    }

    get getScored() : number
    {
        return (this.scored);
    }

    get getScore1() : number
    {
        return (this.score.team1);
    }

    get getScore2() : number
    {
        return (this.score.team2);
    }

    get getField() : IField | null
    {
        return (this.field);
    }

    get getTime() : number
    {
        return (this.countDownGoal.value);
    }

    /**
     * Synchronise l'état critique de la partie à partir d'un état reçu à distance.
     * Utilisé uniquement pour le mode en ligne afin de recaler les deux navigateurs.
     */
    syncStateFromRemote(data: {
        score1: number;
        score2: number;
        time: number;
        players: { id: number; posY: number }[];
    }): void
    {
        // Recalage du score
        this.score.team1 = data.score1;
        this.score.team2 = data.score2;

        // Recalage du timer d'engagement
        this.countDownGoal.value = data.time;

        // Mise à jour des positions verticales des joueurs
        data.players.forEach((remotePlayer) => {
            const localPlayer = this.players.find((p) => p.getId === remotePlayer.id);
            if (localPlayer) {
                localPlayer.setPosY = remotePlayer.posY;
            }
        });
    }

    set setField(field: IField)
    {
        this.field = field;
    }

};
