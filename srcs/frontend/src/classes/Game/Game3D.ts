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
    mesh: Mesh | null | TransformNode,
    size: Vector3 | null
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
    #game: IGame;
    #players: IPlayer[];
    #ball: IBall;
    #scene: Scene;
    constructor(game: GameLogic | null, scene: Scene)
    {
        if (!game)
            throw new Error("Error constructor Game3D : game = null");
        this.#game = {logic: game, mesh: null, size: null};
        this.#players = [
            {mesh: null, logic: game.player1, size: null},
            {mesh: null, logic: game.player2, size: null}];
        this.#ball = {logic: game.ball, mesh: null, size: null};
        this.#scene = scene;
    };

    convertLogicToWorld3D(
        logicX: number,
        logicY: number,
        size: Vector3
    ): Vector3 | null
    {
        const scaleX = this.#game.size.x / this.#game.logic.width;
        const scaleY = this.#game.size.z / this.#game.logic.height;

        // Calcul position logique (origine en haut à gauche)
        const offsetX = logicX * scaleX - this.#game.size.x / 2;
        const offsetZ = logicY * scaleY - this.#game.size.z / 2;

        const center = this.#game.mesh.getBoundingInfo().boundingBox.centerWorld;

        // Inverser l'axe Z car Y logique va vers le bas
        const invertedOffsetZ = -offsetZ;
        return new Vector3(
            center.x + offsetX,
            center.y + size.y / 2,                 // Y constant (hauteur)
            center.z + invertedOffsetZ
        );
    }

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

    showHitBox(item: Mesh | TransformNode) : void
    {
        if (item instanceof Mesh)
        {
            item.showBoundingBox = true;
        }
        else if (item instanceof TransformNode)
        {
            const { min, max } = item.getHierarchyBoundingVectors();
            const size = max.subtract(min);
            const center = min.add(size.scale(0.5));

            const box = MeshBuilder.CreateBox("bbox", {
                width: size.x,
                height: size.y,
                depth: size.z
            }, this.#scene);

            box.position = center.subtract(item.getAbsolutePosition());

            box.isPickable = false;
            box.visibility = 0.3;

            const material = new StandardMaterial("bboxMat", this.#scene);
            material.wireframe = true;
            material.emissiveColor = Color3.Red();
            box.material = material;

            box.parent = item;
        }
    }

    loadMeshes() : boolean
    {
        this.#game.mesh = this.#scene.getMeshByName("field");
        this.#players[0].mesh = this.#scene.getTransformNodeByName("raquetteLeft");
        this.#players[1].mesh = this.#scene.getTransformNodeByName("raquetteRight");
        this.#ball.mesh = this.#scene.getMeshByName("ballPong");
        if (!this.#game.mesh)
        {
            console.error("terrain non trouve");
            return (false);
        }
        else if (!this.#players[0].mesh)
        {
            console.error("player1 non trouve");
            return (false);
        }
        else if (!this.#players[1].mesh)
        {
            console.error("player2 non trouve");
            return (false);
        }
        else if (!this.#ball.mesh)
        {
            console.error("ball non trouve");
            return (false);
        }
        this.#game.size = this.getSizeMesh(this.#game.mesh);
        this.#players[0].size = this.getSizeMesh(this.#players[0].mesh);
        this.#players[1].size = this.getSizeMesh(this.#players[1].mesh);
        this.#ball.size = this.getSizeMesh(this.#ball.mesh);
        if (
            !this.#game.size ||
            !this.#players[0].size ||
            !this.#players[1].size ||
            !this.#ball.size
        )
            return (false);
        this.showHitBox(this.#game.mesh);
        this.showHitBox(this.#players[0].mesh);
        this.showHitBox(this.#players[1].mesh);
        this.showHitBox(this.#ball.mesh);
        return (true);
    };

    updatePlayer(player: IPlayer)
    {
        const newPos = this.convertLogicToWorld3D(
            player.logic.posX,
            player.logic.posY,
            player.size
        );
        if (newPos)
            player.mesh.position = Vector3.Lerp(player.mesh.position, newPos, 0.2);
    };

    updateBall(ball: IBall)
    {
        const newPos = this.convertLogicToWorld3D(
            ball.logic.posX,
            ball.logic.posY,
            ball.size
        );
        if (newPos)
            ball.mesh.position = newPos;
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