import PlayerLogic from './PlayerLogic.js'; 

interface IField
{
    width: number,
    height: number
}

export default class BallLogic
{
    #width: number;
    #posY: number;
    #posX: number;
    #speed: number;
    #color: string;
    #directionX : number;
    #directionY: number;
    #field: IField;
    constructor(color: string, speed: number, field: IField)
    {
        this.#width = 8;
        this.#posY = 0;
        this.#speed = speed;
        this.#color = color;
        this.#directionX = 1;
        this.#directionY = 1;
        this.#field = field;
        this.#posX = this.#field.width / 2;
        this.#posY = this.#field.height / 2;
    };

    // Methode qui deplace la balle
    move() : void
    {
        this.#posX += this.#directionX * this.#speed;
        this.#posY += this.#directionY * this.#speed;
    };

    // Methode qui verifie si la balle touche un mur
    bounce() : void
    {
        if (this.#posY >= this.#field.height || this.#posY <= 0)
            this.#directionY = -this.#directionY;
    };

    // Methode pour verifier si la balle entre en contact avec la barre du player donne en parametre
    hit(player: PlayerLogic) : void
    {
        if (this.#posX + this.#width / 2 >= player.posX &&
            this.#posX - this.#width / 2 <= player.posX + player.width &&
            this.#posY + this.#width / 2 >= player.posY &&
            this.#posY - this.#width / 2 <= player.posY + player.height)
        {
            this.#directionX = -this.#directionX;
        }
    };


    // GETTERS
    get width() : number
    {
        return this.#width;
    }

    // get canvas() : HTMLCanvasElement
    // {
    //     return this.#canvas;
    // }

    get posX() : number
    {
        return this.#posX;
    }

    get posY() : number
    {
        return this.#posY;
    }

    get speed() : number
    {
        return this.#speed;
    }

    get color() : string
    {
        return this.#color;
    }

    get directionX() : number
    {
        return this.#directionX;
    }

    get directionY() : number
    {
        return this.#directionY;
    }

    // get ctx() : CanvasRenderingContext2D
    // {
    //     return this.#ctx;
    // }

    /*
    *   Si Player1 marque -> 1, Si Player2 marque -> 2, Sinon 0
    */
    get goal() : number
    {
        if (this.#posX >= this.#field.width)
            return (1);
        else if (this.#posX <= 0)
            return (2);
        else
            return (0);
    };

    set posX(value: number)
    {
        this.#posX = value;
    }

    set posY(value: number)
    {
        this.#posY = value; 
    }

    /*
    * Methode qui permet de reinitialiser la balle apres un but, lance un compteur de 3 secondes pour le coup d'envoi
    */
    reset() : void
    {
            if (this.#posY > this.#field.height - 20)
                this.#posY = this.#field.height - 20;
            if (this.#posY < 20)
                this.#posY = 20;
            this.#posX = this.#field.width / 2; // La balle repart du centre du terrain
    };

    // Methode de rendu graphique dans le canvas
    render(ctx : CanvasRenderingContext2D) : void
    {
        ctx.beginPath();
        ctx.fillStyle = this.#color;
        ctx.arc(this.#posX, this.#posY, this.#width / 2, 0, 2 * Math.PI);
        ctx.fill();
    };
};
