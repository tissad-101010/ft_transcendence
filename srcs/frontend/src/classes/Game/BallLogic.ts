import PlayerLogic from './PlayerLogic.ts'; 

interface IField
{
    width: number,
    height: number
}

export default class BallLogic
{
    #radius: number;
    #posY: number;
    #posX: number;
    #speed: number;
    #color: string;
    #directionX : number;
    #directionY: number;
    #field: IField | null;
    constructor(speed: number)
    {
        this.#radius = 0;
        this.#posY = 0;
        this.#posX = 0;
        this.#speed = speed;
        this.#color = "rgb(255,255,255)";
        this.#directionX = 1;
        this.#directionY = 0;
        this.#field = null;
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
        if (this.#field && (this.#posY + this.#radius >= this.#field.height || this.#posY - this.#radius <= 0))
            this.#directionY = -this.#directionY;
    };

    // Methode pour verifier si la balle entre en contact avec la barre du player donne en parametre
    hit(player: PlayerLogic): void {

    // Trouver le point le plus proche du centre de la balle sur le rectangle
    const closestX = Math.max(player.posX, Math.min(this.#posX, player.posX + player.width));
    const closestY = Math.max(player.posY, Math.min(this.#posY, player.posY + player.height));

    // Calcul de la distance entre ce point et le centre de la balle
    const dx = (this.#posX) - closestX;
    const dy = (this.#posY) - closestY;

    const distanceSquared = dx * dx + dy * dy;

    // si colision
    if (distanceSquared <= this.#radius * this.#radius) {
        
        // Calcul du contact sur la raquette
        const centerY = this.#posY + this.#radius;
        const centerPlayerY = player.posY + player.height / 2;
        const impactY = (centerY - centerPlayerY) / (player.height / 2); // entre -1 et +1
        const maxAngle = Math.PI / 3.5;
        const bounceAngle = impactY * maxAngle;

        const speed = Math.sqrt(this.#directionX ** 2 + this.#directionY ** 2);

        // directionX : simplement inversée
        const blend = 0.7;
        const dirY = Math.sin(bounceAngle) * speed;

        this.#directionX = -this.#directionX;
        this.#directionY = dirY * (1 - blend) + dirY * blend;

        // Corriger la position (évite de rester dans la raquette)
        if (this.#directionX > 0)
            this.#posX = player.posX + player.width + this.#radius;
        else
            this.#posX = player.posX - this.#radius;
        }
    }

    // GETTERS
    get radius() : number
    {
        return this.#radius;
    }

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

    set radius(value:number)
    {
        this.#radius = value;
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
};
