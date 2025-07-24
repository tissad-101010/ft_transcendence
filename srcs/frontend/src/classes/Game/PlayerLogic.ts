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
    #width: number;
    #team: number;
    #height: number;
    #posX: number;
    #posY: number;
    #id: number;
    #speed: number;
    #score: number;
    #color: string;
    #control: IControl | null;
    #field: IField | null;
    constructor(id: number, speed: number, team: number)
    {
        this.#id = id;
        this.#height = 0;
        this.#width = 0;
        this.#color = "rgb(255,255,255)";
        this.#field = null;
        this.#posX = 0;
        this.#posY = 0;
        this.#score = 0;
        this.#speed = speed;
        this.#team = team;
        this.#control = null;
    };

    get team() : number
    {
        return (this.#team);
    };

    // Methode qui met a jour la position de la barre du player
    // update(dep: number) : void
    // {
    //     if (dep === -1 && this.#posY + dep * this.#speed >= 0)
    //         this.#posY += dep * this.#speed;
    //     else if (dep === 1 && (this.#posY + dep * this.#speed) + this.#height <= this.#field.height)
    //         this.#posY += dep * this.#speed;
    // };

    // // Methode qui ajoute 1 au score du player
    // addScore() : void
    // {
    //     this.#score += 1;
    // }

    // // GETTERS
    // get id() : number
    // {
    //     return this.#id;
    // }

    // get posX() : number
    // {
    //     return this.#posX;
    // }

    // get posY() : number
    // {
    //     return this.#posY;
    // }

    // get width() : number
    // {
    //     return this.#width;
    // }

    // get height() : number
    // {
    //     return this.#height;
    // }

    // get score() : number
    // {
    //     return this.#score;
    // }

    // get down() : string
    // {
    //     return this.#control.down;
    // }

    // get up() : string
    // {
    //     return this.#control.up;
    // }

    // set posX(value: number)
    // {
    //     this.#posX = value;
    // }

    // set posY(value : number)
    // {
    //     this.#posY = value;
    // }

    // set width(value: number)
    // {
    //     this.#width = value;
    // }

    // set height(value: number)
    // {
    //     this.#height = value;
    // }
};
