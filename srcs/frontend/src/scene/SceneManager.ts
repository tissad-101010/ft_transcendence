import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  SceneLoader,
  HDRCubeTexture,
  Animation,
  AbstractMesh,
  FreeCameraMouseInput,
  Texture,
  ParticleSystem,
  Mesh
} from '@babylonjs/core';
import "@babylonjs/inspector";
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";

import { SceneInteractor } from './SceneInteractor.ts';
import { CAMERA_CONFIGS, ZoneName, meshNamesByZone } from "../config.ts";

import { 
normalizeRotation,
displayPlayers, 
groupConfigs,
Player
 } from '../utils.ts';

import { UserX } from '../UserX.ts';
import { LightInteractor } from './LightInteractor.ts'

const fieldMeshNames = [
    ...meshNamesByZone.field.arbitrator,
    ...meshNamesByZone.field.spectator,
    ...meshNamesByZone.field.buttonsField,
    ...meshNamesByZone.field.scoreBoard
];

const lockerMeshNames = [
    ...meshNamesByZone.lockerRoom.field,
    ...meshNamesByZone.lockerRoom.tv,
    ...meshNamesByZone.lockerRoom.score,
    ...meshNamesByZone.lockerRoom.locker,
    ...meshNamesByZone.lockerRoom.furniture
];

const poolMeshNames = [
    ...meshNamesByZone.pool.lounge,
    ...meshNamesByZone.pool.buttonsPool,
];

export class SceneManager {
    /**************************************************
     *           PRIVATE ATTRIBUTES                   *
     **************************************************/
    private scene: Scene;
    private freeCamera : FreeCamera;
    private engine: Engine;
    private canvas: HTMLCanvasElement;
    private sceneInteractor: SceneInteractor | null = null;
    private limitCameraRotation: boolean = true;
    private loadedMeshes: {[zone: string]: AbstractMesh[]} = {};
    private meshMap: Record<string, AbstractMesh> = {};
    private _specificMesh : boolean = false;
    private _tshirtMeshes: AbstractMesh[] = [];
    private _chairMeshes: AbstractMesh[] = [];
    private _loungeMeshes: AbstractMesh[] = [];
    private lightInteractor! : LightInteractor;
    private advancedTexture : AdvancedDynamicTexture | null = null;
    private userX: UserX;

    /**************************************************
    *                 CONSTRUCTOR                     *
    **************************************************/
    constructor(
        canvas: HTMLCanvasElement
    )
    {
        this.canvas = canvas;
        this.engine = new Engine(canvas, true);
        this.scene = new Scene(this.engine);
        this.freeCamera = new FreeCamera("freeCamera", new Vector3(-5, 17, 3), this.scene);
        this.userX = new UserX(this);

        const degToRad = (deg: number) => deg * Math.PI / 180;
        this.freeCamera.rotation = new Vector3(
            degToRad(-7),
            degToRad(-175),
            0
        );
        this.freeCamera.attachControl(canvas, true);

        // Bloque deplacements clavier
        this.freeCamera.keysUp = [];
        this.freeCamera.keysDown = [];
        this.freeCamera.keysLeft = [];
        this.freeCamera.keysRight = [];
        //Bloque zoom molette
        this.freeCamera.inputs.attached.mousewheel?.detachControl();
        this.scene.activeCamera = this.freeCamera;
        window.addEventListener("resize", this.onResize);
    }

    /**************************************************
     *               PRIVATE METHODS                  *
     **************************************************/

    private onResize = () => {
        this.engine.resize();
    }

    private buildMeshMap(): void {
        this.meshMap = {};
        this.scene.meshes.forEach((mesh : AbstractMesh) => {
            this.meshMap[mesh.name] = mesh;
        });
    }

    private setupHDR(): void
    {
        const hdrTexture = new HDRCubeTexture("env.hdr", this.scene, 2048);
        this.scene.environmentTexture = hdrTexture;
        const skybox = this.scene.createDefaultSkybox(hdrTexture, true, 2500, 0);
        this.scene.imageProcessingConfiguration.exposure = 0.9;
    }

