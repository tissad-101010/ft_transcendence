// IMPORTS FOR BABYLON.JS
import { 
    Vector3,
    Matrix,
    Nullable,
    Observer,
    Scene 
} from "@babylonjs/core";

import {
    ScrollViewer,
    StackPanel,
    TextBlock,
    Control,
    Rectangle,
    Button,
    Image,
} from "@babylonjs/gui";

// IMPORTS FOR CHART.JS
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

import { Friend } from "../friends/Friend";
import { FriendUI } from "./FriendUI";
import { ContainerUI } from "./FriendUI";
import { Match } from "../friends/Friend";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, Filler);

export class DataFriendUI
{
    // PROPS
    private friendUI: FriendUI;
    private containerUI: ContainerUI;
    private friend: Friend;
    private chartCanvas: HTMLCanvasElement | null = null;
    private buttonsMenu: Button[] = [];
    private currView: string;
    private spinnerObserver: Nullable<Observer<Scene>> = null;

    constructor(friendUI: FriendUI, friend: Friend)
    {
        this.friendUI = friendUI;
        this.containerUI = this.friendUI.getContainerUI;
        this.friend = friend;
        this.currView = "";
    }

    // PUBLIC METHODS
    display()
    {
        this.displayHeader();
        this.displayContainerL();
        this.displayContainerR();
    }

    displayHeader()
    {
        this.friendUI.resetHeader();
        const login = new TextBlock("textUsername");
        login.text = this.friend.getUsername;
        login.color = "white";
        login.fontSize = 100;
        login.width = "700px";
        login.paddingTop = 120;
        login.fontFamily = "Arial";
        login.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        login.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.containerUI.headerPanel!.addControl(login);

        let avatar : Image;
        if (this.friend.getAvatarUrl)
            avatar = new Image("imgAvatar", this.friend.getAvatarUrl);
        else
            avatar = new Image("imgAvatar", "icon/user.png");
        avatar.paddingTop = 100;
        avatar.width = "175px";
        avatar.height = "250px";
        avatar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        avatar.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.containerUI.headerPanel!.addControl(avatar);
    }

    displayContainerL()
    {
        this.friendUI.resetContainerL();
        const space = new Rectangle();
        space.thickness = 0;
        space.height = "100px";
        this.containerUI.menuPanel!.addControl(space);

        const rectUp = new Rectangle();
        rectUp.width = "625px";
        rectUp.height = "300px";
        rectUp.thickness = 0;
        this.containerUI.menuPanel!.addControl(rectUp);

        const panelUp = new StackPanel();
        panelUp.isVertical = false;
        panelUp.width = "625px";
        panelUp.height = "300px";
        panelUp.spacing = 25;
        rectUp.addControl(panelUp);

        const rectDown = new Rectangle();
        rectDown.width = "625px";
        rectDown.height = "300px";
        rectDown.thickness = 0;
        this.containerUI.menuPanel!.addControl(rectDown);

        const panelDown = new StackPanel();
        panelDown.isVertical = false;
        panelDown.width = "625px";
        panelDown.height = "300px";
        panelDown.spacing = 25;
        rectDown.addControl(panelDown);

        const self = this;
        function createButton(label: string, urlImg: string, self: DataFriendUI) : Button
        {
            const button = Button.CreateImageOnlyButton("buttonMenu", urlImg);
            button.width = "300px";
            button.height = "300px";
            button.cornerRadius = 20;
            (button.image as Image).width = "150px";
            (button.image as Image).height = "150px";
            (button.image as Image).stretch = Image.STRETCH_UNIFORM;
            (button.image as Image).horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            (button.image as Image).verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            button.background = "rgba(51, 51, 51, 1)";

            button.onPointerEnterObservable.add(() => {
                if (self.currView !== label)
                    button.background = "rgba(111, 54, 67, 1)";            
            });

            button.onPointerOutObservable.add(() => {
                if (label === self.currView)
                    button.background = 'rgba(24, 61, 69, 1)';
                else
                    button.background = "rgba(51, 51, 51, 1)";
            });

            self.buttonsMenu.push(button);

            button.onPointerClickObservable.add(() => {
                self.buttonsMenu.forEach((b: Button) => {
                    b.background = "rgba(51, 51, 51, 1)";
                });
                button.background = 'rgba(24, 61, 69, 1)';
                self.switchView(label);
            });
            return (button);
        }

        panelUp.addControl(createButton("Stats globales", "icon/stats.png", this));
        panelUp.addControl(createButton("Historique", "icon/historic.png", this));
        panelDown.addControl(createButton("Supprimer l'ami", "icon/deleteFriend.png", this));
        panelDown.addControl(createButton("Quitter", "icon/leave.png", this));
    }
    displayContainerR()
    {
        this.friendUI.resetContainerR();
        if (this.chartCanvas)
        {
            this.chartCanvas.remove();
            this.chartCanvas = null;
        }
        const chartContainer = document.getElementById("chartContainer");
        if (chartContainer) chartContainer.remove();
        if (this.currView === "Stats globales")
        {
            this.displayStatsGlobals();
            this.friendUI.getSceneManager.getScene().onBeforeRenderObservable.add(() => {
                const mesh = this.friendUI.getSceneManager.getMesh("scoreBoard")[1];
                if (mesh && document.getElementById("chartContainer")) {
                    this.updateCanvasPosition();
                }
            });
        }
        else if (this.currView === "Historique")
            this.displayHistoric();
        else if (this.currView === "Supprimer l'ami")
            this.displayDeleteFriend();
    }

