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
  Matrix,
  Mesh
} from '@babylonjs/core';

import '@babylonjs/loaders/glTF'; // important : chargeur pour .glb et .gltf

import GameLogic from './Game/GameLogic.js';
import PlayerLogic from './Game/PlayerLogic.js';
import BallLogic from './Game/BallLogic.js';

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
};

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
            const playerMesh = meshes.find(m => m.getTotalVertices() > 0 && m.name === "MancheRaquette");
            if (playerMesh)
                this.#players[pos].mesh = playerMesh;
            else
                console.warn("Player mesh non trouvé !");
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
            const ballMesh = meshes.find(m => m.getTotalVertices() > 0 && m.name === "BallPong");
            if (ballMesh)
                this.#ball.mesh = ballMesh;
            else
                console.warn("Ball mesh non trouvé !");
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
                "terraintest.glb",
                this.#scene
            );
            const meshes = result.meshes;
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

    preparePlayer(player: IPlayer) : void
    {
        const size = getWorldSize(player.mesh);
        const scale = player.logic.width / size.width;
        player.mesh.scaling = new Vector3(scale, scale, scale);
        
        const bounding = player.mesh.getBoundingInfo().boundingBox;
        const center = bounding.centerWorld;
        player.mesh.position = player.mesh.position.subtract(center);

        player.mesh.position.x = player.logic.posX;
        player.mesh.position.z = player.logic.posY;
        player.mesh.position.y = 5;
    };

    prepareBall() : void
    {
        const size = getWorldSize(this.#ball.mesh);
        const scale = this.#ball.logic.width / size.width;
        this.#ball.mesh.scaling = new Vector3(scale, scale, scale);
        
        const bounding = this.#ball.mesh.getBoundingInfo().boundingBox;
        const center = bounding.centerWorld;
        this.#ball.mesh.position = this.#ball.mesh.position.subtract(center);

        this.#ball.mesh.position.x = this.#ball.logic.posX;
        this.#ball.mesh.position.z = this.#ball.logic.posY;
        this.#ball.mesh.position.y = 2;
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
        // Centrer explicitement (normalement, par défaut c’est déjà à 0,0,0)
        // this.#camera = new FreeCamera("freeCamera", new Vector3(0.75, 115, -190.75), this.#scene);
        // this.#camera.setTarget(Vector3.Zero());
        // this.#camera.attachControl(this.#canvas, true);
        // this.#camera.speed = 1;
        // const axes = new AxesViewer(this.#scene, 10);
        // const box = MeshBuilder.CreateBox("centerBox", { size: 2 }, this.#scene);
        // box.position = new Vector3(0, 1, 0); // Légèrement au-dessus du sol
        // this.#camera.setTarget(Vector3.zero());
        new HemisphericLight("light", new Vector3(0,1,0), this.#scene);
        await this.loadFieldMesh();
        await this.loadBallMesh();
        await this.loadPlayerMesh(0);
        await this.loadPlayerMesh(1);

        

        const size = getWorldSize(this.#game.mesh);
        let scaleX = this.#game.logic.width / size.width;
        let scaleZ = this.#game.logic.height / size.depth;
        let uniformScale = Math.min(scaleX, scaleZ);
        this.#game.mesh.scaling = new Vector3(uniformScale, uniformScale, uniformScale);

        const bounding = this.#game.mesh.getBoundingInfo().boundingBox;
        const center = bounding.centerWorld;
        this.#game.mesh.position = this.#game.mesh.position.subtract(center);

        this.preparePlayer(this.#players[0]);
        this.preparePlayer(this.#players[1]);
        this.prepareBall();
        this.#camera = new ArcRotateCamera("arcCamera", 
            Math.PI / 2,   // alpha
            Math.PI / 4,   // beta
            300,           // radius
            this.#game.mesh,    // <--- ICI tu mets le mesh directement
            this.#scene
        );
        // this.#camera.attachControl(this.#canvas, true);

        // console.log(this.#game.mesh.getBoundingInfo());
        // let bounding = this.#game.mesh.getBoundingInfo().boundingBox;
        // let size = getWorldSize(this.#game.mesh);
        // let desiredWidth = this.#game.logic.width;
        // let desiredHeight = this.#game.logic.height;
        // let scaleX = desiredWidth / size.width;
        // let scaleY = desiredHeight / size.depth;
        // this.#game.mesh.scaling = new Vector3(scaleX, scaleX, scaleY);
        // let center = bounding.centerWorld;
        // this.#game.mesh.bakeTransformIntoVertices(Matrix.Translation(-center.x, -center.y, -center.z));
        // this.#game.mesh.position = new Vector3(0,0,0);


        // size = getWorldSize(this.#players[0].mesh);
        // desiredWidth = this.#players[0].logic.width;
        // scaleX = desiredWidth / size.width;
        // bounding = this.#players[0].mesh.getBoundingInfo().boundingBox;
        // this.#players[0].mesh.scaling = new Vector3(scaleX, scaleX, scaleX);
        // center = bounding.centerWorld
        // this.#players[0].mesh.bakeTransformIntoVertices(Matrix.Translation(-center.x, -center.y, -center.z));
        // bounding = this.#players[1].mesh.getBoundingInfo().boundingBox;
        // this.#players[1].mesh.scaling = new Vector3(scaleX, scaleX, scaleX);
        // center = bounding.centerWorld;
        // this.#players[1].mesh.bakeTransformIntoVertices(Matrix.Translation(-center.x, -center.y, -center.z));

        // bounding = this.#ball.mesh.getBoundingInfo().boundingBox;
        // size = getWorldSize(this.#ball.mesh);
        // desiredWidth = this.#ball.logic.width;
        // scaleX = desiredWidth / size.width;
        // this.#ball.mesh.scaling = new Vector3(scaleX, scaleX, scaleX);
        // center = bounding.centerWorld;
        // this.#ball.mesh.bakeTransformIntoVertices(Matrix.Translation(-center.x, -center.y, -center.z));
    };

    start() : void
    {
        // this.#game.logic.state = 1;
        // this.#game.logic.setStartPosition();
        // this.#engine.runRenderLoop(() => {
        //     const camDiv = document.getElementById("camPosition");

        //     this.#scene.registerBeforeRender(() => {
        //         if (camDiv) {
        //             const pos = this.#camera.position;
        //             camDiv.innerText = `x: ${pos.x.toFixed(2)}\ny: ${pos.y.toFixed(2)}\nz: ${pos.z.toFixed(2)}`;
        //         }
        //     });
        //     this.#game.logic.update(this.#keys);
        //     /* TEST D'UPDATE DES TEXTURES */
        //     if (this.#players[0].mesh)
        //         this.#players[0].mesh.position = new Vector3(this.#game.logic.player1.posX, 2, this.#game.logic.player1.posY)
        //     if (this.#players[1].mesh)
        //         this.#players[1].mesh.position = new Vector3(this.#game.logic.player2.posX, 2, this.#game.logic.player2.posY)

        //     if (this.#ball.mesh)
        //         this.#ball.mesh.position = new Vector3(this.#game.logic.ball.posX, 2, this.#game.logic.ball.posY);
        //     this.#scene.render();
        // })

        this.#game.logic.state = 1;
    // this.#game.logic.setStartPosition();

    // Déplace la logique dans un seul callback, avant le render
    this.#scene.onBeforeRenderObservable.add(() => {
        // Update logique
        this.#game.logic.update(this.#keys);

        // Update visuel
        if (this.#players[0].mesh)
            this.#players[0].mesh.position = new Vector3(
                -this.#game.logic.width / 2 + this.#players[0].logic.posX,
                7,
                -this.#game.logic.height / 2 + this.#players[0].logic.posY
            );

        if (this.#players[1].mesh)
            this.#players[1].mesh.position = new Vector3(
                -this.#game.logic.width / 2 + this.#players[1].logic.posX,
                7,
                -this.#game.logic.height / 2 + this.#players[1].logic.posY
            );

        if (this.#ball.mesh)
            this.#ball.mesh.position = new Vector3(
                -this.#game.logic.width / 2 + this.#ball.logic.posX,
                3,
                -this.#game.logic.height / 2 + this.#ball.logic.posY
            );
        
    });

    this.#engine.runRenderLoop(() => {
        this.#scene.render();
    });
    };

    dispose() : void
    {
        this.#engine.dispose();
    };
};