    private createClouds(): void
    {
        const cloudSystem = new ParticleSystem("clouds", 40, this.scene); // 50 nuages max
        cloudSystem.particleTexture = new Texture("/lockerRoom/textures/cloud.png", this.scene);

        cloudSystem.emitter = new Vector3(0, 7, 0);
        cloudSystem.minEmitBox = new Vector3(-200, 5, -200);
        cloudSystem.maxEmitBox = new Vector3(200, 50, 200);

        // Taille
        cloudSystem.minSize = 50;
        cloudSystem.maxSize = 120;

        cloudSystem.minLifeTime = 500;
        cloudSystem.maxLifeTime = 1000;

        // Deplacement
        cloudSystem.direction1 = new Vector3(-1, 0, -1);
        cloudSystem.direction2 = new Vector3(1, 0, 1);
        cloudSystem.gravity = new Vector3(0, 0, 0);

        cloudSystem.blendMode = ParticleSystem.BLENDMODE_STANDARD;
        cloudSystem.manualEmitCount = 50;
        cloudSystem.start();

        this.scene.onBeforeRenderObservable.add(() => {
        const t = Date.now() * 0.001;
        cloudSystem.particles.forEach((p, i) => {
            // fréquence plus lente (0.2) + amplitude douce (0.01)
            p.position.y += Math.sin(t * 0.8 + i) * 0.02; 
            p.color.r = 1.0;
            p.color.g = 1;
            p.color.b = 1;
            p.color.a = 0.15;
            });
        });
    }

    private async setupMeshes(): Promise<void> 
    {
        this.createClouds();

        await SceneLoader.AppendAsync("/pool/", "strucPool.glb", this.scene);
        await SceneLoader.AppendAsync("/lockerRoom/", "strucLocker.glb", this.scene);
        await SceneLoader.AppendAsync("/field/", "strucField.glb", this.scene);

        // Construire le cache une seule fois
        this.buildMeshMap();

        // Maintenant, les lookup sont directs (plus rapides)
        this.loadedMeshes["pool"] = this.convertToAbstractMesh(poolMeshNames);
        this.loadedMeshes["lockerRoom"] = this.convertToAbstractMesh(lockerMeshNames);
        this.loadedMeshes["field"] = this.convertToAbstractMesh(fieldMeshNames);

        // Chargement des meshs et conversion en abstract LOCKERROOM
        this.loadedMeshes["tv"] = this.convertToAbstractMesh(meshNamesByZone.lockerRoom.tv);
        this.loadedMeshes["score"] = this.convertToAbstractMesh(meshNamesByZone.lockerRoom.score);
        this.loadedMeshes["locker"] = this.convertToAbstractMesh(meshNamesByZone.lockerRoom.locker);
        this.loadedMeshes["field"] = this.convertToAbstractMesh(meshNamesByZone.lockerRoom.field);

        // Chargement des meshs et conversion en abstract FIELD
        this.loadedMeshes["arbitrator"] = this.convertToAbstractMesh(meshNamesByZone.field.arbitrator);
        this.loadedMeshes["seatsFriends"] = this.convertToAbstractMesh(meshNamesByZone.field.seatsFriends);
        this.loadedMeshes["spectator"] = this.convertToAbstractMesh(meshNamesByZone.field.spectator);
        this.loadedMeshes["buttonsField"] = this.convertToAbstractMesh(meshNamesByZone.field.buttonsField);
        this.loadedMeshes["scoreBoard"] = this.convertToAbstractMesh(meshNamesByZone.field.scoreBoard);

        // Chargement des meshs et conversion en abstract POOL
        this.loadedMeshes["lounge"] = this.convertToAbstractMesh(meshNamesByZone.pool.lounge);
        this.loadedMeshes["buttonsPool"] = this.convertToAbstractMesh(meshNamesByZone.pool.buttonsPool);

        this._tshirtMeshes = Object.values(this.meshMap).filter(m => m.name.startsWith("tshirt"));
        groupConfigs.tshirt.meshes = this._tshirtMeshes;
        if (this.userX.getTournament)
            displayPlayers(this.scene, this.userX.getTournament.getParticipants, this._tshirtMeshes);

        this._chairMeshes = Object.values(this.meshMap)
            .filter(m => m.name.startsWith("chair"))
            .sort((a, b) => a.name.localeCompare(b.name));
        groupConfigs.chair.meshes = this._chairMeshes;

        this._loungeMeshes = Object.values(this.meshMap)
            .filter(m => m.name.startsWith("lounge"))
            .sort((a, b) => a.name.localeCompare(b.name));
        groupConfigs.lounge.meshes = this._loungeMeshes;

        // this.scene.environmentIntensity = 0.5;
        this.scene.lightsEnabled = true;

        this.lightInteractor = new LightInteractor(this.scene);
        this.lightInteractor.turnOnLights();

        this.sceneInteractor = new SceneInteractor(this.scene, this.freeCamera, this);
        this.sceneInteractor.enableInteractionScene();
    }


    private convertToAbstractMesh(
        names: string[]
    ): AbstractMesh[] 
    {
        return names
            .map(name => this.meshMap[name])
            .filter((m): m is AbstractMesh => m !== undefined);
    }


