import {ZoneName} from '../config.ts';

import {
    Scene,
    AbstractMesh,
    Animation,
    Color3,
    HighlightLayer,
    PBRMaterial
} from '@babylonjs/core';

import { 
    AdvancedDynamicTexture,
    ScrollViewer,
    StackPanel,
    TextBlock,
    Control,
    Rectangle,
    Grid,
    Ellipse,
    Button,
    InputTextArea,
    Line
} from "@babylonjs/gui";


import { SceneInteractor } from '../scene/SceneInteractor.ts';
import { SceneManager } from '../scene/SceneManager.ts';
import { getCurrentGroup, getTotalGroups, setCurrentGroup } from '../utils.ts';
import { TournamentParticipant } from '../Tournament.ts';




export class TshirtHandler {
    /**************************************************
     *           PRIVATE ATTRIBUTES                   *
     **************************************************/
    private scene: Scene;
    private sceneManager: SceneManager;
    private sceneInteractor: SceneInteractor;
    private clicTshirt: boolean;
    private buttonHighlightLayer: HighlightLayer;
    private basePositions = new Map<AbstractMesh, number>();
    private frame: AdvancedDynamicTexture | null = null;

    /**************************************************
     *                  CONSTRUCTOR                   *
     **************************************************/
    constructor(scene: Scene, sceneManager: SceneManager, sceneInteractor: SceneInteractor) {
        this.scene = scene;
        this.sceneManager = sceneManager;
        this.sceneInteractor = sceneInteractor;
        this.clicTshirt = false;
        this.buttonHighlightLayer = new HighlightLayer("hlButton", this.scene);
    }

    /**************************************************
     *               PRIVATE METHODS                 *
     **************************************************/
    private displayProfilePlayer(player: TournamentParticipant): void {
        if (this.frame)
            this.frame.dispose();
        this.frame = AdvancedDynamicTexture.CreateForMesh(this.sceneManager.getScene().getMeshByName("frame"));
        const rect = new Rectangle();
        rect.background = "red";
        rect.width = "100%";
        rect.height = "100%";
        this.frame.addControl(rect);

        const login = new TextBlock();
        login.text = player.login;
        login.color = "black";
        login.width = "100%";
        login.height = "100%";
        login.fontSize = 300;
        rect.addControl(login);
    }

    private animateButtonLocker(mesh: AbstractMesh): void {
        // Stop animation precedente
        this.scene.stopAnimation(mesh);

        // Stocke la position base
        if (!this.basePositions.has(mesh)) {
            this.basePositions.set(mesh, mesh.position.y);
        }
        const baseY = this.basePositions.get(mesh)!;
        const frameRate = 30;
        const amplitude = 0.2;
        const bounceAnim = new Animation(
            `bounce_${mesh.name}`,
            "position.y",
            frameRate,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        );

        bounceAnim.setKeys([
            { frame: 0, value: baseY },
            { frame: 15, value: baseY + amplitude },
            { frame: 30, value: baseY },
        ]);

        mesh.animations = [bounceAnim];
        this.scene.beginAnimation(mesh, 0, 30, true);
    }

    private stopButtonAnimation(mesh: AbstractMesh): void {
        this.scene.stopAnimation(mesh);
        if (this.basePositions.has(mesh))
            mesh.position.y = this.basePositions.get(mesh)!;
    }

    private handleButtonLocker(mesh: AbstractMesh, active: boolean): void {
        if (active) {
            mesh.isPickable = true;
            this.buttonHighlightLayer.addMesh(mesh, new Color3(0.53, 0.81, 0.92)); // bleu ciel
            this.animateButtonLocker(mesh);
        } else {
            mesh.isPickable = false;
            this.buttonHighlightLayer.removeMesh(mesh);
            this.stopButtonAnimation(mesh);
        }
    }

