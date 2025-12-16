import { 
    AbstractMesh,
    Scene,
    Material
} from '@babylonjs/core';
import { 
  AdvancedDynamicTexture, 
  Rectangle, 
  Control
} from "@babylonjs/gui";


import { ZoneName} from '../config.ts';
import { SceneInteractor } from '../scene/SceneInteractor.ts';
import { SceneManager } from '../scene/SceneManager.ts';
import { moveSponge } from './utils.ts';

/* UTILES POUR SUIVRE CE QUE FAIS L'UTILISATEUR DANS LES MENUS */
import { UserX } from '../UserX.ts';

/* Interface représentant un objet contenant des données pour l'UI */
import { UIData } from './utils.ts';

import { menuCreate } from './scoreboardUI/menuCreate.ts';
import { menuTournament } from './scoreboardUI/menuTournament.ts';
import { myClearControls } from '../utils.ts';
import { navigateToZone } from '../CameraHistory.ts';

interface Interval
{
    id: number
}

export class ScoreboardHandler {
    /**************************************************
     *           PRIVATE ATTRIBUTES                   *
     **************************************************/
    private scene: Scene;
    private sceneManager: SceneManager;
    private sceneInteractor: SceneInteractor;
    private clicScoreboard: boolean;
    private userX: UserX;
    private advancedTexture: AdvancedDynamicTexture | null;
    private menuContainer : Rectangle | null;
    private UIData: UIData;
    private page: Rectangle | null;
    private interval: Interval;
    private originalMaterial: Material | null = null;
    private scoreboardMesh : AbstractMesh | null = null;
    private playMatch: boolean = false;

    /**************************************************
     *                  CONSTRUCTOR                   *
     **************************************************/
    constructor(scene: Scene, sceneManager: SceneManager, sceneInteractor: SceneInteractor) {

        this.scene = scene;
        this.sceneManager = sceneManager;
        this.sceneInteractor = sceneInteractor;
        this.clicScoreboard = false;
        this.userX = sceneManager.getUserX;
        this.interval = {id: -1};
        console.log(this.userX);
        this.UIData = {
            title: {
                color: "rgba(221, 16, 16, 1)",
                fontSize: 30,
                fontFamily: "Gloria Hallelujah",
                width: "250px"
            },
            text: {
                color: "rgba(16,16,221,1)",
                fontSize: 24,
                fontFamily: "Gloria Hallelujah"
            },
            inputText: {
                fontSize: 24,
                fontFamily: "Gloria Hallelujah",
                color: "rgba(16,16,221,1)",
                background: "transparent",
                focusedBackground: "rgba(227, 227, 255, 1)",
                thickness: 1
            },
            button: {
                color: "rgba(16,16,221,1)",
                background: "transparent",
                clickedBackground: "rgba(159, 159, 222, 1)",
                hoveredBackground: "rgba(227, 227, 255, 1)",
                thickness: 1,
            }
        }
        
        this.advancedTexture = null;
        this.menuContainer = null;
        this.page = null;
    }

    /**************************************************
     *               PRIVATE METHODS                 * 
     **************************************************/
    public selectMenu(mesh: AbstractMesh)
    {
        console.log("---------------> entree dans selectne");
        this.scoreboardMesh = mesh;
        if (!this.originalMaterial) {
            this.originalMaterial = mesh.material;
        }
        if (this.menuContainer === null)
            this.menuContainer = new Rectangle();
        else
            myClearControls(this.menuContainer);
        if (this.advancedTexture !== null)
            this.advancedTexture.dispose();
        this.advancedTexture = AdvancedDynamicTexture.CreateForMesh(mesh);
        mesh.isVisible = true;
        mesh.setEnabled(true);

        this.menuContainer.width = "100%";
        this.menuContainer.height = "100%";
        this.menuContainer.background = "rgba(187, 187, 187, 1)"
        this.menuContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.menuContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.advancedTexture.addControl(this.menuContainer);

        if (this.userX.getTournament === null)
        {
            const env = {
                page: null,
                menuContainer: this.menuContainer,
                advancedTexture: this.advancedTexture,
                meshScoreboard: mesh,
                userX: this.userX,
                UIData: this.UIData,
                control: this,
                scoreboard: this
            }
            menuCreate(env);
        }
        else
        {
            const env = {
                menuContainer: this.menuContainer,
                userX: this.userX,
                UIData: this.UIData,
                sceneManager: this.sceneManager,
                waitingInterval: this.interval,
                scoreboard: this
            }
            menuTournament(env, false, undefined);
        }
    }

    public leaveMenu() {
        if (this.menuContainer)
            this.menuContainer.isVisible = false;

        if (this.scoreboardMesh && this.originalMaterial) {
            this.scoreboardMesh.material = this.originalMaterial;
            this.scoreboardMesh.isVisible = true;
            this.scoreboardMesh.setEnabled(true);
        }

        this.advancedTexture = null;
        this.menuContainer = null;
        this.page = null;
    }
    
    /**************************************************
     *                PUBLIC METHODS                  *
     **************************************************/

    public handle(pickedMesh : AbstractMesh, scoreMeshes: AbstractMesh[]) : void{
        if (!pickedMesh) return;
        if (pickedMesh === scoreMeshes[0] && this.clicScoreboard === false){
            this.sceneInteractor.disableInteractions();
            navigateToZone(this.sceneManager, ZoneName.SCOREBOARD, () => {
                this.sceneInteractor.getHighlightLayer().removeMesh(pickedMesh);
                if (!this.playMatch)
                    this.selectMenu(scoreMeshes[0]);
                this.sceneManager.setSpecificMesh(true);
                this.clicScoreboard = true;
                this.sceneInteractor.enableInteractions();
            });
        }
        else if (pickedMesh === scoreMeshes[1]){
            if (this.clicScoreboard){
                moveSponge(pickedMesh, this.scene);
                if (this.interval.id !== -1)
                    clearInterval(this.interval.id);
                this.leaveMenu();
                this.sceneInteractor.disableInteractions();
                navigateToZone(this.sceneManager, ZoneName.LOCKER_ROOM, () => {
                    this.sceneManager.setSpecificMesh(false);
                    this.sceneInteractor.getHighlightLayer().removeMesh(scoreMeshes[1]); //lolo
                    this.clicScoreboard = false;
                    this.sceneInteractor.enableInteractions();
                });
            }
        }

    }

    /**************************************************
     *                      GETTERS                   *
     **************************************************/
    get getClicScoreboard(): boolean {
        return this.clicScoreboard;
    }

    get getUserX() : UserX
    {
        return (this.userX);
    }

    set setClic(b: boolean)
    {
        this.clicScoreboard = b;
    }

    set setPlayMatch(b: boolean)
    {
        this.playMatch = b;
    }
}