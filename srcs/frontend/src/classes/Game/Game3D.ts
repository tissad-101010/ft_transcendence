import {
  Scene,
  Vector3,
  Mesh,
  TransformNode,
  MeshBuilder,
  StandardMaterial,
  Color3
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF'; // important : chargeur pour .glb et .gltf


import GameLogic from './GameLogic.ts';
import PlayerLogic from './PlayerLogic.ts';
import BallLogic from './BallLogic.ts';

interface IPlayer
{
    logic: PlayerLogic,
    mesh: Mesh,
    size: Vector3 | null,
};

interface IBall
{
    logic: BallLogic,
    mesh: Mesh | null,
    size: Vector3 | null
};

interface IGame
{
    logic: GameLogic,
    mesh: Mesh | null,
    size: Vector3 | null
};

export default class Game3D
{
    #game: IGame | null;
    #players: IPlayer[];
    #ball: IBall | null;
    #scene: Scene;
    constructor(scene: Scene)
    {
        this.#game = null;
        this.#players = [];
        this.#ball = null;
        this.#scene = scene;
    };

    initPlayer(logic: PlayerLogic, index: number) : boolean
    {
        let box;
        try
        {
            box = MeshBuilder.CreateBox(
                "player" + index,
                {
                    width: 1,
                    height: 2,
                    depth: 5
                },
                this.#scene
            );
            box.parent = this.#game?.mesh;
            const material = new StandardMaterial("materialPlayer" + index, this.#scene);
            if (logic.team === 1)
            {
                box.position = new Vector3(
                    (0 - this.#game?.size.x / 2) + (this.#game?.size.x / 10),
                    0,
                    0
                );
                material.diffuseColor = Color3.Blue();
            }
            else
            {
                box.position = new Vector3(
                    (this.#game?.size.x / 2) - (this.#game?.size.x / 10),
                    0,
                    0
                );
                material.diffuseColor = Color3.Red();
            }
            box.isPickable = false;
            box.visibility = 1;
            box.material = material;
        } catch (error: unknown)
        {
            console.error("Error lors de la creation du mesh du player " + index);
            return (false);
        }
        this.#players.push({
            logic: logic,
            mesh: box,
            size: this.getSizeMesh(box)
        });
        logic.width = this.#players[index].size.x;
        logic.height = this.#players[index].size.z;
        logic.posX = box.position.x;
        logic.posY = box.position.y;
        if (this.#game && this.#game.logic.field)
            logic.field = this.#game.logic.field;
        return (true);
    };

    initField(logic: GameLogic) : boolean
    {
        this.#game = {
            logic: logic,
            mesh: this.#scene.getMeshByName("field"),
            size: null
        };
        if (!this.#game.mesh)
        {
            console.error("Error : field pas trouve");
            return (false);
        }
        this.#game.size = this.getSizeMesh(this.#game.mesh);
        if (!this.#game.size)
        {
            console.error("Error : size pas recupee dans initField");
            return (false);
        }
        logic.field = {width: this.#game.size.x, height: this.#game.size.z};
        return (true);
    };

    initBall(logic: BallLogic) : boolean
    {
        this.#ball = {
            logic: logic,
            mesh: this.#scene.getMeshByName("ballPong"),
            size: null
        };
        if (!this.#ball.mesh)
        {
            console.error("Error : ballPong pas trouve");
            return (false);
        }
        this.#ball.mesh.parent = this.#game?.mesh;
        this.#ball.size = this.getSizeMesh(this.#ball.mesh);
        if (!this.#ball.size)
        {
            console.error("Error : size pas recupee dans initBall");
            return (false);
        }
        this.#ball.mesh.position = new Vector3(0, this.#ball.size.z, 0);
        logic.radius = this.#ball.size.x;
        logic.posX = this.#ball.mesh.position.x;
        logic.posY = this.#ball.mesh.position.z;
        return (true);
    };

    // RETOURNE UN VECTOR3 QUI CONTIENT LA TAILLE DE L'ELEMENT DONNE EN PARAMETRE
    getSizeMesh(mesh: Mesh | TransformNode) : Vector3
    {
        if (mesh instanceof Mesh)
        {
            const box = mesh.getBoundingInfo().boundingBox;
            const min = box.minimumWorld;
            const max = box.maximumWorld;
            return (max.subtract(min));
        } else if (mesh instanceof TransformNode)
        {
            const {min, max} = mesh.getHierarchyBoundingVectors();
            return (max.subtract(min));
        }
        return (null);
    }

    

    // MET A JOUR LA POSITION DU PLAYER
    updatePlayer(player: IPlayer)
    {
        player.mesh.position = new Vector3(player.logic.posX, player.mesh.position.y, player.logic.posY);
            // player.mesh.position = Vector3.Lerp(player.mesh.position, newPos, 0.2);
    };

    // MET A JOUR LA POSITION DE LA BALLE
    updateBall(ball: IBall)
    {
        ball.mesh.position = new Vector3(ball.logic.posX, ball.mesh.position.y, ball.logic.posY);
    };

    // MET A JOUR TOUS LES ELEMENTS 3D
    update(keys: Set<string>) : void
    {
        this.#game?.logic.update(keys);
        // Update visuel
        this.#players.forEach((player) => {
            this.updatePlayer(player);
        });
        if (this.#ball && this.#ball.mesh)
            this.updateBall(this.#ball);
    };

    get players()
    {
        return (this.#players);
    }
};