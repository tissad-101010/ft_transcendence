import {
  Scene,
  FreeCamera,
  Color3,
  AbstractMesh,
  PointerEventTypes,
  HighlightLayer,
  PointerInfo
} from '@babylonjs/core';
import "@babylonjs/loaders";
import { SceneManager } from './SceneManager.ts';
import { SpecificInteraction } from './SpecificInteraction.ts';
import { ZoneName } from "../config.ts";
import { LockerInteraction } from '../lockerRoom/LockerInteraction.ts';
import { PoolInteraction } from '../pool/PoolInteraction.ts';
import { StandsInteraction } from '../field/StandsInteraction.ts';


export class SceneInteractor {
    /**************************************************
     *           PRIVATE ATTRIBUTES                   *
     **************************************************/
    private scene: Scene;
    private highlightLayer: HighlightLayer;
    private interactiveMainMeshes: string[] = [];
    private sceneManager: SceneManager;
    private lastHoveredMesh: AbstractMesh | null = null;
    private currSpecificInteraction: SpecificInteraction | null = null;
    private interactionsEnabled: boolean = true;
    private fieldTest: boolean = false;

    /**************************************************
     *                  CONSTRUCTOR                   *
     **************************************************/
    constructor(scene: Scene, freeCamera : FreeCamera, sceneManager: SceneManager){
        this.sceneManager = sceneManager;
        this.scene = scene;
        this.highlightLayer = new HighlightLayer("hl", this.scene);
        this.interactiveMainMeshes = [
            ZoneName.POOL,
            ZoneName.LOCKER_ROOM,
            ZoneName.STANDS,
        ];
    }


    /**************************************************
     *               PRIVATE METHODS                 *
     **************************************************/
     private handlePointer(pointerInfo: PointerInfo, isClick: boolean) : void {
        if (!this.interactionsEnabled)
        {
            return;
        }  // <- Empêche les clics/survols
        if (!pointerInfo.pickInfo)
        {
            return;
        }   
        const pickRes = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
        const pickedMesh = pickRes?.pickedMesh;

        // console.log(pickedMesh.name);
        
        //Je veux pouvoir survoler juste l echelle etd
        //Pour tous les survols global
        if (!isClick && pickedMesh && this.interactiveMainMeshes.includes(pickedMesh.name) && !this.sceneManager.getSpecificMesh) {
            // highlight zone principale au survol
            this.highlightLayer.removeAllMeshes();
            if (!pickedMesh.metadata?.ignoreHighlight)
                this.highlightLayer.addMesh(pickedMesh, Color3.White());
            if (pickedMesh.metadata?.ignoreHighlight)
                this.meshPickable(pickedMesh);
        }
        if (isClick && pickedMesh && this.interactiveMainMeshes.includes(pickedMesh.name) &&
            !this.sceneManager.getSpecificMesh)
            this.handleMainZoneClick(pickedMesh, true);

        if (pickedMesh && !this.interactiveMainMeshes.includes(pickedMesh.name)){
            this.currSpecificInteraction?.handlePointer(pointerInfo, isClick, pickedMesh);
        }
    }

    public handleMainZoneClick(pickedMesh: AbstractMesh, isClick: boolean) : void {
        if (this.currSpecificInteraction) {
            this.currSpecificInteraction.dispose();
            this.currSpecificInteraction = null;
        }
        this.highlightLayer.removeAllMeshes();
        if (this.lastHoveredMesh && this.lastHoveredMesh !== pickedMesh)
            this.meshPickable(this.lastHoveredMesh);

        this.meshUnpickable(pickedMesh);
        this.lastHoveredMesh = pickedMesh;

        const zoneName = pickedMesh.name as ZoneName;
        if (Object.values(ZoneName).includes(zoneName)) {
            this.disableInteractions(); //desactiver clic/survol avant le mouvement
            this.sceneManager.moveCameraTo(zoneName, () => {
                this.enableInteractions(); //reactiver clic/survol
                switch (zoneName) {
                    case ZoneName.POOL:
                        this.currSpecificInteraction = new PoolInteraction(this.scene, this.sceneManager, this);
                        //Ajout start une fois dans la piscine
                        if (!this.interactiveMainMeshes.includes(ZoneName.START)) {
                            this.interactiveMainMeshes.push(ZoneName.START);
                        }
                        break;
                    case ZoneName.STANDS:
                        this.currSpecificInteraction = new StandsInteraction(this.scene, this.sceneManager, this);
                        break;
                    case ZoneName.LOCKER_ROOM:
                        this.currSpecificInteraction = new LockerInteraction(this.scene, this.sceneManager, this);
                        break;
                    case ZoneName.START:
                        if (this.currSpecificInteraction instanceof PoolInteraction) {
                            this.currSpecificInteraction.resetState(this.sceneManager.getLounge);
                        }
                        this.currSpecificInteraction = null;
                        this.removeInteractiveMesh(ZoneName.START);
                        break;
                    default:
                        this.currSpecificInteraction = null;
                }
            });
        }
    }

    /**************************************************
     *                PUBLIC METHODS                  *
     **************************************************/
    public enableInteractionScene(): void {
        this.scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
            const isClick = pointerInfo.type === PointerEventTypes.POINTERPICK;
            const isHover = pointerInfo.type === PointerEventTypes.POINTERMOVE;
            if (isClick || isHover)
                this.handlePointer(pointerInfo, isClick);
        });
    }


    public meshPickable(mesh: AbstractMesh) : void{
        mesh.metadata.ignoreHighlight = false;
        mesh.isPickable = true;
    }

    public meshUnpickable(mesh: AbstractMesh) : void{
        mesh.metadata.ignoreHighlight = true;
        mesh.isPickable = false;  
    }


    public disableInteractions() : void {
        this.interactionsEnabled = false;
    }

    public enableInteractions() : void {
        this.interactionsEnabled = true;
    }

        // 🔹 Ajouter un mesh interactif
    public addInteractiveMesh(zone: ZoneName): void {
        if (!this.interactiveMainMeshes.includes(zone)) {
            this.interactiveMainMeshes.push(zone);
        }
    }

    // 🔹 Retirer un mesh interactif
    public removeInteractiveMesh(zone: ZoneName): void {
        this.interactiveMainMeshes = this.interactiveMainMeshes.filter(z => z !== zone);
    }
    /**************************************************
     *                    GETTERS                     *
    **************************************************/
   public getHighlightLayer(): HighlightLayer {
       return this.highlightLayer;
    }
    
    public areInteractionsEnabled(): boolean {
        return this.interactionsEnabled;
    }
    
        // 🔹 Getter simple
    public getInteractiveMeshes(): string[] {
        return this.interactiveMainMeshes;
    }

    setFieldTest(b: boolean)
    {
        this.fieldTest = b;
    }

    get getTest()
    {
        return (this.fieldTest);
    }
}

