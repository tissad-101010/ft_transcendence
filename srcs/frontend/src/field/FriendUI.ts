import { AbstractMesh, Vector3, Matrix } from "@babylonjs/core";
import { AdvancedDynamicTexture, ScrollViewer, StackPanel, TextBlock, Control, Rectangle } from "@babylonjs/gui";

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

import { UserX } from "../UserX.ts";
import { Friend } from "../Friend.ts";
import { SceneManager } from "../scene/SceneManager.ts";

import { IMatch } from "../Friend.ts";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

interface ContainerUI
{
    header: AdvancedDynamicTexture;
    headerPanel: StackPanel | null;
    menu: AdvancedDynamicTexture;
    menuPanel: StackPanel | null;
    view: AdvancedDynamicTexture;
    viewPanel: StackPanel | null;
    chartCanvas: HTMLCanvasElement | null;
    buttonsMenu: Rectangle[]
}

export class FriendUI
{
    private containerUI: ContainerUI;
    private sceneManager: SceneManager;
    private friend: Friend;
    private currView: string;
    private buttonMeshes: AbstractMesh[];
    private currValue : number;
 
    constructor(
        sceneManager: SceneManager,
        friend: Friend,
        private updateChair : (buttonMeshes: AbstractMesh[]) => void,
        buttonMeshes: AbstractMesh[]
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
            chartCanvas: null,
            buttonsMenu: []
        };
        this.buttonMeshes = buttonMeshes;
        this.friend = friend;
        this.currView = "Infos";
        this.currValue = 5;
        this.displayHeader();
        this.displayMenu();
        this.displayDatas()
    }


    displayHeader() : void
    {
        if (this.containerUI.headerPanel === null)
        {
            this.containerUI.headerPanel = new StackPanel("panelHeader");
            this.containerUI.headerPanel.isVertical = false;
            this.containerUI.headerPanel.height = "100%";
            this.containerUI.headerPanel.width = "1000px";
            this.containerUI.headerPanel.background = "green";
            this.containerUI.headerPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.containerUI.headerPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            this.containerUI.headerPanel.verticalContentAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            this.containerUI.headerPanel.paddingTop = "0px";
            this.containerUI.headerPanel.paddingBottom = "0px";
            this.containerUI.headerPanel.paddingLeft = "0px";
            this.containerUI.headerPanel.paddingRight = "0px";
            this.containerUI.header.addControl(this.containerUI.headerPanel);
        }
        else
            this.containerUI.headerPanel.clearControls();

        const login = new TextBlock("textLogin");
        login.text = this.friend.getLogin;
        login.color = "black";
        login.fontSize = 100;
        login.width = "500px"
        login.fontFamily = "Arial";
        login.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        login.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.containerUI.headerPanel.addControl(login);

        const avatar = new Rectangle("RectAvatar");
        avatar.width = "200px";
        avatar.height = "200px";
        avatar.thickness = 1;
        avatar.color = "black";
        avatar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        avatar.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.containerUI.headerPanel.addControl(avatar);
    }

    switchView(
        label: string
    ) : void
    {
        if (label !== this.currView)
        {
            this.currView = label;
            this.displayDatas();
        }
    }

    displayMenu() : void
    {
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
            this.containerUI.menuPanel.spacing = 20;
            this.containerUI.menu.addControl(this.containerUI.menuPanel);
        }
        else
            this.containerUI.menuPanel.clearControls();

        const rect = new Rectangle();
        rect.thickness = 0;
        rect.height = "100px";
        this.containerUI.menuPanel.addControl(rect);

        const self = this;
        function createButton(label: string, self: FriendUI) : Rectangle
        {
            const rect = new Rectangle("rectButton " + label);
            rect.width = "750px";
            rect.height = "100px";
            if (self.currView === label)
                rect.background = "gray";
            else
                rect.background = "white";
            rect.thickness = 1;
            rect.color = "black";

            self.containerUI.buttonsMenu.push(rect);

            rect.onPointerClickObservable.add(() => {
                self.containerUI.buttonsMenu.forEach((rect) => {
                    rect.background = "white";
                })
                rect.background = "gray";
                self.switchView(label);
            });

            rect.onPointerEnterObservable.add(() => {
                if (self.currView !== label)
                    rect.background = "lightgray";
            });

            rect.onPointerOutObservable.add(() => {
                if (label === self.currView)
                    rect.background = "gray";
                else
                    rect.background = "white";
            })

            const text = new TextBlock("textButton " + label);
            text.text = label;
            text.fontSize = 50;
            text.color = "black";
            text.width = "100%";
            text.height = "100%";
            rect.addControl(text);
            return (rect);
        }
        this.containerUI.menuPanel.addControl(createButton("Infos", this));
        this.containerUI.menuPanel.addControl(createButton("Stats globales", this));
        this.containerUI.menuPanel.addControl(createButton("Stats tournoi", this));
        this.containerUI.menuPanel.addControl(createButton("Historique", this));
        this.containerUI.menuPanel.addControl(createButton("Supprimer l'ami", this));
    }

    calculateWinPercentages(
        matchs: IMatch[],
        userId: number,
        trancheSize: number = 5
    ) : {labels: string[], percentages: number[]}
    {
        const percentages: number[] = [];
        const labels: string[] = [];

        for (let i = 0; i < matchs.length; i += trancheSize) {
            const tranche = matchs.slice(i, i + trancheSize);
            let wins = 0;
            tranche.forEach(match => {
            const userIndex = match.participants.indexOf(userId);
            if (userIndex !== -1) {
                const userScore = match.score[userIndex];
                const opponentScore = match.score[1 - userIndex];
                if (userScore > opponentScore) wins++;
            }
            });
            percentages.push((wins / tranche.length) * 100);
            labels.push(`Matchs ${i + 1}-${i + tranche.length}`);
        }
        return { labels, percentages };
    }

    displayDeleteFriend() : void
    {
        const spacing = new Rectangle();
        spacing.height = "200px";
        spacing.thickness = 0;
        this.containerUI.viewPanel.addControl(spacing);

        const text = new TextBlock();
        text.text = "Consequences de la suppresion :";
        text.color = "black";
        text.width = "100%";
        text.height = "100px";
        text.fontSize = 50;
        this.containerUI.viewPanel.addControl(text);

        const elem1 = new TextBlock();
        elem1.text = "- Perte du chat si existant";
        elem1.width = "100%";
        elem1.height = "100px";
        elem1.color = "black";
        elem1.fontSize = 50;
        this.containerUI.viewPanel.addControl(elem1);

        const elem2 = new TextBlock();
        elem2.text = "- Perte de l'acces au profil de cet utilisateur";
        elem2.width = "100%";
        elem2.height = "100px";
        elem2.color = "black";
        elem2.fontSize = 50;
        this.containerUI.viewPanel.addControl(elem2);

        const space = new Rectangle();
        space.height = "200px";
        space.thickness = 0;
        this.containerUI.viewPanel.addControl(space);

        const button = new Rectangle();
        button.background = "white";
        button.width = "500px";
        button.height = "100px";
        button.color = "black";
        button.thickness = 2;
        this.containerUI.viewPanel.addControl(button);

        const textButton = new TextBlock();
        textButton.width = "100%";
        textButton.height = "100%";
        textButton.fontSize = 50;
        textButton.text = "Supprimer";
        button.addControl(textButton);

        button.onPointerClickObservable.add(() => {
            this.sceneManager.getUserX.deleteFriend(this.friend);
            this.switchOff();
            this.updateChair(this.buttonMeshes);
        })

        button.onPointerEnterObservable.add(() => {
            button.background = "red";
        })

        button.onPointerOutObservable.add(() => {
            button.background = "white";
        })
    }

    updateCanvas(
        value: number
    ) : void
    {
        const mesh = this.sceneManager.getMesh("scoreBoard")[1];
        const scene = this.sceneManager.getScene();
        const camera = scene.activeCamera;
        const engine = scene.getEngine();

        // Crée ou récupère le container HTML
        let container = document.getElementById("chartContainer");
        if (!container) {
            container = document.createElement("div");
            container.id = "chartContainer";
            container.style.position = "absolute";
            container.style.zIndex = "10";
            document.body.appendChild(container);
        }

        // Crée ou récupère le canvas
        this.containerUI.chartCanvas = document.getElementById("chartCanvas") as HTMLCanvasElement;
        if (!this.containerUI.chartCanvas) {
            this.containerUI.chartCanvas = document.createElement("canvas");
            this.containerUI.chartCanvas.id = "chartCanvas";
            this.containerUI.chartCanvas.style.width = "100%";
            this.containerUI.chartCanvas.style.height = "100%";
            container.appendChild(this.containerUI.chartCanvas);
        }

        // Calcule la position et la taille du mesh projeté
        const bbox = mesh.getBoundingInfo().boundingBox;
        const corners = bbox.vectorsWorld;
        const projected = corners.map(v =>
            Vector3.Project(
                v,
                Matrix.Identity(),
                scene.getTransformMatrix(),
                camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
            )
        );

        const xs = projected.map(p => p.x);
        const ys = projected.map(p => p.y);
        const width = Math.max(...xs) - Math.min(...xs);
        const height = Math.max(...ys) - Math.min(...ys);
        const center = Vector3.Project(
            mesh.position,
            Matrix.Identity(),
            scene.getTransformMatrix(),
            camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
        );

        // Met à jour position et taille HTML
        container.style.left = `${center.x - width / 2.5}px`;
        container.style.top = `${center.y - height / 4}px`;
        container.style.width = `${width * 0.8}px`;
        container.style.height = `${height * 0.7}px`;

        // Dessine le graphique
        const ctx = this.containerUI.chartCanvas.getContext("2d");
        const existingChart = Chart.getChart(this.containerUI.chartCanvas);
        if (existingChart) existingChart.destroy();

        const matchs = this.friend.loadMatchs();
        const userId = this.friend.getId;
        let cumulativeWins = 0;
        const percentages: number[] = [];
        const labels: string[] = [];

        matchs.forEach((match, i) => {
            const userIndex = match.participants.indexOf(userId);
            if (userIndex !== -1 && (value === -1 || i < value)) {
                const userScore = match.score[userIndex];
                const opponentScore = match.score[1 - userIndex];
                if (userScore > opponentScore) cumulativeWins++;
                percentages.push((cumulativeWins / (i + 1)) * 100);
                labels.push(`${i + 1}`);
            }
        });

        new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Taux de victoire cumulée (%)",
                    data: percentages,
                    borderColor: "rgb(75, 192, 192)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    displayStatsGlobals() : void
    {
        const line = new StackPanel("lineStatsGlobals");
        line.isVertical = false;
        line.width = "100%";
        line.height = "500px";
        line.spacing = 10;
        line.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        line.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.containerUI.viewPanel.addControl(line);

        const buttons : Rectangle = [];
        const self = this;

        function createButton(value: number) : Rectangle
        {
            const rect = new Rectangle("rectButton " + value);
            rect.width = "150px";
            rect.height = "75px";
            if (self.currValue === value)
                rect.background = "gray";
            else
                rect.background = "white";
            rect.thickness = 1;
            rect.color = "black";

            buttons.push(rect);

            rect.onPointerClickObservable.add(() => {
                buttons.forEach((rect: Rectangle) => {
                    rect.background = "white";
                })
                self.currValue  = value;
                rect.background = "gray";
                self.updateCanvas(value);
            });

            rect.onPointerEnterObservable.add(() => {
                if (value !== self.currValue )
                    rect.background = "lightgray";
            });

            rect.onPointerOutObservable.add(() => {
                if (value === self.currValue )
                    rect.background = "gray";
                else
                    rect.background = "white";
            })

            const text = new TextBlock("textButton " + value);
            if (value === -1)
                text.text = "Max";
            else
                text.text = value;
            text.fontSize = 40;
            text.color = "black";
            text.width = "100%";
            text.height = "100%";
            rect.addControl(text);
            return (rect);
        }
        const rect = new Rectangle();
        rect.width = "175px";
        rect.thickness = 0;
        line.addControl(rect);
        line.addControl(createButton(5));
        line.addControl(createButton(10));
        line.addControl(createButton(15));
        line.addControl(createButton(-1));
        this.updateCanvas(this.currValue);
    }

    displayHistoric() : void
    {
        const matchs = this.friend.loadMatchs();
        
        const rect = new Rectangle();
        rect.thickness = 0;
        rect.height = "150px";
        this.containerUI.viewPanel.addControl(rect);

        const scrollViewer = new ScrollViewer();
        scrollViewer.width = "970px";
        scrollViewer.height = "735px";
        scrollViewer.background = "transparent";
        scrollViewer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        scrollViewer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        scrollViewer.barColor = "white";
        scrollViewer.thickness = 0;
        scrollViewer.horizontalBarVisible = false;
        this.containerUI.viewPanel.addControl(scrollViewer);

        const historicContainer = new StackPanel();
        historicContainer.width = "100%";
        historicContainer.isVertical = true;
        historicContainer.spacing = 20;
        scrollViewer.addControl(historicContainer);

        function formatDuration(ms: number) {
            const totalSeconds = Math.floor(ms / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes}:${String(seconds).padStart(2, '0')}`;
        }

        for (let i = matchs.length - 1; i >= 0; i--)
        {
            const rect = new Rectangle();
            rect.width = "100%";
            rect.height = "200px";
            rect.background = "white";
            rect.color = "black";
            rect.thickness = 3;
            historicContainer.addControl(rect);

            const line = new StackPanel();
            line.width = "100%";
            line.isVertical = false;
            rect.addControl(line);

            const date = new TextBlock();
            date.text = matchs[i].date.toLocaleDateString('fr-FR');
            date.fontSize = 35;
            date.color = "black";
            date.width = "200px";
            line.addControl(date);

            const p1 = new TextBlock();
            p1.text = matchs[i].participants[0];
            p1.fontSize = 40;
            p1.color = "black";
            p1.width = "200px";
            line.addControl(p1);

            const sc1 = new TextBlock();
            sc1.text = matchs[i].score[0];
            sc1.fontSize = 35;
            if (matchs[i].score[0] > matchs[i].score[1])
                sc1.color = "green";
            else
                sc1.color = "black";
            sc1.width = "50px";
            sc1.fontWeight = "bold";
            line.addControl(sc1);

            const sc2 = new TextBlock();
            sc2.text = matchs[i].score[1];
            if (matchs[i].score[1] > matchs[i].score[0])
                sc2.color = "green";
            else
                sc2.color = "black";
            sc2.fontSize = 35;
            sc2.width = "50px";
            sc2.fontWeight = "bold";
            line.addControl(sc2);

            const p2 = new TextBlock();
            p2.text = matchs[i].participants[1];
            p2.fontSize = 40;
            p2.color = "black";
            p2.width = "200px";
            line.addControl(p2);

            const dur = new TextBlock();
            dur.text = formatDuration(matchs[i].duration);
            dur.fontSize = 35;
            dur.color = "black";
            dur.width = "100px";
            line.addControl(dur);
        }
    }

    displayDatas() : void
    {
        if (this.containerUI.viewPanel === null)
        {
            this.containerUI.viewPanel = new StackPanel("panelView");
            this.containerUI.viewPanel.isVertical = true;
            this.containerUI.viewPanel.height = "100%";
            this.containerUI.viewPanel.width = "100%";
            this.containerUI.viewPanel.background = "lightgreen";
            this.containerUI.viewPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.containerUI.viewPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            this.containerUI.viewPanel.verticalContentAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            this.containerUI.viewPanel.paddingTop = "0px";
            this.containerUI.viewPanel.paddingBottom = "0px";
            this.containerUI.viewPanel.paddingLeft = "0px";
            this.containerUI.viewPanel.paddingRight = "0px";
            this.containerUI.view.addControl(this.containerUI.viewPanel);
        }
        else
        {
            this.containerUI.viewPanel.clearControls();
            if (this.containerUI.chartCanvas)
            {
                this.containerUI.chartCanvas.remove();
                this.containerUI.chartCanvas = null;
            }
            const test = document.getElementById("chartContainer");
            if (test)
                test.remove();
        }

        if (this.currView === "Stats globales")
        {
            this.displayStatsGlobals();
            this.sceneManager.getScene().onBeforeRenderObservable.add(() => {
                const mesh = this.sceneManager.getMesh("scoreBoard")[1];
                if (mesh && document.getElementById("chartContainer")) {
                    this.updateCanvas(this.currValue);
                }
            });
        }
        else if (this.currView === "Historique")
            this.displayHistoric();
        else if (this.currView === "Supprimer l'ami")
            this.displayDeleteFriend();
    }

    resetPanel() : void
    {
        this.containerUI.buttonsMenu = [];
        if (this.containerUI.viewPanel)
        {
            this.containerUI.viewPanel.dispose();
            this.containerUI.viewPanel = null;
        }

        if (this.containerUI.menuPanel)
        {
            this.containerUI.menuPanel.dispose();
            this.containerUI.menuPanel = null;
        }

        if (this.containerUI.headerPanel)
        {
            this.containerUI.headerPanel.dispose();
            this.containerUI.headerPanel = null;
        }
        if (this.containerUI.chartCanvas)
        {
            this.containerUI.chartCanvas.remove();
            this.containerUI.chartCanvas = null;
        }
        const div = document.getElementById("chartContainer");
        if (div)
            div.remove();
    }

    switchOff() : void
    {
        this.resetPanel();
        if (this.containerUI.header)
        {
            this.containerUI.header.dispose();
            this.containerUI.header = null;
        }
        if (this.containerUI.view)
        {
            this.containerUI.view.dispose();
            this.containerUI.view = null;
        }
        if (this.containerUI.menu)
        {
            this.containerUI.menu.dispose();
            this.containerUI.menu = null;
        }
    }

    update(
        friend: Friend
    ) : void
    {
        this.friend = friend;
        this.displayHeader();
    }
};