    private enableRotationOnly() : void {
        this.freeCamera.inputs.clear();
        this.freeCamera.attachControl(this.canvas, true);
        const mouseInput = new FreeCameraMouseInput();
        this.freeCamera.inputs.add(mouseInput);
    }
private resetInteractions(): void {
    // Si tu as un SceneInteractor
    if (this.sceneInteractor) {
        this.sceneInteractor.disableInteractions(); // désactive tout
        this.sceneInteractor.enableInteractionScene();  // réactive pour la nouvelle caméra
    }
    
    // Optionnel : réattacher la caméra au canvas
    this.freeCamera.detachControl();
    this.freeCamera.attachControl(this.canvas, true);
    
    // Si tu limites la rotation
    if (this.limitCameraRotation) this.enableRotationOnly();
}


    /**************************************************
     *                PUBLIC METHODS                  *
     **************************************************/
    public moveCameraTo(
        zoneName: ZoneName,
        onArrived?: () => void
    ) 
    {
        const config = CAMERA_CONFIGS[zoneName];
        if (!config) return;

        this.freeCamera.detachControl();
        this.freeCamera.inputs.clear();

        Animation.CreateAndStartAnimation(
            "cameraMove",
            this.freeCamera,
            "position",
            60,
            60,
            this.freeCamera.position.clone(),
            config.position,
            Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        if (config.rotation) {
            const startRotation = normalizeRotation(this.freeCamera.rotation);
            Animation.CreateAndStartAnimation(
                "cameraRotate",
                this.freeCamera,
                "rotation",
                60,
                60,
                startRotation,
                config.rotation,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
                undefined,
                () => {
                    this.freeCamera.rotation.copyFrom(config.rotation);

                    if (zoneName === ZoneName.POOL || zoneName === ZoneName.SCREEN_TV ||
                        zoneName === ZoneName.SCOREBOARD || zoneName.includes(ZoneName.TSHIRT)
                        || zoneName === ZoneName.SEAT || zoneName === ZoneName.ARBITRATOR
                        || zoneName === ZoneName.FIELD || zoneName === ZoneName.WINNERPOV) {
                        // Vue complètement figee
                        this.freeCamera.inputs.clear();
                        this.freeCamera.detachControl();
                    } else {
                        // Vue avec rotation souris uniquement
                        this.limitCameraRotation = true;
                        this.enableRotationOnly();
                    }

                    if (typeof onArrived === "function")
                        onArrived();
                }
            );
        } else {
            if (zoneName === ZoneName.POOL || zoneName === ZoneName.SCREEN_TV ||
                zoneName === ZoneName.SCOREBOARD|| zoneName.includes(ZoneName.TSHIRT)
                || zoneName === ZoneName.SEAT || zoneName === ZoneName.ARBITRATOR || zoneName === ZoneName.FIELD) {
                this.freeCamera.inputs.clear();
                this.freeCamera.detachControl();
            } else
                this.enableRotationOnly();
            // if (typeof onArrived === "function")
                // console.log("Bien arrive 2");
        }
    }

    public async setupEnvironment(): Promise<void> {
        // this.setupHDR();
        await this.setupMeshes(); // attendre les GLB
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
    }

    public startRenderLoop(): void
    {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    public cleanRender(): void
    {
        this.engine.dispose();
        window.removeEventListener("resize", this.onResize);
    }

    /**************************************************
     *                    GETTERS                     *
     **************************************************/
    public get getLoadedMeshes(): { [zone: string]: AbstractMesh[] } 
    {
        return this.loadedMeshes;
    }

    getMesh(
        zone: string
    ) : AbstractMesh[]
    {
        return (this.loadedMeshes[zone]);
    }

    public get getSceneInteractor() : SceneInteractor | null
    {
        return (this.sceneInteractor);
    }

    public get getFreeCamera() : FreeCamera 
    {
        return this.freeCamera;
    }

    public get getChair(): AbstractMesh[] 
    {
        return this._chairMeshes;
    }

    public get getLounge(): AbstractMesh[] 
    {
        return this._loungeMeshes;
    }

    public get getTshirt() : AbstractMesh[]
    {
        return (this._tshirtMeshes)
    }

    public get getUserX() : UserX
    {
        return (this.userX);
    }

    public get getSpecificMesh() : boolean
    {
        return this._specificMesh;
    }

    public getScene() : Scene
    {
        return (this.scene);
    }

    public getLights() : LightInteractor
    {
        return (this.lightInteractor);
    }

    // /**************************************************
    //  *                    SETTERS                     *
    //  **************************************************/
    public setSpecificMesh(value: boolean): void 
    {
        this._specificMesh = value;
    }

    public set setUser(user: any)
    {
        this.userX.setUser = user;
    }
}