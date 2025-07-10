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
    #height: number;
    #posX: number;
    #posY: number;
    #id: number;
    #speed: number;
    #score: number;
    #color: string;
    #control: IControl;
    #field: IField;
    constructor(id: number, color: string, speed: number, field: IField)
    {
        if (id < 1 || id > 2)
            throw new Error("id incorrect : " + id);
        this.#id = id;
        this.#height = 2;
        this.#width = 2;
        this.#color = color;
        this.#field = field;
        this.#posX = 0;
        this.#posY = 0;
        this.#score = 0;
        this.#speed = speed;
        if (id === 1)
            this.#control = {up: "q", down: "a"};
        else
            this.#control = {up: "ArrowUp", down: "ArrowDown"};
        // this.#posY = 0;
    };


    // Methode de rendu graphique pour le canvas
    // render() : void
    // {
    //     this.#ctx.fillStyle = this.#color;
    //     this.#ctx.fillRect(this.#posX, this.#posY, this.#width, this.#height);
    // };

    // Methode qui met a jour la position de la barre du player
    update(dep: number) : void
    {
        if (dep === -1 && this.#posY + dep * this.#speed >= 0)
            this.#posY += dep * this.#speed;
        else if (dep === 1 && (this.#posY + dep * this.#speed) + this.#height <= this.#field.height)
            this.#posY += dep * this.#speed;
    };

    // Methode qui ajoute 1 au score du player
    addScore() : void
    {
        this.#score += 1;
    }

    // GETTERS
    get id() : number
    {
        return this.#id;
    }

    get posX() : number
    {
        return this.#posX;
    }

    get posY() : number
    {
        return this.#posY;
    }

    get width() : number
    {
        return this.#width;
    }

    get height() : number
    {
        return this.#height;
    }

    get score() : number
    {
        return this.#score;
    }

    get down() : string
    {
        return this.#control.down;
    }

    get up() : string
    {
        return this.#control.up;
    }

    set posX(value: number)
    {
        this.#posX = value;
    }

    set posY(value : number)
    {
        this.#posY = value;
    }
};
