import PlayerLogic from './PlayerLogic.ts'; 

interface IField
{
    width: number,
    height: number
}

export default class BallLogic
{
    private radius: number;
    private posY: number;
    private posX: number;
    private speed: number;
    private initialSpeed: number;
    private color: string;
    private directionX : number;
    private directionY: number;
    private field: IField | null;
    constructor(speed: number)
    {
        this.radius = 0;
        this.posY = 0;
        this.posX = 0;
        this.speed = speed;
        this.initialSpeed = speed;
        this.color = "rgb(255,255,255)";
        this.directionX = 1;
        this.directionY = -1;
        this.field = null;
    };

    // Methode qui deplace la balle
    move() : void
    {
        this.posX += this.directionX * this.speed;
        this.posY += this.directionY * this.speed;
    };

    // Methode qui verifie si la balle touche un mur
    bounce() : void
    {
        if (this.field && (this.posY + this.radius >= this.field.height / 2 || this.posY - this.radius <= 0 - this.field.height / 2))
        {
            this.directionY = -this.directionY;
        }
    };

    hit(player: PlayerLogic): void {
        console.log("RADIUS", this.radius);
        const ballLeft = this.posX - this.radius;
        const ballRight = this.posX + this.radius;
        const ballTop = this.posY - this.radius;
        const ballBottom = this.posY + this.radius;

        const playerLeft = player.getPosX - player.getWidth / 2;
        const playerRight = player.getPosX + player.getWidth / 2;
        const playerTop = player.getPosY - player.getHeight / 2;
        const playerBottom = player.getPosY + player.getHeight / 2;

        const collide =
            ballRight >= playerLeft &&
            ballLeft <= playerRight &&
            ballBottom >= playerTop &&
            ballTop <= playerBottom;

        if (collide) {
            // replace la balle juste à côté du joueur pour éviter l'effet "collé"
            if (this.directionX > 0) {
                this.posX = playerLeft - this.radius;
            } else {
                this.posX = playerRight + this.radius;
            }

            // on inverse la direction horizontale
            this.directionX = -this.directionX;

            // calcule de l'angle selon l'impact vertical
            let impactY = (this.posY - player.getPosY) / (player.getHeight / 2);

            // clamp pour éviter un rebond trop horizontal (ennuyeux à jouer)
            impactY = Math.max(-0.9, Math.min(0.9, impactY));

            this.directionY = impactY;

            // normalisation du vecteur de direction (pour garder une vitesse constante)
            const length = Math.sqrt(this.directionX ** 2 + this.directionY ** 2);
            this.directionX /= length;
            this.directionY /= length;

            // accélération progressive de la balle
            this.speed *= 1.05;
        }
    }

    /*
    * Methode qui permet de reinitialiser la balle apres un but, lance un compteur de 3 secondes pour le coup d'envoi
    */
    reset(scoringTeam: number = 0) : void
    {
        this.posX = 0;
        this.posY = 0;
        this.speed = this.initialSpeed;
        if (scoringTeam === 1)
            this.directionX = 1;
        else if (scoringTeam === 2)
            this.directionX = -1;
        else
            this.directionX = this.directionX >= 0 ? 1 : -1;
        this.directionY = 0;
    };

    // GETTERS
    get getRadius() : number
    {
        return this.radius;
    }

    get getPosX() : number
    {
        return this.posX;
    }

    get getPosY() : number
    {
        return this.posY;
    }

    get getSpeed() : number
    {
        return this.speed;
    }

    get getColor() : string
    {
        return this.color;
    }

    get getDirectionX() : number
    {
        return this.directionX;
    }

    get getDirectionY() : number
    {
        return this.directionY;
    }

    /*
    *   Si Team1 marque -> 1, Si team2 marque -> 2, Sinon 0
    */
    get goal() : number
    {
        if (!this.field)
            return (0);
        if (this.posX >= this.field.width / 2)
            return (1);
        else if (this.posX <= -this.field.width / 2)
            return (2);
        else
            return (0);
    };

    set setPosX(value: number)
    {
        this.posX = value;
    }

    set setPosY(value: number)
    {
        this.posY = value; 
    }

    set setRadius(value:number)
    {
        this.radius = value;
    }

    set setField(field: IField)
    {
        this.field = field;
    }
};
