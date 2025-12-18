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
Material,
Nullable,
Mesh
} from '@babylonjs/core';

import { ZoneName } from '../config.ts';
import {getCurrentGroup, setCurrentGroup, getTotalGroups, displayFriendsWithEmpty} from '../utils.ts';
import { FriendUI } from './FriendUI.ts';
import { MyProfilUI } from './MyProfilUI.ts';
import { navigateToZone } from '../CameraHistory.ts';


export class StandsInteraction implements SpecificInteraction {
    /**************************************************
     *           PRIVATE ATTRIBUTES                   *
     **************************************************/
    private scene: Scene;
    private sceneManager: SceneManager;
    private sceneInteractor: SceneInteractor;
    private clicSeat : boolean;
    private clicArbitrator : boolean;
    private buttonHighlightLayer : HighlightLayer;
    private test: boolean = false;
    private friendUI: FriendUI | null;
    private materials: Nullable<Material>[];
    private myProfilUI: MyProfilUI | null = null;

    /**************************************************
     *                  CONSTRUCTOR                   *
     **************************************************/
    constructor(scene: Scene, sceneManager: SceneManager, sceneInteractor: SceneInteractor) {
        this.scene = scene;
        this.sceneManager = sceneManager;
        this.sceneInteractor = sceneInteractor;
        this.clicSeat = false;
        this.clicArbitrator = false;
        this.buttonHighlightLayer = new HighlightLayer("hlButton", this.scene);
        this.friendUI = null;
        this.materials = [
            this.sceneManager.getMesh("scoreBoard")[0].material,
            this.sceneManager.getMesh("scoreBoard")[1].material,
            this.sceneManager.getMesh("scoreBoard")[2].material
        ];
    }

    /**************************************************
     *               PRIVATE METHODS                  *
     **************************************************/    
    private handleButtonField(
        mesh: AbstractMesh,
        active: boolean
    ): void 
    {
        if (active) {
            mesh.isPickable = true;
            this.buttonHighlightLayer.addMesh((mesh as Mesh), new Color3(63, 139, 149)); // bleu ciel
        } else {
            mesh.isPickable = false;
            this.buttonHighlightLayer.removeMesh((mesh as Mesh));
        }
    }

    private updateButtons(
        buttonMeshes: AbstractMesh[]
    ): void 
    {
        const current = getCurrentGroup(ZoneName.SEAT);
        const total = getTotalGroups(ZoneName.SEAT, this.sceneManager.getUserX.getFriends.length);
        if (buttonMeshes[0])
            this.handleButtonField(buttonMeshes[0], current > 0);
        if (buttonMeshes[1])
            this.handleButtonField(buttonMeshes[1], current < total - 1);
    }

    private handleMyProfile(): void {
    this.sceneInteractor.disableInteractions();
    navigateToZone(this.sceneManager, ZoneName.ARBITRATOR, () => {
        this.clicArbitrator = true;
        this.sceneInteractor.enableInteractions();

        if (this.myProfilUI === null)
            this.myProfilUI = new MyProfilUI(
                this.sceneManager,
                this.sceneManager.getUserX
            );
    });
}


    public handleFriendsProfile(
        mesh: AbstractMesh,
        buttonMeshes: AbstractMesh[]
    ): void 
    {
        this.sceneInteractor.getHighlightLayer().removeAllMeshes();
        this.sceneInteractor.disableInteractions();
        navigateToZone(this.sceneManager, ZoneName.SEAT, () => {
            this.clicSeat = true;
            displayFriendsWithEmpty(this.scene, this.sceneManager.getUserX.getFriends, this.sceneManager.getChair);
            this.updateButtons(buttonMeshes);
            this.sceneInteractor.enableInteractions();
            if (this.friendUI === null)
            {
                this.friendUI = new FriendUI(   
                                    this.sceneManager,
                                    this.updateChair.bind(this),
                                    buttonMeshes
                                );
            }
            else
                this.friendUI.leaveFriend();
        });
    }


