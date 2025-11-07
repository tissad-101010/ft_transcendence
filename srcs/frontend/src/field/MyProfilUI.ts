import { 
    AbstractMesh,
    Vector3,
    Matrix 
} from "@babylonjs/core";

import {
    AdvancedDynamicTexture,
    ScrollViewer,
    StackPanel,
    TextBlock,
    Control,
    Rectangle 
} from "@babylonjs/gui";

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
  Filler
} from 'chart.js';

import { SceneManager } from "../scene/SceneManager.ts";
import { UserX } from "../UserX.ts";

Chart.register(
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

export class MyProfilUI
{
    private sceneManager: SceneManager;
    private container: AdvancedDynamicTexture;
    private userX: UserX; 

    constructor(sceneManager: SceneManager, userX: UserX)
    {
        this.sceneManager = sceneManager;
        this.sceneManager.getScene().getMeshByName("logo").isVisible = false;
        this.container = AdvancedDynamicTexture.CreateForMesh(
            this.sceneManager.getScene().getMeshByName("field"),
            1024,
            1024,
            true
        );
        this.userX = userX;
        this.displayMenu();
    }
    
    public displayMenu() : void
    {
        const panel = new StackPanel();
        panel.background = "rgb(200,200,200)";
        panel.width = "1024px";
        panel.height = "1024px";
        panel.isVertical = true;
        panel.spacing = 20;
        this.container.addControl(panel);

        
    }

    public dispose() : void
    {
        if (this.container)
            this.container.dispose();
    }
}


