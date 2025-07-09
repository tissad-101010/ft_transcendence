import {
  Engine,
  Scene,
  ArcRotateCamera,
  FreeCamera,
  Vector3,
  PBRMaterial,
  HemisphericLight,
  SceneLoader,
  AxesViewer,
  MeshBuilder,
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

function getWorldSize(mesh: Mesh): { width: number; height: number; depth: number } {
    // Force la mise à jour de la matrice du monde
    mesh.computeWorldMatrix(true);

    // Récupère la bounding box locale
    const boundingInfo = mesh.getBoundingInfo();
    const min = boundingInfo.minimum;
    const max = boundingInfo.maximum;

    // Transforme les extrémités dans le monde
    const worldMatrix = mesh.getWorldMatrix();
    const minWorld = Vector3.TransformCoordinates(min, worldMatrix);
    const maxWorld = Vector3.TransformCoordinates(max, worldMatrix);

    // Calcule les tailles
    const width = Math.abs(maxWorld.x - minWorld.x);
    const height = Math.abs(maxWorld.y - minWorld.y);
    const depth = Math.abs(maxWorld.z - minWorld.z);

    return { width, height, depth };
}

export default class Pong3DScene
{

    #engine : Engine;
    #scene: Scene;
    #camera: FreeCamera;
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
                "raquette.glb",
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
            console.log(meshes);
            const terrainMesh = meshes.find(m => m.getTotalVertices() > 0 && m.name === "Terrain");
            if (terrainMesh)
                this.#game.mesh = terrainMesh;
            else
                console.warn("Terrain mesh non trouvé !");
        } catch (error: unknown)
        {
            console.error("Error loadFieldMesh");
        }
    };

    async init() : Promise<void>
    {
        const context = this.#canvas?.getContext("webgl") || this.#canvas?.getContext("experimental-webgl");
        if (!context) {
            console.error("WebGL context not supported or canvas not ready");
            return;
        }          
        this.#engine = new Engine(this.#canvas, true);
        this.#scene = new Scene(this.#engine);
        // this.#camera = new ArcRotateCamera(
        //     "camera",
        //     Math.PI / 2,      // alpha
        //     Math.PI / 4,      // beta (inclinaison verticale)
        //     50,               // radius (distance par rapport au centre)
        //     new Vector3(0, 50, 20), // target
        //     this.#scene
        // );
        this.#camera = new FreeCamera("freeCamera", new Vector3(0.5, 46.77, -118.65), this.#scene);
        this.#camera.setTarget(Vector3.Zero());
        this.#camera.attachControl(this.#canvas, true);
        this.#camera.speed = 1;
        // const axes = new AxesViewer(this.#scene, 10);
        // const box = MeshBuilder.CreateBox("centerBox", { size: 2 }, this.#scene);
        // box.position = new Vector3(0, 1, 0); // Légèrement au-dessus du sol
        // this.#camera.setTarget(Vector3.zero());
        new HemisphericLight("light", new Vector3(0,1,0), this.#scene);
        await this.loadFieldMesh();
        await this.loadBallMesh();
        await this.loadPlayerMesh(0);
        await this.loadPlayerMesh(1);

        let size = getWorldSize(this.#game.mesh);
        let desiredWidth = this.#game.logic.width;
        let scaleFactor = desiredWidth / size.width;
        this.#game.mesh.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);

        size = getWorldSize(this.#players[0].mesh);
        desiredWidth = this.#players[0].logic.width;
        scaleFactor = desiredWidth / size.width;
        this.#players[0].mesh.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);
        this.#players[1].mesh.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);

        size = getWorldSize(this.#ball.mesh);
        desiredWidth = this.#ball.logic.width;
        scaleFactor = desiredWidth / size.width;
        this.#ball.mesh.scaling = new Vector3(scaleFactor, scaleFactor, scaleFactor);
    };

    start() : void
    {
        this.#game.logic.state = 1;
        this.#engine.runRenderLoop(() => {
            const camDiv = document.getElementById("camPosition");

            this.#scene.registerBeforeRender(() => {
                if (camDiv) {
                    const pos = this.#camera.position;
                    camDiv.innerText = `x: ${pos.x.toFixed(2)}\ny: ${pos.y.toFixed(2)}\nz: ${pos.z.toFixed(2)}`;
                }
            });
            this.#game.logic.update(this.#keys);
            /* TEST D'UPDATE DES TEXTURES */
            if (this.#players[0].mesh)
            this.#players[0].mesh.position.z = this.#game.logic.player1.posY; // Adapter facteur
            if (this.#players[1].mesh)
                this.#players[1].mesh.position.z = this.#game.logic.player2.posY;

            if (this.#ball.mesh)
            {
                this.#ball.mesh.position.x = this.#game.logic.ball.posX;
                this.#ball.mesh.position.z = this.#game.logic.ball.posY;
            }
            this.#scene.render();
        })
    };

    dispose() : void
    {
        this.#engine.dispose();
    };
};