    // PRIVATE METHODS
    private switchView(
        label: string
    ) : void
    {
        if (label === "Quitter")
            this.friendUI.leaveFriend();
        else if (label !== this.currView)
        {
            this.currView = label;
            this.displayContainerR();
        }
    }

    private displayDeleteFriend()
    {
        const spacing = new Rectangle();
        spacing.height = "100px";
        spacing.thickness = 0;
        this.containerUI.viewPanel!.addControl(spacing);

        const rect = new Rectangle();
        rect.background = "rgba(51, 51, 51, 1)";
        rect.width = "800px";
        rect.height = "500px";
        rect.thickness = 2;
        rect.color = "white";
        this.containerUI.viewPanel?.addControl(rect);

        const panel = new StackPanel();
        panel.isVertical = true;
        panel.width = "800px";
        panel.height = "500px";
        rect.addControl(panel);

        const text = new TextBlock();
        text.text = "Consequences de la suppresion :";
        text.color = "white";
        text.width = "100%";
        text.height = "100px";
        text.fontSize = 30;
        panel.addControl(text);

        const elem1 = new TextBlock();
        elem1.text = "- Perte du chat si existant";
        elem1.width = "100%";
        elem1.height = "100px";
        elem1.color = "white";
        elem1.fontSize = 30;
        panel.addControl(elem1);

        const elem2 = new TextBlock();
        elem2.text = "- Perte de l'acces au profil de cet utilisateur";
        elem2.width = "100%";
        elem2.height = "100px";
        elem2.color = "white";
        elem2.fontSize = 30;
        panel.addControl(elem2);

        const button = Button.CreateSimpleButton("confirm", "Confirmer");
        button.width = "200px";
        button.paddingTop = 50;
        button.height = "150px";
        button.background = "rgba(24, 61, 69, 1)";
        button.cornerRadius = 10;
        (button.textBlock as TextBlock).fontFamily = "Arial";
        (button.textBlock as TextBlock).fontSize = 30;
        (button.textBlock as TextBlock).color = "white";
        panel.addControl(button);

        button.onPointerClickObservable.add(() => {
            this.friendUI.getSceneManager.getUserX.deleteFriend(this.friend)
                .then((response) => {
                    if (response.success)
                    {
                        this.friendUI.getUpdateChair(this.friendUI.getButtonMeshes);
                        this.friendUI.leaveFriend();
                    }
                    else
                    {
                        const error = new TextBlock();
                        error.text = response.message;
                        error.width = "100%";
                        error.height = "100px";
                        error.color = "rgba(111, 54, 67, 1)";
                        error.fontSize = 50;
                        panel.addControl(error);
                    }
                })
        })

        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(111, 54, 67, 1)";
        })

        button.onPointerOutObservable.add(() => {
            button.background = "rgba(24, 61, 69, 1)";
        })
    }

    private updateCanvasPosition()
    {
        const mesh = this.friendUI.getSceneManager.getMesh("scoreBoard")[1];
        if (!mesh)
            return ;
        const scene = this.friendUI.getSceneManager.getScene();
        const camera = scene.activeCamera;
        if (!camera)
            return ;
        const engine = scene.getEngine();

        let container = document.getElementById("chartContainer");
        if (!container)
            return ;
        
        const bbox = mesh.getBoundingInfo().boundingBox;
        const corners = bbox.vectorsWorld;
        const projected = corners.map(v => camera ? Vector3.Project(
            v,
            Matrix.Identity(),
            scene.getTransformMatrix(),
            camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
        ) : null).filter(p => p !== null) as Vector3[];

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
    }

    private updateCanvas(
        value: number
    ) : void
    {
        const mesh = this.friendUI.getSceneManager.getMesh("scoreBoard")[1];
        const scene = this.friendUI.getSceneManager.getScene();
        const camera = scene.activeCamera;
        const engine = scene.getEngine();

        if (camera === null)
            return ;
        if (this.friend === null)
            return ;

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
        this.chartCanvas = document.getElementById("chartCanvas") as HTMLCanvasElement;
        if (!this.chartCanvas) {
            this.chartCanvas = document.createElement("canvas");
            this.chartCanvas.id = "chartCanvas";
            this.chartCanvas.style.width = "100%";
            this.chartCanvas.style.height = "100%";
            container.appendChild(this.chartCanvas);
        }

        this.updateCanvasPosition();

        // Dessine le graphique
        const ctx = this.chartCanvas.getContext("2d");
        if (ctx === null)
            return ;
        const existingChart = Chart.getChart(this.chartCanvas);
        if (existingChart) existingChart.destroy();

        this.friend.loadMatchs()
            .then ((response) => {
                if (response.success)
                {
                    const matchs = this.friend.getMatchs;
                    if (matchs.length < 1)
                    {
                        const text = new TextBlock();
                        text.width = "800px";
                        text.height = "300px";
                        text.color = "white";
                        text.fontSize = 40;
                        text.fontFamily = "Arial";
                        text.text = "Aucun matchs enregistres";
                        this.containerUI.viewPanel?.addControl(text);
                    }
                    else
                    {
                        const username = this.friend.getUsername;
                        let cumulativeWins = 0;
                        const percentages: number[] = [];
                        const labels: string[] = [];
        
                        matchs.forEach((match, i) => {
                            const userIndex = match.participants.indexOf(username);
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
                                    borderColor: "rgba(111, 54, 67, 1)",
                                    backgroundColor: "rgba(63, 124, 173, 1)",
                                    tension: 0.3,
                                    fill: true,
                                    pointRadius: 4
                                }]
                            },
                            options: { responsive: true, maintainAspectRatio: false }
                        });
                    }
                }
                else
                {
                    const msgInfo = new TextBlock();
                    msgInfo.text = response.message;
                    msgInfo.fontSize = 100;
                    msgInfo.color = "white";
                    msgInfo.fontFamily = "Arial";
                    msgInfo.height = "100px";
                    msgInfo.width = "100%";
                    this.containerUI.viewPanel!.addControl(msgInfo);
                }
            })
    }

    private startLoading(container: StackPanel, msg: string, paddingTop: number)
    {

        const space = new Rectangle();
        space.thickness = 0;
        space.height = paddingTop + "px";
        container.addControl(space);

        const rect = new Rectangle();
        rect.width = "500px";
        rect.height = "300px";
        rect.background = "rgba(51, 51, 51, 1)";
        rect.thickness = 2;
        rect.color = "white";
        container.addControl(rect);

        const panel = new StackPanel();
        panel.isVertical = true;
        panel.width = "500px";
        panel.height = "300px";
        rect.addControl(panel);

        const spinner = new Image("spinner", "icon/loading.png");
        spinner.paddingTop = 10;
        spinner.width = "200px";
        spinner.height = "200px";
        spinner.stretch = Image.STRETCH_UNIFORM;
        panel.addControl(spinner);

        const text = new TextBlock();
        text.text = msg;
        text.fontSize = 30;
        text.height = "100px";
        text.width = "500px";
        text.color = "white";
        text.fontFamily = "Arial";
        panel.addControl(text);


        // Animation simple
        this.spinnerObserver = this.friendUI.getSceneManager
            .getScene().onBeforeRenderObservable.add(() => {
            if (spinner.isVisible) {
                spinner.rotation -= 0.05;
            }
        });
    }

    private displayChart() : void
    {
        const test = new Rectangle();
        test.thickness = 0;
        test.width = "1024px";
        test.paddingTop = 20;
        test.height = "100px";
        this.containerUI.viewPanel!.addControl(test);

        const line = new StackPanel("lineStatsGlobals");
        line.isVertical = false;
        line.width = "1024px";
        line.height = "100px";
        line.spacing = 10;
        line.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        line.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        test.addControl(line);

        const buttons : Rectangle[] = [];
        const self = this;
        let currValue = 5;
        function createButton(value: number) : Rectangle
        {
            const rect = new Rectangle("rectButton " + value);
            rect.width = "150px";
            rect.height = "75px";
            if (currValue === value)
                rect.background = "rgba(24, 61, 69, 1)";
            else
                rect.background = "rgba(51, 51, 51, 1)";
            rect.thickness = 1;
            rect.color = "black";

            buttons.push(rect);

            rect.onPointerClickObservable.add(() => {
                buttons.forEach((rect: Rectangle) => {
                    rect.background = "rgba(51, 51, 51, 1)";
                })
                currValue  = value;
                rect.background = "rgba(24, 61, 69, 1)";
                self.updateCanvas(value);
            });

            rect.onPointerEnterObservable.add(() => {
                if (value !== currValue )
                    rect.background = "rgba(111, 54, 67, 1)";
            });

            rect.onPointerOutObservable.add(() => {
                if (value === currValue )
                    rect.background = "rgba(24, 61, 69, 1)";
                else
                    rect.background = "rgba(51, 51, 51, 1)";
            })

            const text = new TextBlock("textButton " + value);
            if (value === -1)
                text.text = "Max";
            else
                text.text = value.toString();
            text.fontSize = 40;
            text.color = "white";
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

        this.updateCanvas(currValue);
    }

    private displayStatsGlobals() : void
    {
        this.startLoading(this.containerUI.viewPanel!, "Chargement des matchs", 200);
        this.friend.loadMatchs()
            .then((response) => {
                this.friendUI.getSceneManager.getScene().onBeforeRenderObservable.remove(this.spinnerObserver);
                this.containerUI.viewPanel?.clearControls();
                if (response.success)
                {
                    if (this.friend.getMatchs.length > 0)
                        this.displayChart();
                    else
                    {
                        const space = new Rectangle();
                        space.height = "300px";
                        space.thickness = 0;
                        this.containerUI.viewPanel?.addControl(space);

                        const rect = new Rectangle();
                        rect.width = "800px";
                        rect.height = "200px";
                        rect.cornerRadius = 10;
                        rect.background = "rgba(51, 51, 51, 1)";
                        this.containerUI.viewPanel?.addControl(rect);

                        const text = new TextBlock();
                        text.text = `${this.friend.getUsername} a 0 match enregistre`;
                        text.fontSize = 50;
                        text.fontFamily = "Arial";
                        text.color = "white";
                        rect.addControl(text);
                    }
                }
                else
                {
                    const text = new TextBlock();
                    text.text = response.message;
                    text.fontSize = 40;
                    text.fontFamily = "Arial";
                    text.color = "white";
                    this.containerUI.viewPanel?.addControl(text);
                }
            });
        
    }

    private displayHistoric() : void
    {   
        const rect = new Rectangle();
        rect.thickness = 0;
        rect.height = "20px";
        this.containerUI.viewPanel?.addControl(rect);

        const scrollViewer = new ScrollViewer();
        scrollViewer.paddingLeft= 10;
        scrollViewer.width = "970px";
        scrollViewer.height = "700px";
        scrollViewer.background = "transparent";
        scrollViewer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        scrollViewer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        scrollViewer.barColor = "rgba(63, 124, 173, 1)";
        scrollViewer.thickness = 0;
        this.containerUI.viewPanel?.addControl(scrollViewer);

        const historicContainer = new StackPanel();
        historicContainer.width = "100%";
        historicContainer.isVertical = true;
        historicContainer.spacing = 20;
        scrollViewer.addControl(historicContainer);

        this.friend.loadMatchs()
            .then((response) => {
                if (response.success)
                {
                    const matchs = this.friend.getMatchs;
                    if (matchs.length === 0)
                    {
                        const msgInfo = new TextBlock();
                        msgInfo.text = "Aucun match";
                        msgInfo.fontSize = 100;
                        msgInfo.color = "black";
                        msgInfo.fontFamily = "Arial";
                        msgInfo.height = "100px";
                        msgInfo.width = "100%";
                        this.containerUI.viewPanel!.addControl(msgInfo);
                    }
                    else
                        this.displayDataMatchs(historicContainer, matchs);
                }
                else
                {
                    const msgInfo = new TextBlock();
                    msgInfo.text = response.message;
                    msgInfo.fontSize = 100;
                    msgInfo.color = "black";
                    msgInfo.fontFamily = "Arial";
                    msgInfo.height = "100px";
                    msgInfo.width = "100%";
                    this.containerUI.viewPanel!.addControl(msgInfo);
                }
            });
    }

    private displayDataMatchs(container: StackPanel, matchs: Match[])
    {
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
            rect.background = "rgba(51, 51, 51, 1)";
            rect.color = "white";
            rect.thickness = 2;
            container.addControl(rect);

            const line = new StackPanel();
            line.width = "100%";
            line.isVertical = false;
            rect.addControl(line);

            const date = new TextBlock();
            date.text = matchs[i].date.toLocaleDateString('fr-FR');
            date.fontSize = 35;
            date.color = "white";
            date.width = "200px";
            line.addControl(date);

            const p1 = new TextBlock();
            p1.text = matchs[i].participants[0].toString();
            p1.fontSize = 40;
            p1.color = "white";
            p1.width = "200px";
            line.addControl(p1);

            const sc1 = new TextBlock();
            sc1.text = matchs[i].score[0].toString();
            sc1.fontSize = 35;
            if (matchs[i].score[0] > matchs[i].score[1])
                sc1.color = "rgba(177, 67, 168, 1)";
            else
                sc1.color = "white";
            sc1.width = "50px";
            sc1.fontWeight = "bold";
            line.addControl(sc1);

            const sc2 = new TextBlock();
            sc2.text = matchs[i].score[1].toString();
            if (matchs[i].score[1] > matchs[i].score[0])
                sc2.color = "rgba(177, 67, 168, 1)";
            else
                sc2.color = "white";
            sc2.fontSize = 35;
            sc2.width = "50px";
            sc2.fontWeight = "bold";
            line.addControl(sc2);

            const p2 = new TextBlock();
            p2.text = matchs[i].participants[1].toString();
            p2.fontSize = 40;
            p2.color = "white";
            p2.width = "200px";
            line.addControl(p2);

            const dur = new TextBlock();
            dur.text = formatDuration(matchs[i].date.getTime() - matchs[i].startedAt.getTime());
            dur.fontSize = 35;
            dur.color = "white";
            dur.width = "100px";
            line.addControl(dur);
        }
    }
}