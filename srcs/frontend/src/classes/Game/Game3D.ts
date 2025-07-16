import {
  Scene,
  Vector3,
  Mesh
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF'; // important : chargeur pour .glb et .gltf


import GameLogic from './GameLogic.ts';
import PlayerLogic from './PlayerLogic.ts';
import BallLogic from './BallLogic.ts';

interface IPlayer
{
    logic: PlayerLogic,
    mesh: Mesh | null
};

interface IBall
{
    logic: BallLogic,
    mesh: Mesh | null
};

interface IGame
{
    logic: GameLogic,
    mesh: Mesh | null
};

export default class Game3D
{
    #game: IGame;
    #players: IPlayer[];
    #ball: IBall;
    #scene: Scene;
    constructor(game: GameLogic | null, scene: Scene)
    {
        if (!game)
            throw new Error("Error constructor Game3D : game = null");
        this.#game = {logic: game, mesh: null};
        this.#players = [
            {mesh: null, logic: game.player1},
            {mesh: null, logic: game.player2}];
        this.#ball = {logic: game.ball, mesh: null};
        this.#scene = scene;
    };

    loadMeshes() : boolean
    {
        this.#game.mesh = this.#scene.getMeshByName("Terrain");
        this.#players[0].mesh = this.#scene.getMeshByName("MancheRaquette");
        this.#players[1].mesh = this.#scene.getMeshByName("McheRaquette001");
        this.#ball = this.#scene.getMeshByName("Ball");
        if (!this.#game.mesh
                || !this.#players[0].mesh
                || !this.#players[1].mesh
                || !this.#ball.mesh
        )
        {
            console.error("MESH NON CHARGE");
            return (false);
        }
        return (true);
    };

    updatePlayer(player: IPlayer)
    {
        const boundingInfo = this.#game.mesh.getBoundingInfo();
        const minimum = boundingInfo.minimum;
        const maximum = boundingInfo.maximum;

        const size = maximum.subtract(minimum);

        const scaleX = size.width / player.logic.width;
        const scaleZ = size.depth / player.logic.height;

        player.mesh.position = new Vector3(scaleX, player.mesh.position.y, scaleZ);
    };

    updateBall(ball: IBall)
    {
        const boundingInfo = this.#game.mesh.getBoundingInfo();
        const minimum = boundingInfo.minimum;
        const maximum = boundingInfo.maximum;

        const size = maximum.subtract(minimum);

        const scaleX = size.width / ball.logic.width;
        const scaleZ = size.depth / ball.logic.width;

        ball.mesh.position = new Vector3(scaleX, ball.mesh.position.y, scaleZ);
    };

    update(keys: Set<string>) : void
    {
        this.#game.logic.update(keys);
        // Update visuel
        if (this.#players[0].mesh)
            this.updatePlayer(this.#players[0]);
        if (this.#players[1].mesh)
            this.updatePlayer(this.#players[1]);
        if (this.#ball.mesh)
            this.updateBall(this.#ball);
    };

    get fieldMesh() : Mesh
    {
        return (this.#game.mesh);
    }

    get ballMesh() : Mesh
    {
        return (this.#ball.mesh);
    }

    get player1Mesh() : Mesh
    {
        return (this.#players[0].mesh);
    }

    get player2Mesh() : Mesh
    {
        return (this.#players[1].mesh);
    }

};