    private updateButtons(tshirtMeshes: AbstractMesh[]): void {
        const current = getCurrentGroup(ZoneName.TSHIRT);
        const total = getTotalGroups(ZoneName.TSHIRT, this.sceneManager.getUserX.getTournament?.getParticipants.length);
        this.handleButtonLocker(tshirtMeshes[10], current > 0);
        this.handleButtonLocker(tshirtMeshes[11], current < total - 1);
    }

    private turnOnExit(mesh: AbstractMesh) : void {
        if (mesh.material && mesh.material instanceof PBRMaterial) {
            const mat = mesh.material as PBRMaterial;
            mat.emissiveTexture = mat.albedoTexture;
            mat.emissiveColor = new Color3(0.3, 0.7, 0.6);
            mat.emissiveIntensity = 2;
        }
    }

    private turnOffExit(mesh : AbstractMesh) : void {
        if (mesh.material && mesh.material instanceof PBRMaterial) {
            const mat = mesh.material as PBRMaterial;
            mat.emissiveTexture = null;
            mat.emissiveColor = Color3.Black();
        }
    }

    private resetState(tshirtMeshes: AbstractMesh[]): void {
        if (this.sceneManager.getUserX.getTournament)
            setCurrentGroup(ZoneName.TSHIRT, 0, this.sceneManager.getUserX.getTournament?.getParticipants, this.scene);
        else
        {
            console.error("Aucun tournoi en cours");
            return ;
        }
        // Éteindre les boutons gauche/droite
        this.handleButtonLocker(tshirtMeshes[10], false);
        this.handleButtonLocker(tshirtMeshes[11], false);

        this.buttonHighlightLayer.removeAllMeshes();
        this.sceneInteractor.getHighlightLayer().removeAllMeshes();
    }

    /**************************************************
     *                PUBLIC METHODS                  *
     **************************************************/
   public handle(pickedMesh: AbstractMesh, tshirtMeshes: AbstractMesh[]): void {
    if (!pickedMesh) return;
    const players = this.sceneManager.getUserX.getTournament?.getParticipants;

    if (!players)
        return ;
   
    // Clic sur un t-shirt
    if (pickedMesh.name.includes(ZoneName.TSHIRT)) {
        this.updateButtons(tshirtMeshes);

        const nb = parseInt(pickedMesh.name[pickedMesh.name.length - 1]);
        const index = (getCurrentGroup(ZoneName.TSHIRT) * 10) + nb;
        this.sceneInteractor.disableInteractions();
        if (this.clicTshirt)
        {
            this.displayProfilePlayer(players[index]);
            this.sceneInteractor.enableInteractions();
        }
        else
        {
            this.sceneManager.moveCameraTo(ZoneName.TSHIRT, () => {
                this.clicTshirt = true;
                this.turnOnExit(tshirtMeshes[12]);
                this.displayProfilePlayer(players[index]);
                this.sceneInteractor.enableInteractions();
            });
        }
    }

    // Clic sur un bouton
    if (pickedMesh.name.includes("button") && pickedMesh.isPickable && this.clicTshirt) {
        const current = getCurrentGroup(ZoneName.TSHIRT);
        if (pickedMesh === tshirtMeshes[10])
            setCurrentGroup(ZoneName.TSHIRT, current - 1, players, this.scene);
        else if (pickedMesh === tshirtMeshes[11])
            setCurrentGroup(ZoneName.TSHIRT, current + 1, players, this.scene);
        this.updateButtons(tshirtMeshes);
    }

    // Clic sur exit
    if (pickedMesh === tshirtMeshes[12] && this.clicTshirt) {
        this.turnOffExit(pickedMesh);
        this.sceneInteractor.getHighlightLayer().removeMesh(pickedMesh);

        this.sceneInteractor.disableInteractions();
        this.sceneManager.moveCameraTo(ZoneName.LOCKER_ROOM, () => {
            this.resetState(tshirtMeshes);
            this.clicTshirt = false;
            this.sceneInteractor.enableInteractions();
        });
    }
}

    /**************************************************
     *                      GETTERS                   *
     **************************************************/
    get getClicTshirt(): boolean {
        return this.clicTshirt;
    }
}