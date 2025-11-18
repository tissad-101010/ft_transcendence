import { MatchParticipant } from "../Match.ts"

interface IControl
{
    up: string,
    down: string
}

interface IField
{
    width: number,
    height: number
}

export default class PlayerLogic 
{
    private width: number;
    private team: number;
    private height: number;
    private posX: number;
    private posY: number;
    private id: number;
    private alias: string;
    private speed: number;
    private score: number;
    private color: string;
    private control: IControl | null;
    private field: IField | null;
    private type: number;
    /*
        type :
        0. Humain local
        1. Humain en ligne
        2. IA
    */
    constructor(player: MatchParticipant, speed: number, team: number, type: number)
    {
        this.id = player.id;
        this.height = 0;
        this.width = 0;
        this.color = "rgb(255,255,255)";
        this.field = null;
        this.posX = 0;
        this.posY = 0;
        this.score = 0;
        this.speed = speed;
        this.team = team;
        this.type = type;
        this.alias = player.alias;
        // Assigner les contrôles en fonction de l'équipe pour les matchs locaux
        // Team 1 (gauche) : touches Q et A
        // Team 2 (droite) : flèches haut/bas
        if (this.type === 0) {
            if (this.team === 1) {
                this.control = {up: "q", down: "a"};
            } else if (this.team === 2) {
                this.control = {up: "ArrowUp", down: "ArrowDown"};
            } else {
                this.control = null;
            }
        } else if (player.me) {
            // Pour les matchs en ligne, utiliser player.me si défini
            this.control = {up: "q", down: "a"};
        } else {
            this.control = null;
        }
    };

    get getTeam()
    {
        return (this.team);
    };

    get getPosX()
    {
        return (this.posX);
    }

    get getPosY()
    {
        return (this.posY);
    }

    get down()
    {
        if (this.control)
            return (this.control.down);
        return (null);
    }

    get up()
    {
        if (this.control)
            return (this.control.up);
        return (null);
    }

    get getAlias() : string
    {
        return (this.alias);
    }

    set setWidth(value: number)
    {
        this.width = value;
    }

    set setHeight(value: number)
    {
        this.height = value;
    }

    set setField(field: IField)
    {
        this.field = field;
    }


    // Methode qui met a jour la position de la barre du player
    update(dep: number) : void
    {
        if (!this.field)
            return ;

        const nextY = this.posY + dep * this.speed;
        const halfHeight = this.height / 2;

        if (nextY - halfHeight >= 0 - this.field.height / 2 && nextY + halfHeight <= this.field.height / 2)
            this.posY = nextY;
    };

    get getWidth() : number
    {
        return this.width;
    }

    get getHeight() : number
    {
        return this.height;
    }

    set setPosX(value: number)
    {
        this.posX = value;
    }

    set setPosY(value : number)
    {
        this.posY = value;
    }
};
