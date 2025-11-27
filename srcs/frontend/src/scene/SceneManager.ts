import {
  Engine,
  Scene,
  FreeCamera,
  Vector3,
  SceneLoader,
  HDRCubeTexture,
  PhotoDome,
  Animation,
  AbstractMesh,
  FreeCameraMouseInput,
  Texture,
  ParticleSystem,
} from '@babylonjs/core';
import "@babylonjs/inspector";
import { SceneInteractor } from './SceneInteractor.ts';
import { AdvancedDynamicTexture, TextBlock } from "@babylonjs/gui";
import { CAMERA_CONFIGS, ZoneName, meshNamesByZone } from "../config.ts";
import { 
normalizeRotation,
displayPlayers, 
groupConfigs,
Player,
Friend
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

//NE PAS TOUCHER!
const meshNamesZones = ["stands", "furniture", "chair03"];

interface CameraState {
  position: Vector3;
  rotation: Vector3;
  zone?: ZoneName;
}


export class SceneManager {
    /**************************************************
     *           PRIVATE ATTRIBUTES                   *
     **************************************************/
    private scene: Scene;
    private freeCamera : FreeCamera;
    private engine: Engine;
    private canvas: HTMLCanvasElement;
    private sceneInteractor: SceneInteractor | null = null;
    private advancedTexture: AdvancedDynamicTexture;
    private limitCameraRotation: boolean = true;
    private loadedMeshes: {[zone: string]: AbstractMesh[]} = {};
    private meshMap: Record<string, AbstractMesh> = {};
    private _specificMesh : boolean = false;
    

private players: Player[] = [
    { id: 1, login: "RetroKid" },
    { id: 2, login: "SpaceAce" },
    { id: 3, login: "PixelQueen" },
    { id: 4, login: "NeoPong" },
    { id: 5, login: "LoLMaster" },
    { id: 6, login: "FastFingers" },
    { id: 0, login: "Nostag" },
    { id: 8, login: "Tissad" },
    { id: 9, login: "CyberSam" },
    { id: 10, login: "GlitchGuru" },
    { id: 11, login: "PixelKnight" },
    { id: 12, login: "MegaMage" },
    { id: 13, login: "RocketRex" },
    { id: 14, login: "ShadowFox" },
    { id: 15, login: "TurboTiger" },
    { id: 16, login: "QuantumQuill" },
    { id: 17, login: "BlazeWolf" },
    { id: 18, login: "CrystalCat" },
    { id: 19, login: "NovaNinja" },
    { id: 20, login: "PixelPilot" },
    { id: 21, login: "LunarLion" },
    { id: 22, login: "StarStriker" },
    { id: 23, login: "FrostFalcon" },
    { id: 24, login: "VortexViper" },
    { id: 25, login: "EchoEagle" },
    { id: 26, login: "MysticMoth" },
];

    private friends: Friend[] = [
    { login: "Bestie1" },
    { login: "Bestie2" },
    { login: "Bestie3" },
    { login: "Bestie4" },
    { login: "Bestie5" },
    { login: "Bestie6" },
    { login: "Bestie7" },
    { login: "Bestie8" },


    ];
    private _tshirtMeshes: AbstractMesh[] = [];
    private _chairMeshes: AbstractMesh[] = [];
    private _loungeMeshes: AbstractMesh[] = [];
    // private lightInteractor : LightInteractor;
    private lightInteractor! : LightInteractor;
    private cameraHistory: CameraState[] = [];
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
        Engine.MaxSimultaneousLights = 8; // ici, avant de créer la scène ou les materials
        this.scene = new Scene(this.engine);
        this.freeCamera = new FreeCamera("freeCamera", new Vector3(-5, 17, 3), this.scene);
        // this.lightInteractor = new LightInteractor(this.scene);
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
        this.scene.meshes.forEach(mesh => {
            this.meshMap[mesh.name] = mesh as AbstractMesh;
        });
    }

    private debug()
    {
        this.scene.debugLayer.show();
        console.table(
            this.scene.meshes.map(m => ({
                name: m.name,
                indices: m.getTotalIndices(),
                vertices: m.getTotalVertices(),
                triangles: m.getTotalIndices() / 3
            })).sort((a, b) => b.indices - a.indices).slice(0, 10)); 
        this.scene.debugLayer.showBoundingBoxes = true;
    }


    private setupHDR(): void
    {
        const hdrTexture = new HDRCubeTexture("env.hdr", this.scene, 2048);
        this.scene.environmentTexture = hdrTexture;

        const hdrSkyDome = new PhotoDome(
        "skyDome",
        "env.hdr",
        { resolution: 64, size: 1000 },
        this.scene
        );
        this.scene.imageProcessingConfiguration.exposure = 1.5;
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

        this.freeCamera.detachControl(this.canvas);
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
                        this.freeCamera.detachControl(this.canvas);
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
                this.freeCamera.detachControl(this.canvas);
            } else
                this.enableRotationOnly();
            if (typeof onArrived === "function")
                console.log("Bien arrive 2");
        }
    }

    public async setupEnvironment(): Promise<void> {
        // this.setupHDR();
        await this.setupMeshes(); // attendre les GLB
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI", true, this.scene);
        // this.createCoordinateLabels();
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

    public get getPlayers() : Player[] 
    {
        return this.players;
    }

    public get getFriends(): Friend[] 
    {
        return this.friends;
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

    public getAllZoneMeshes(): AbstractMesh[] {
        // Récupère toutes les valeurs de l'enum ZoneName (chaînes)
        const zoneNamesAsStrings: string[] = ["stands", "border", "furniture", "buttonPoolExit0"];
        // const zoneNamesAsStrings: string[] = ["stands", "border", "furniture", "buttonPoolExit0"];
        // const zoneNamesAsStrings: string[] = Object.values(ZoneName);
        // console.log("voici les zones name dans mon ")
        // Convertit chaque nom en AbstractMesh via le meshMap
        const meshes: AbstractMesh[] = zoneNamesAsStrings
            .map(name => this.meshMap[name])
            .filter((m): m is AbstractMesh => m !== undefined); // filtre les undefined

        return meshes;
    }

    // /**************************************************
    //  *                    SETTERS                     *
    //  **************************************************/
    private createCoordinateLabels(): void 
    {
        const label = new TextBlock();
        label.color = "black";
        label.fontSize = 14;
        label.left = "10px";
        label.top = "10px";
        label.textHorizontalAlignment = TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
        label.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_TOP;

        this.advancedTexture.addControl(label);

        const radToDeg = (rad: number) => (rad * 180 / Math.PI).toFixed(1);

        this.scene.registerBeforeRender(() => {
            const pos = this.freeCamera.position;
            const rot = this.freeCamera.rotation;

            label.text = 
            `Caméra:\n` +
            `Pos: x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)}\n` +
            `Rot: x: ${radToDeg(rot.x)}°, y: ${radToDeg(rot.y)}°, z: ${radToDeg(rot.z)}°`;
        });
    }

    public setSpecificMesh(value: boolean): void 
    {
        this._specificMesh = value;
    }

    public set setUser(user: any)
    {
        this.userX.setUser = user;
    }
}