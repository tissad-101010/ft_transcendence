import {
  Engine,
  Scene,
  ArcRotateCamera,
  FreeCamera,
  Vector3,
  HemisphericLight,
  SceneLoader,
  Mesh
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF'; // important : chargeur pour .glb et .gltf

import WorldLogic from "./WorldLogic.ts";
import GameManager from './Game/GameManager.ts';

interface IWorld
{
    logic: WorldLogic,
    meshPath: IPathMesh, 
    mesh: Mesh | null
};

interface IPathMesh
{
    folder: string,
    file: string
};

// CLASS DE TEST POUR MON ENVIRONNEMENT 3D
export default class World3D
{

    #world: IWorld;
    #canvas: HTMLCanvasElement;
    #engine: Engine;
    #scene: Scene;
    #camera: FreeCamera;
    #keys: Set<string>;
    #gameManager: GameManager;

    constructor(logic: WorldLogic, canvas: HTMLCanvasElement, worldPath: IPathMesh)
    {
        this.#world = {logic: logic, mesh: null, meshPath: worldPath};
        this.#canvas = canvas;
        this.#keys = new Set<string>();
        this.#gameManager = new GameManager();
    };

    keyDownHandler(e: KeyboardEvent): void
    {
        this.#keys.add(e.key);
    }

    keyUpHandler(e: KeyboardEvent): void
    {
        this.#keys.delete(e.key);
    }

    // async loadWorldMesh() : Promise<void>
    // {
    //     try
    //     {
    //         console.log(this.#world.meshPath.folder, this.#world.meshPath.file);
    //         const result = await SceneLoader.ImportMeshAsync
    //         (
    //             "",
    //             "/babylon/",
    //             "scene.glb",
    //             this.#scene
    //         );
    //         const ms = result.meshes;
            
    //     } catch (error: unknown)
    //     {
    //         console.error("Error loadWorldMesh");
    //     }
    // }

    async init() : Promise<void>
    {
        const context = this.#canvas?.getContext("webgl") || this.#canvas?.getContext("experimental-webgl");
        if (!context) {
            console.error("WebGL context not supported or canvas not ready");
            return;
        }

        this.#engine = new Engine(this.#canvas, true);
        this.#scene = new Scene(this.#engine);

        new HemisphericLight("light", new Vector3(0,1,0), this.#scene); // LUMIERE TEMPORAIRE EN ATTENDANT DE METTRE L'ENV

        // CHARGE TOUTE LA SCENE ET STOCKE LES MESH DANS this.#scene.meshes
        await SceneLoader.AppendAsync("/babylon/", "scene.glb", this.#scene);

        // this.#scene.meshes.forEach(m => {
        //     console.log(m.name);
        // });
    };

    start() : void
    {
        // TEST POUR UN MATCH
        /*
            type correspond au mode de la partie :
            1 : local
            2 : online
            3 : local vs IA
        */
        const testRules = {
            nbPlayers: 2,
            scoreMax: 5,
            ballSpeed: 0.2,
            playerSpeed: 1,
            countDownGoalTime: 3,
            allowPause: true,
            type: 1
        }
        
        // SIMULATION DE CREATION D'UN MATCH
        try
        {

            this.#gameManager.createGame(testRules, this.#scene);

            this.#gameManager.gameLogic?.addPlayers(1);
            this.#gameManager.gameLogic?.addPlayers(2);

            this.#gameManager.initGame();

            console.log(this.#gameManager);


        } catch (error: unknown)
        {
            if (error instanceof Error)
                console.error(error.message);
            else
                console.error("Error innexistante");
        }


        ////////////////////////////////////
        
        this.#camera = new ArcRotateCamera("arcCamera", 
            Math.PI / 2,   // alpha
            Math.PI / 2.4,   // beta
            25,           // radius
            new Vector3(0, 40, 0),    // <--- ICI tu mets le mesh directement
            this.#scene
        );
        // /////////////////////

        // this.#world.logic.gameManager.start();

        // // A changer de place plus tard (Utile pour le gameplay)
        // this.keyDownHandler = this.keyDownHandler.bind(this);
        // this.keyUpHandler = this.keyUpHandler.bind(this);
        // window.addEventListener("keydown", this.keyDownHandler);
        // window.addEventListener("keyup", this.keyUpHandler);
        // /////////////////////////////////////////////////////////


        // this.#scene.onBeforeRenderObservable.add(() => {
        //     if (this.#world.logic.game && this.#world.logic.game.state !== 3)
        //         this.#game3D?.update(this.#keys);
        // });

        this.#engine.runRenderLoop(() => {
            // const camDiv = document.getElementById("camPosition");
            // this.#scene.registerBeforeRender(() => {
            //     if (camDiv) {
            //         const pos = this.#camera.position;
            //         camDiv.innerText = `x: ${pos.x.toFixed(2)}\ny: ${pos.y.toFixed(2)}\nz: ${pos.z.toFixed(2)}`;
            //     }
            // });
            this.#scene.render();
        });
    };

    dispose() : void
    {
        this.#engine.dispose();
        window.removeEventListener("resize", () => {
            this.#engine.dispose();
        });
    };
};