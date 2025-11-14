import { SceneInteractor } from '../scene/SceneInteractor.ts';
import { SceneManager } from '../scene/SceneManager.ts';
import { SpecificInteraction } from '../scene/SpecificInteraction.ts';
import { 
PointerInfo, 
Scene, 
Color3,
AbstractMesh,
Mesh,
PointLight
} from '@babylonjs/core';
import { TvHandler } from "./TvHandler.ts";
import { ScoreboardHandler } from "./ScoreboardHandler.ts";
import { TshirtHandler } from "./TshirtHandler.ts";


interface Lamp
{
    mesh: Mesh,
    light: PointLight
}

export class LockerInteraction implements SpecificInteraction {
    /**************************************************
     *           PRIVATE ATTRIBUTES                   *
     **************************************************/
    private scene: Scene;
    private sceneManager: SceneManager;
    private sceneInteractor: SceneInteractor;

    //Sous-classes
    private tvHandler: TvHandler;
    private scoreboardHandler : ScoreboardHandler;
    private tshirtHandler : TshirtHandler;

    /**************************************************
     *                  CONSTRUCTOR                   *
     **************************************************/
    constructor(scene: Scene, sceneManager: SceneManager, sceneInteractor: SceneInteractor) {
        console.log("Entree locker");
        this.scene = scene;
        this.sceneManager = sceneManager;
        this.sceneInteractor = sceneInteractor;

        this.tvHandler = new TvHandler(scene, sceneManager, sceneInteractor);
        this.scoreboardHandler = new ScoreboardHandler(scene, sceneManager, sceneInteractor);
        this.tshirtHandler = new TshirtHandler(scene, sceneManager, sceneInteractor);
    }

    /**************************************************
     *               PRIVATE METHODS                 *
     **************************************************/
    

    /**************************************************
     *                PUBLIC METHODS                  *
     **************************************************/
    public handlePointer(pointerInfo: PointerInfo, isClick: boolean, mesh: AbstractMesh): void {
        if (!this.sceneInteractor.areInteractionsEnabled()) return;
        const pickedMesh = mesh;
        if (!pickedMesh) return;

        const tvMeshes = this.sceneManager.getLoadedMeshes["tv"];
        const scoreMeshes = this.sceneManager.getLoadedMeshes["score"];
        const lockMeshes = this.sceneManager.getLoadedMeshes["locker"];

        if (isClick) {
            if (tvMeshes.includes(pickedMesh))
                this.tvHandler.handle(pickedMesh, tvMeshes);
            else if (scoreMeshes.includes(pickedMesh))
                this.scoreboardHandler.handle(pickedMesh, scoreMeshes);
            else if (lockMeshes.includes(pickedMesh))
                this.tshirtHandler.handle(pickedMesh, lockMeshes);
        } else {
            this.sceneInteractor.getHighlightLayer().removeAllMeshes();
            //Tv
            if (tvMeshes.includes(pickedMesh) && !this.tvHandler.getClicTv){
                this.sceneInteractor.getHighlightLayer().addMesh(tvMeshes[0], new Color3(1, 0.75, 0.8));
            }
            //Scoreboard
            if (scoreMeshes.includes(pickedMesh) && !this.scoreboardHandler.getClicScoreboard &&
                pickedMesh !== scoreMeshes[1])
                this.sceneInteractor.getHighlightLayer().addMesh(scoreMeshes[0], new Color3(1, 0.75, 0.8));
            else if (scoreMeshes.includes(pickedMesh) && this.scoreboardHandler.getClicScoreboard
                && pickedMesh !== scoreMeshes[0])
                this.sceneInteractor.getHighlightLayer().addMesh(scoreMeshes[1], new Color3(1, 1, 0.4)); //lolo 1
            //Vestiaire
            if (lockMeshes.includes(pickedMesh) && !pickedMesh.name.includes("button") && 
                pickedMesh !== lockMeshes[12]){
                this.sceneInteractor.getHighlightLayer().addMesh(pickedMesh, new Color3(1, 0.75, 0.8));
            }
            //Changer le hightligter de couleur juste pour l'exit de vestiaire
            else if (lockMeshes.includes(pickedMesh) && this.tshirtHandler.getClicTshirt
                && pickedMesh === lockMeshes[12])
                this.sceneInteractor.getHighlightLayer().addMesh(pickedMesh, new Color3(0.3, 0.7, 0.6));
        }
    }

    public dispose(): void {
        // console.log("LockerInteraction: nettoyage en cours...");

        // // this.sceneInteractor.getHighlightLayer().removeAllMeshes();

        // const tvMeshes = this.sceneManager.getLoadedMeshes["tv"];
        // const scoreMeshes = this.sceneManager.getLoadedMeshes["score"];
        // const lockMeshes = this.sceneManager.getLoadedMeshes["locker"];

        // if (tvMeshes) tvMeshes.forEach(mesh => mesh.isPickable = false);
        // if (scoreMeshes) scoreMeshes.forEach(mesh => mesh.isPickable = false);
        // if (lockMeshes) lockMeshes.forEach(mesh => mesh.isPickable = false);

        // if (this.tvHandler) (this.tvHandler as any).clicTv = false;
        // if (this.scoreboardHandler) (this.scoreboardHandler as any).clicScoreboard = false;
        // if (this.tshirtHandler) (this.tshirtHandler as any).clicTshirt = false;

        // this.sceneInteractor.enableInteractions();

        // console.log("LockerInteraction: nettoyage terminé.");
    }

  
}