import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  PBRMaterial,
  HemisphericLight,
  SceneLoader,
  Color3,
  CubeTexture,
  AbstractMesh,
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

export default class Pong3DScene
{

    #engine : Engine;
    #scene: Scene;
    #camera: ArcRotateCamera;
    #canvas: HTMLCanvasElement;
    #game: IGame;
    #players: IPlayer[];
    #ball: IBall;
    #keys : Set<string>;

    constructor(canvas: HTMLCanvasElement, game: GameLogic)
    {
        this.#canvas = canvas;
        this.#game = {logic: game, mesh: null};
        this.#players = [
            {mesh: null, logic: game.player1},
            {mesh: null, logic: game.player2}];
        this.#ball = {logic: game.ball, mesh: null};
        this.#keys = new Set<string>();

        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);

        window.addEventListener("keydown", this.keyDownHandler);
        window.addEventListener("keyup", this.keyUpHandler);
    };

    private keyDownHandler(e: KeyboardEvent): void
    {
        this.#keys.add(e.key);
    }

    private keyUpHandler(e: KeyboardEvent): void
    {
        this.#keys.delete(e.key);
    }

    async loadPlayerMesh(pos: number) : Promise<void>
    {
        try 
        {
            const result = await SceneLoader.ImportMeshAsync(
                "",
                "/field/",
                "raquetteLeft.glb",
                this.#scene
            );
            const meshes = result.meshes;
            if (meshes.length > 0)
                this.#players[pos].mesh = meshes[0];
            else
                console.warn("No mesh for field");
        } catch (error: unknown)
        {
            console.error("Error loadPlayerMesh");
        }
    }

    async loadBallMesh() : Promise<void>
    {
        try 
        {
            const result = await SceneLoader.ImportMeshAsync(
                "",
                "/field/",
                "ballPong.glb",
                this.#scene
            );
            const meshes = result.meshes;
            if (meshes.length > 0)
                this.#ball.mesh = meshes[0];
            else
                console.warn("No mesh for field");
        } catch (error: unknown)
        {
            console.error("Error loadBallMesh");
        }
    }

    async loadFieldMesh() : Promise<void>
    {
        try 
        {
            const result = await SceneLoader.ImportMeshAsync(
                "",
                "/field/",
                "terrain.glb",
                this.#scene
            );
            const meshes = result.meshes;
            if (meshes.length > 0)
                this.#game.mesh = meshes[0];
            else
                console.warn("No mesh for field");
        } catch (error: unknown)
        {
            console.error("Error loadFieldMesh");
        }
    };

    static isWebGLSupported(): boolean {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    init() : void
    {
        if (!Pong3DScene.isWebGLSupported()) {
            console.error("WebGL non supporté sur ce navigateur ou cette machine");
            return;
        }
        if (this.#canvas === null)
            console.log("CANVAS EXISTE PAS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log("Canvas ref:", this.#canvas);
console.log("Canvas width:", this.#canvas.width);
console.log("Canvas height:", this.#canvas.height);
        this.#engine = new Engine(this.#canvas, true, { disableWebGL2Support: true });
        this.#scene = new Scene(this.#engine);
        this.#camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 10,
            Vector3.Zero(), this.#scene);
        new HemisphericLight("light", new Vector3(0,1,0), this.#scene);
        this.loadFieldMesh();
        this.loadBallMesh();
        this.loadPlayerMesh(0);
        this.loadPlayerMesh(1);
    };

    start() : void
    {
        this.#game.logic.state = 1;
        this.#engine.runRenderLoop(() => {
            this.#game.logic.handleKeys(this.#keys);
            /* TEST D'UPDATE DES TEXTURES */
            if (this.#players[0].mesh)
            this.#players[0].mesh.position.y = this.#game.logic.player1.posY / 100; // Adapter facteur
            if (this.#players[1].mesh)
                this.#players[1].mesh.position.y = this.#game.logic.player2.posY / 100;

            if (this.#ball.mesh)
            {
                this.#ball.mesh.position.x = this.#game.logic.ball.posX / 100;
                this.#ball.mesh.position.y = this.#game.logic.ball.posY / 100;
            }
            this.#scene.render();
        })
    };

    dispose() : void
    {
        this.#engine.dispose();
    };
};