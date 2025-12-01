import { AbstractMesh, Vector3, Matrix } from "@babylonjs/core";
import { AdvancedDynamicTexture, ScrollViewer, StackPanel, TextBlock, Control, Rectangle, InputText, Button } from "@babylonjs/gui";

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

import { Friend } from "../friends/Friend.ts";
import { SceneManager } from "../scene/SceneManager.ts";

// import { IMatch } from "../Friend.ts";
import { StandsInteraction } from "./StandsInteraction.ts";

import { InvitationUI } from "./InvitationUI.ts";
import { DataFriendUI } from "./DataFriendUI.ts";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

export interface ContainerUI
{
    header: AdvancedDynamicTexture | null;
    headerPanel: StackPanel | null;
    menu: AdvancedDynamicTexture | null;
    menuPanel: StackPanel | null;
    view: AdvancedDynamicTexture | null;
    viewPanel: StackPanel | null;
}

export class FriendUI
{
    private invitationUI: InvitationUI | null;
    private dataFriendUI: DataFriendUI | null = null;
    private containerUI: ContainerUI;
    private sceneManager: SceneManager;
    private buttonMeshes: AbstractMesh[];
    private standsInteraction: StandsInteraction;
 
    constructor(
        sceneManager: SceneManager,
        private updateChair : (buttonMeshes: AbstractMesh[]) => void,
        buttonMeshes: AbstractMesh[],
        standsInteraction: StandsInteraction
    )
    {
        this.sceneManager = sceneManager;
        this.containerUI = {
            header: AdvancedDynamicTexture.CreateForMesh(
                        this.sceneManager.getMesh("scoreBoard")[0],
                        1024, 1024,
                        true
                    ),
            headerPanel: null,
            menu:   AdvancedDynamicTexture.CreateForMesh(
                        this.sceneManager.getMesh("scoreBoard")[1],
                        1024, 1024,
                        true
                    ),
            menuPanel: null,
            view:   AdvancedDynamicTexture.CreateForMesh(
                        this.sceneManager.getMesh("scoreBoard")[2],
                        1024, 1024,
                        true
                    ),
            viewPanel: null,
        };
        this.standsInteraction = standsInteraction;
        this.buttonMeshes = buttonMeshes;
        this.invitationUI = new InvitationUI(this);
        this.invitationUI.display();
    }

    get getButtonMeshes() : AbstractMesh[]
    {
        return (this.buttonMeshes);
    }

    get getUpdateChair() : typeof this.updateChair
    {
        return (this.updateChair);
    }

    get getContainerUI() : ContainerUI
    {
        return (this.containerUI);
    }

    get getSceneManager() : SceneManager
    {
        return (this.sceneManager);
    }

    public resetAll() : void
    {
        this.resetHeader();
        this.resetContainerL();
        this.resetContainerR();
    }

    public resetContainerL() : void
    {
        if (this.containerUI.menu === null)
            this.containerUI.menu =  AdvancedDynamicTexture.CreateForMesh(
                        this.sceneManager.getMesh("scoreBoard")[1],
                        1024, 1024,
                        true
                    );
        if (this.containerUI.menuPanel === null)
        {
            this.containerUI.menuPanel = new StackPanel("panelMenu");
            this.containerUI.menuPanel.isVertical = true;
            this.containerUI.menuPanel.height = "100%";
            this.containerUI.menuPanel.width = "100%";
            this.containerUI.menuPanel.background = "lightblue";
            this.containerUI.menuPanel.paddingTop = "150px";
            this.containerUI.menuPanel.paddingBottom = "0px";
            this.containerUI.menuPanel.paddingLeft = "0px";
            this.containerUI.menuPanel.paddingRight = "0px";
            this.containerUI.menuPanel.spacing = 10;
            this.containerUI.menu.addControl(this.containerUI.menuPanel);
        }
        else
            this.containerUI.menuPanel.clearControls();
    }

    public resetContainerR() : void
    {
        if (this.containerUI.view === null)
            this.containerUI.view =  AdvancedDynamicTexture.CreateForMesh(
                        this.sceneManager.getMesh("scoreBoard")[2],
                        1024, 1024,
                        true
                    );
        if (this.containerUI.viewPanel === null)
        {
            this.containerUI.viewPanel = new StackPanel("panelInvitation");
            this.containerUI.viewPanel.isVertical = true;
            this.containerUI.viewPanel.height = "100%";
            this.containerUI.viewPanel.width = "100%";
            this.containerUI.viewPanel.background = "lightblue";
            this.containerUI.viewPanel.paddingTop = "150px";
            this.containerUI.viewPanel.paddingBottom = "0px";
            this.containerUI.viewPanel.paddingLeft = "0px";
            this.containerUI.viewPanel.paddingRight = "0px";
            this.containerUI.viewPanel.spacing = 10;
            this.containerUI.view.addControl(this.containerUI.viewPanel);
        }
        else
            this.containerUI.viewPanel.clearControls();
    }

    public resetHeader() : void
    {
        if (this.containerUI.header === null)
            this.containerUI.header = AdvancedDynamicTexture.CreateForMesh(
                        this.sceneManager.getMesh("scoreBoard")[0],
                        1024, 1024,
                        true
                    );
        if (this.containerUI.headerPanel === null)
        {
            this.containerUI.headerPanel = new StackPanel("panelHeader");
            this.containerUI.headerPanel.isVertical = false;
            this.containerUI.headerPanel.height = "100%";
            this.containerUI.headerPanel.width = "1000px";
            this.containerUI.headerPanel.background = "green";
            this.containerUI.headerPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.containerUI.headerPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            this.containerUI.headerPanel.paddingTop = "0px";
            this.containerUI.headerPanel.paddingBottom = "0px";
            this.containerUI.headerPanel.paddingLeft = "0px";
            this.containerUI.headerPanel.paddingRight = "0px";
            this.containerUI.header.addControl(this.containerUI.headerPanel);
        }
        else
            this.containerUI.headerPanel.clearControls();
    }

    public displayFriend(friend: Friend)
    {
        this.resetAll();
        this.invitationUI = null;
        this.dataFriendUI = new DataFriendUI(this, friend);
        this.dataFriendUI.display();
    }

    public leaveFriend()
    {
        this.resetAll();
        this.dataFriendUI = null;
        this.invitationUI = new InvitationUI(this);
        this.invitationUI.display();
    }

    public switchOff()
    {
        this.containerUI.header?.dispose();
        this.containerUI.menu?.dispose();
        this.containerUI.view?.dispose();
    }

    public hide(): void {
        // if (this.containerUI.header) this.containerUI.header.isVisible = false;
        // if (this.containerUI.menu) this.containerUI.menu.isVisible = false;
        // if (this.containerUI.view) this.containerUI.view.isVisible = false;
    }

    /** Affiche tous les panels et UI */
    public show(): void {
        // if (this.containerUI.header) this.containerUI.header.isVisible = true;
        // if (this.containerUI.menu) this.containerUI.menu.isVisible = true;
        // if (this.containerUI.view) this.containerUI.view.isVisible = true;
    }
};