    private resetState(
        buttonMeshes: AbstractMesh[]
    ): void 
    {
        setCurrentGroup(ZoneName.SEAT, 0, this.sceneManager.getUserX.getFriends, this.scene);
        this.sceneManager.getChair.forEach((mesh : AbstractMesh) => {
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


    get getFriendUI()
    {
        return (this.friendUI);
    }
    
    
    /**************************************************
     *                PUBLIC METHODS                  *
    **************************************************/
    public updateChair(
        buttonMeshes: AbstractMesh[]
    ) : void
    {
            this.resetState(buttonMeshes);
            this.updateButtons(buttonMeshes);
            displayFriendsWithEmpty(this.scene, this.sceneManager.getUserX.getFriends, this.sceneManager.getChair);
    }

    public resetMaterialForScoreboard() : void
    {
        this.sceneManager.getMesh("scoreBoard")[0].material = this.materials[0];
        this.sceneManager.getMesh("scoreBoard")[1].material = this.materials[1];
        this.sceneManager.getMesh("scoreBoard")[2].material = this.materials[2];
    }

    public handlePointer(
        pointerInfo: PointerInfo,
        isClick: boolean,
        mesh: AbstractMesh
    ): void 
    {
        if (!this.sceneInteractor.areInteractionsEnabled()) return;
        const pickedMesh = mesh;
        if (!pickedMesh)return;

        const arbitratorMeshes = this.sceneManager.getLoadedMeshes["arbitrator"];
        const spectatorMeshes = this.sceneManager.getLoadedMeshes["spectator"];
        const friendMeshes = this.sceneManager.getLoadedMeshes["seatsFriends"];
        const buttonMeshes = this.sceneManager.getLoadedMeshes["buttonsField"];

        if (isClick) {
            if (friendMeshes.includes(pickedMesh) && this.test)
            {
                const nb = parseInt(pickedMesh.name[pickedMesh.name.length - 1]);
                const index = (getCurrentGroup(ZoneName.SEAT) * 4) + nb;
                console.log("valeur de index ->", index);
                if (index >= this.sceneManager.getUserX.getFriends.length || (!index && index !== 0))
                    return ;
                if (!this.friendUI)
                    this.friendUI = new FriendUI(   
                        this.sceneManager,
                        this.updateChair.bind(this),
                        buttonMeshes,
                    );
                this.friendUI.displayFriend(this.sceneManager.getUserX.getFriends[index]);
            } else if (arbitratorMeshes.includes(pickedMesh)) {
                this.handleMyProfile();
            } else if (spectatorMeshes.includes(pickedMesh)) {
                this.handleFriendsProfile(pickedMesh, buttonMeshes);
                this.test = true;
            } else if (buttonMeshes.includes(pickedMesh)) {
                const current = getCurrentGroup(ZoneName.SEAT);
                if (pickedMesh === buttonMeshes[0] && this.clicSeat) {
                    setCurrentGroup(ZoneName.SEAT, current - 1, this.sceneManager.getUserX.getFriends, this.scene);
                    this.updateButtons(buttonMeshes);
                } else if (pickedMesh === buttonMeshes[1] && this.clicSeat) {
                    setCurrentGroup(ZoneName.SEAT, current + 1, this.sceneManager.getUserX.getFriends, this.scene);
                    this.updateButtons(buttonMeshes);
                }
                else if (pickedMesh === buttonMeshes[2] || (pickedMesh === buttonMeshes[3] && this.clicArbitrator)){
                    this.sceneInteractor.disableInteractions();
                    navigateToZone(this.sceneManager, ZoneName.STANDS, () => {
                        if (pickedMesh === buttonMeshes[2]){
                            this.clicSeat = false;
                            this.test = false;
                                if (this.friendUI)
                                {
                                    this.friendUI.switchOff();
                                    this.friendUI = null;
                                    this.resetMaterialForScoreboard();
                                }
                                this.resetState(buttonMeshes);
                            }
                            if (pickedMesh === buttonMeshes[3])
                            {
                                if (this.myProfilUI)
                                {
                                    this.myProfilUI.dispose();
                                    this.myProfilUI = null;
                                    this.sceneManager.getScene().getMeshByName("logo")!.isVisible = true;
                                }
                                this.clicArbitrator = false;
                            }
                            this.sceneInteractor.enableInteractions();
                        });
                }
            }
        } else {
            this.sceneInteractor.getHighlightLayer().removeAllMeshes();
            if (spectatorMeshes.includes(pickedMesh) && !this.clicSeat){
                spectatorMeshes.forEach((mesh: AbstractMesh) => {
                    this.sceneInteractor.getHighlightLayer().addMesh((mesh as Mesh), new Color3(0.807, 0.541, 0.553));
                });
            }
            if (arbitratorMeshes.includes(pickedMesh))
            {
                this.sceneInteractor.getHighlightLayer().addMesh((pickedMesh as Mesh), new Color3(63/255, 139/255, 149/255));
            }
            if (friendMeshes.includes(pickedMesh) && this.clicSeat)
            {
                this.sceneInteractor.getHighlightLayer().addMesh((pickedMesh as Mesh), new Color3(0.807, 0.541, 0.553));
            }
            if (pickedMesh === buttonMeshes[2] && this.clicSeat)
            {
                this.sceneInteractor.getHighlightLayer().addMesh((buttonMeshes[2] as Mesh), new Color3(0.807, 0.541, 0.553));
            }
            if (pickedMesh === buttonMeshes[3] && this.clicArbitrator) 
            {
                this.sceneInteractor.getHighlightLayer().addMesh((buttonMeshes[3] as Mesh), new Color3(63/255, 139/255, 149/255));
            }
        }
    }

    public dispose(): void 
    {
        console.log("StandsInteraction: nettoyage en cours...");
        this.buttonHighlightLayer.removeAllMeshes();
        this.sceneInteractor.getHighlightLayer().removeAllMeshes();

        if (this.buttonHighlightLayer) {
            this.buttonHighlightLayer.dispose();
        }

        this.clicSeat = false;
        this.clicArbitrator = false;

        this.sceneManager.getChair.forEach((mesh : AbstractMesh) => {
            const mat = mesh.material as PBRMaterial;
            if (!mat) return;

            const dynTex = (mat as any)._loginTexture as DynamicTexture;
            if (dynTex) {
                const ctx = dynTex.getContext();
                ctx.clearRect(0, 0, 1024, 1024);
                dynTex.update();
            }
        });
        this.sceneInteractor.enableInteractions();
        console.log("StandsInteraction: nettoyage terminé.");
    }
}