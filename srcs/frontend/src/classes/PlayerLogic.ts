interface IControl
{
    up: string,
    down: string
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
    #canvas: HTMLCanvasElement;
    #control: IControl;
    #ctx: CanvasRenderingContext2D;
    constructor(id: number, color: string, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, speed: number)
    {
        if (id < 1 || id > 2)
            throw new Error("id incorrect : " + id);
        this.#id = id;
        this.#height = 50;
        this.#width = 10;
        this.#color = color;
        this.#canvas = canvas;
        if (id === 1)
        {
            this.#posX = 20;
            this.#control = {up: "q", down: "a"};
        }
        else
        {
            this.#posX = this.#canvas.width - 20 - this.#width;
            this.#control = {up: "ArrowUp", down: "ArrowDown"};
        }
        this.#posY = (720 / 2) - (this.#height / 2);
        this.#speed = speed;
        this.#score = 0;
        this.#ctx = ctx;
    };


    // Methode de rendu graphique pour le canvas
    render() : void
    {
        this.#ctx.fillStyle = this.#color;
        this.#ctx.fillRect(this.#posX, this.#posY, this.#width, this.#height);
    };

    // Methode qui met a jour la position de la barre du player
    update(dep: number) : void
    {
        if (dep === -1 && this.#posY + dep * this.#speed >= 0)
            this.#posY += dep * this.#speed;
        else if (dep === 1 && (this.#posY + dep * this.#speed) + this.#height <= this.#canvas.height)
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
};
