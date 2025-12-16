// import {ZoneName} from '../config.ts';

// import {
// Scene,
// Color3, 
// AbstractMesh,
// StandardMaterial,
// PBRMaterial,
// HighlightLayer
// } from '@babylonjs/core';

// import {pressButtonAnimation, applyTextureToMesh} from './utils.ts';

// import { SceneInteractor } from '../scene/SceneInteractor.ts';
// import { SceneManager } from '../scene/SceneManager.ts';
// import { navigateToZone } from '../CameraHistory.ts';

// export class TvHandler {
//     /**************************************************
//      *           PRIVATE ATTRIBUTES                   *
//      **************************************************/
//     private scene: Scene;
//     private sceneManager: SceneManager;
//     private sceneInteractor: SceneInteractor;
//     private clicTv: boolean;
//     private tvButtonMaterial: StandardMaterial | null;
//     private buttonHighlightLayer : HighlightLayer;
 
//     /**************************************************
//      *                  CONSTRUCTOR                   *
//      **************************************************/
//     constructor(scene: Scene, sceneManager: SceneManager, sceneInteractor: SceneInteractor) {
//         this.scene = scene;
//         this.sceneManager = sceneManager;
//         this.sceneInteractor = sceneInteractor;
//         this.clicTv = false;
//         this.tvButtonMaterial = null;
//         this.buttonHighlightLayer = new HighlightLayer("hlButton", this.scene);
        
//     }

//     /**************************************************
//      *               PRIVATE METHODS                 *
//      **************************************************/

//     private turnOnTv(tvMeshes: AbstractMesh[]): void {
//         const tvButton = tvMeshes[1];
//         if (!tvButton || this.tvButtonMaterial) return;
//             applyTextureToMesh(tvButton, this.scene, "/lockerRoom/textures/offTV.png");
//     }

//     private turnOffTv(tvMeshes: AbstractMesh[]): void {
//         const tvButton = tvMeshes[1];
//         if (!tvButton) return;
//         if (this.tvButtonMaterial) {
//             this.tvButtonMaterial.albedoTexture?.dispose();
//             this.tvButtonMaterial.dispose();
//             this.tvButtonMaterial = undefined;
//         }

//         const fallbackMat = new PBRMaterial("pbr_tv", this.scene);
//         fallbackMat.albedoColor = new Color3(1, 0.6, 0.6);
//         fallbackMat.metallic = 0;
//         fallbackMat.roughness = 1;
//         fallbackMat.backFaceCulling = false;

//         tvButton.material = fallbackMat;
//     }

//     /**************************************************
//      *                PUBLIC METHODS                  *
//      **************************************************/

//     public handle(pickedMesh : AbstractMesh, tvMeshes: AbstractMesh[]) : void{
//         if (!pickedMesh) return; 
    
//         if (pickedMesh === tvMeshes[0]){
//             // //Desactiver Interactions utilisateur
//             this.sceneInteractor.disableInteractions();
//             navigateToZone(this.sceneManager, ZoneName.SCREEN_TV, () => {
//                 this.sceneManager.setSpecificMesh(true);
//                 this.turnOnTv(tvMeshes); // visualiser les scores/match sur ecran
//                 this.clicTv = true;
//                 this.sceneInteractor.getHighlightLayer().removeMesh(tvMeshes[0]);
//                 this.buttonHighlightLayer.addMesh(tvMeshes[1], new Color3(1, 0.75, 0.8));
//                 //Reactiver interactions
//                 this.sceneInteractor.enableInteractions();
//             });
//         }
//         else if (pickedMesh === tvMeshes[1]){
//             if (this.clicTv){
//                 pressButtonAnimation(pickedMesh, this.scene, () => {
//                     this.turnOffTv(tvMeshes);
//                     this.sceneInteractor.disableInteractions();
//                     navigateToZone(this.sceneManager, ZoneName.LOCKER_ROOM, () => {
//                         this.buttonHighlightLayer.removeMesh(tvMeshes[1], new Color3(1, 0.75, 0.8));
//                         this.sceneManager.setSpecificMesh(false);
//                         this.clicTv = false;
//                         this.sceneInteractor.enableInteractions();
//                     });
//                 });
//             }
//         }
//     }

//     /**************************************************
//      *                       GETTERS                  *
//      **************************************************/
//     get getClicTv() : boolean {
//         return (this.clicTv);
//     }
// }