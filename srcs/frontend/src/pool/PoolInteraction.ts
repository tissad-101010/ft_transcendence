import { SceneInteractor } from '../scene/SceneInteractor.ts';
import { SceneManager } from '../scene/SceneManager.ts';
import { SpecificInteraction } from '../scene/SpecificInteraction.ts';
import { 
PointerInfo, 
Scene,
AbstractMesh,
Color3,
HighlightLayer,
DynamicTexture,
PBRMaterial,
Mesh
} from '@babylonjs/core';
import {ZoneName} from '../config.ts';

import { getCurrentGroup, setCurrentGroup, getTotalGroups, displayFriendsWithEmpty} from '../utils.ts';

import { Chat3D } from './Chat3D.ts';
import { UserX } from '../UserX.ts';

export class PoolInteraction implements SpecificInteraction {
    /**************************************************
     *           PRIVATE ATTRIBUTES                   *
     **************************************************/
    private scene: Scene;
    private sceneManager: SceneManager;
    private sceneInteractor: SceneInteractor;
    private clicLounge : boolean;
    private buttonHighlightLayer : HighlightLayer;
    private chat: Chat3D | null = null;
    private userX: UserX;

    /**************************************************
     *                  CONSTRUCTOR                   *
     **************************************************/
    constructor(scene: Scene, sceneManager: SceneManager, sceneInteractor: SceneInteractor) {
        this.scene = scene;
        this.sceneManager = sceneManager;
        this.sceneInteractor = sceneInteractor;
        this.clicLounge = false;
        this.buttonHighlightLayer = new HighlightLayer("h2Button", this.scene);
        this.userX = this.sceneManager.getUserX;
        
        const buttonMeshes = this.sceneManager.getLoadedMeshes["buttonsPool"];

        displayFriendsWithEmpty(
            this.scene,
            this.userX.getFriends,
            this.sceneManager.getLounge
        );
        this.updateButtons(buttonMeshes);
    }
    
    /**************************************************
    *                PRIVATE METHODS                 *
    **************************************************/
    private handleButtonPool(mesh: AbstractMesh, active: boolean): void {
        if (active) {
            mesh.isPickable = true;
            this.buttonHighlightLayer.addMesh((mesh as Mesh), new Color3(0.53, 0.81, 0.92)); // bleu ciel
        } else {
            mesh.isPickable = false;
            this.buttonHighlightLayer.removeMesh((mesh as Mesh));
        }
    }

    private updateButtons(buttonMeshes: AbstractMesh[]): void {
        const current = getCurrentGroup(ZoneName.LOUNGE);
        const total = getTotalGroups(ZoneName.LOUNGE, this.userX.getFriends.length);
        if (buttonMeshes[0]){
            this.handleButtonPool(buttonMeshes[0], current > 0);
        }
        if (buttonMeshes[1]){
            this.handleButtonPool(buttonMeshes[1], current < total - 1);
        }
    }

    // private handleFriendsProfile(mesh: AbstractMesh, buttonMeshes: AbstractMesh[]): void {
    //     displayFriendsWithEmpty(this.scene, this.userX.getFriends, this.sceneManager.getLounge);
    //     this.updateButtons(buttonMeshes);
    //     this.sceneInteractor.enableInteractions();
    // }

    /**************************************************
     *                PUBLIC METHODS                  *
    **************************************************/
    public resetState(buttonMeshes: AbstractMesh[]): void {
        setCurrentGroup(ZoneName.LOUNGE, 0, this.userX.getFriends, this.scene);
        this.sceneManager.getLounge.forEach((mesh : AbstractMesh) => {
            const mat = mesh.material as PBRMaterial;
            if (!mat) return;

            const dynTex = (mat as any)._loginTexture as DynamicTexture;
            if (dynTex) {
                const ctx = dynTex.getContext();
                ctx.clearRect(0, 0, 1024, 1024);
                dynTex.update();
            }
        });
        this.buttonHighlightLayer.removeAllMeshes();
        this.sceneInteractor.getHighlightLayer().removeAllMeshes();
    }

    public leave(buttonMeshes: AbstractMesh[])
    {
        this.resetState(buttonMeshes);
        this.updateButtons(buttonMeshes);
        this.chat = null;
    }

    public handlePointer(pointerInfo: PointerInfo, isClick: boolean, mesh: AbstractMesh): void {
        if (!this.sceneInteractor.areInteractionsEnabled()) return;
        const pickedMesh = mesh;
        if (!pickedMesh)return;

        this.sceneManager.setSpecificMesh(false);
        const loungeMeshes = this.sceneManager.getLoadedMeshes["lounge"];
        const buttonMeshes = this.sceneManager.getLoadedMeshes["buttonsPool"];

        const nb = parseInt(pickedMesh.name[pickedMesh.name.length - 1]);
        const index = (getCurrentGroup(ZoneName.LOUNGE) * 6) + nb;
        if (isClick) {
            if (loungeMeshes.includes(pickedMesh))
            {
                if (index >= this.userX.getFriends.length)
                    return ;
                if (this.chat === null)
                    this.chat = new Chat3D(
                        this.scene,
                        buttonMeshes[2],
                        this.userX.getFriends[index],
                        this.userX,
                        this.sceneManager,
                        this
                    );
                else
                    this.chat.updateChat(this.userX.getFriends[index]);
            }
            else if (buttonMeshes.includes(pickedMesh)) {
                const current = getCurrentGroup(ZoneName.LOUNGE);
                if (pickedMesh === buttonMeshes[0]) {
                    setCurrentGroup(ZoneName.LOUNGE, current - 1, this.userX.getFriends, this.scene);
                    this.updateButtons(buttonMeshes);
                } else if (pickedMesh === buttonMeshes[1]) {
                    setCurrentGroup(ZoneName.LOUNGE, current + 1, this.userX.getFriends, this.scene);
                    this.sceneManager.setSpecificMesh(false);
                    this.updateButtons(buttonMeshes);
                }
            }
        }
         else {
            this.sceneInteractor.getHighlightLayer().removeAllMeshes();
            if (loungeMeshes.includes(pickedMesh) && index < this.userX.getFriends.length)
                    this.sceneInteractor.getHighlightLayer().addMesh((pickedMesh as Mesh), new Color3(1, 0.75, 0.8));
        }
    }

    public dispose(): void {
        this.buttonHighlightLayer.removeAllMeshes();
        this.sceneInteractor.getHighlightLayer().removeAllMeshes();
        this.buttonHighlightLayer.dispose();
        this.clicLounge = false;        
        this.sceneInteractor.enableInteractions();
        const buttonMeshes = this.sceneManager.getLoadedMeshes["buttonsPool"];
        if (buttonMeshes && Array.isArray(buttonMeshes)) {
            buttonMeshes.forEach(mesh => {
                if (!this.chat || mesh !== (this.chat as any).mesh) {
                    mesh.isPickable = false;
                }
            });
        }
        this.sceneManager.getLounge.forEach((mesh : AbstractMesh) => {
            const mat = mesh.material as PBRMaterial;
            if (!mat) return;

            const dynTex = (mat as any)._loginTexture as DynamicTexture;
            if (dynTex) {
                const ctx = dynTex.getContext();
                ctx.clearRect(0, 0, 1024, 1024);
                dynTex.update();
            }
        });
        if (this.chat) {
            this.chat.dispose();
            this.chat = null;
        }
        this.resetState(this.sceneManager.getLoadedMeshes["buttonsPool"]);
    }
}
