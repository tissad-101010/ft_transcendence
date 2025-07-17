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
import Game3D from './Game/Game3D.ts';

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

export default class World3D
{

    #world: IWorld;
    #canvas: HTMLCanvasElement;
    #engine: Engine;
    #scene: Scene;
    #camera: FreeCamera;
    #keys: Set<string>;
    #game3D: Game3D | null;

    constructor(logic: worldLogic, canvas: HTMLCanvasElement, worldPath: IPathMesh)
    {
        this.#world = {logic: logic, mesh: null, meshPath: worldPath};
        this.#game3D = null;
        this.#canvas = canvas;
        this.#keys = new Set<string>();
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


        // TMP : RECUPERE LE MESH REPRESENTANT LE TERRAIN, UTILE POUR LA CAMERA POUR LE MOMENT
        // const test = this.#scene.getMeshByName("Terrain");
        // if (!test)
        // {
        //     console.error("Mesh Terrain pas trouve");
        //     return ;
        // }

        // console.log("Donnees sur mon mesh : ");
        // const boundingInfo = test.getBoundingInfo();
        // const minimum = boundingInfo.minimum;
        // const maximum = boundingInfo.maximum;

        // const size = maximum.subtract(minimum);
        // console.log("Largeur (x):", size.x);
        // console.log("Hauteur (y):", size.y);
        // console.log("Profondeur (z):", size.z);


        //AFFICHE TOUS LES MESHS
        // if (this.#scene.meshes.length === 0)
        //     console.log("Aucun mesh !");
        // this.#scene.meshes.forEach((mesh) => {
        //     console.log(mesh.name);
        // });

    };

    start() : void
    {
        // TEST POUR UN MATCH
        const testRules = {
            scoreMax: 5,
            ballSpeed: 2,
            playerSpeed: 3,
            countDownGoalTime: 3,
            allowPause: true
        }
        if (this.#world.logic.createGame(testRules))
        {
            const game = this.#world.logic.game;
            try
            {
                this.#game3D = new Game3D(game, this.#scene);
                if (!this.#game3D.loadMeshes())
                {
                    console.error("ERROR LORS DE LA RECUPERATION DES MESHS");
                    return ;
                }
                
            } catch (error: unknown)
            {
                if (error instanceof Error)
                    console.error(error.message);
                else
                    console.error("erreur inconnue");
            }
        }

        if (!this.#game3D)
        {
            console.error("game3D est null")   
            return ;
        }
        this.#camera = new ArcRotateCamera("arcCamera", 
            Math.PI / 2,   // alpha
            Math.PI / 4,   // beta
            50,           // radius
            this.#game3D.fieldMesh,    // <--- ICI tu mets le mesh directement
            this.#scene
        );
        // /////////////////////

        this.#world.logic.gameManager.start();

        // A changer de place plus tard (Utile pour le gameplay)
        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.keyUpHandler = this.keyUpHandler.bind(this);
        window.addEventListener("keydown", this.keyDownHandler);
        window.addEventListener("keyup", this.keyUpHandler);
        /////////////////////////////////////////////////////////


        this.#scene.onBeforeRenderObservable.add(() => {
            if (this.#world.logic.game && this.#world.logic.game.state !== 0)
                this.#game3D?.update(this.#keys);
        });

        this.#engine.runRenderLoop(() => {
            const camDiv = document.getElementById("camPosition");
            this.#scene.registerBeforeRender(() => {
                if (camDiv) {
                    const pos = this.#camera.position;
                    camDiv.innerText = `x: ${pos.x.toFixed(2)}\ny: ${pos.y.toFixed(2)}\nz: ${pos.z.toFixed(2)}`;
                }
            });
            this.#scene.render();
        });
    };

    dispose() : void
    {
        this.#engine.dispose();
    };
};