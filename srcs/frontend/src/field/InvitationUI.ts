// IMPORTS FOR BABYLON.JS
import {
    ScrollViewer,
    StackPanel,
    TextBlock,
    Control,
    Rectangle,
    InputText,
    Button,
    Image
} from "@babylonjs/gui";

import { FriendUI } from "./FriendUI";
import { ContainerUI } from "./FriendUI";
import { FriendInvitation } from "../friends/FriendInvitation";
import { P } from "framer-motion/dist/types.d-BJcRxCew";
import { PromiseUpdateResponse, StatusInvitation } from "../friends/api/friends.api";
import { url } from "inspector";

enum Page
{
    SENT,
    BLOCKED,
    RECEIVED
}

export class InvitationUI
{
    
    // PROPS
    private friendUI: FriendUI;
    private containerUI: ContainerUI;
    private currView: Page;
    private buttons: Button[];
    private textLog: TextBlock | null = null;

    constructor(friendUI: FriendUI)
    {
        this.friendUI = friendUI;
        this.containerUI = this.friendUI.getContainerUI;
        this.currView = Page.RECEIVED;
        this.buttons = [];
    }

    // PUBLICS METHODS
    public display()
    {
        this.displayHeader();
        this.displayContainerL();
        this.displayContainerR();
    }

    public displayContainerL()
    {
        this.friendUI.resetContainerL();

        const space = new Rectangle();
        space.height = "100px";
        space.thickness = 0;
        this.containerUI.menuPanel?.addControl(space);

        const line = new StackPanel();
        line.isVertical = false;
        line.height = "200px";
        line.spacing = 20;
        this.containerUI.menuPanel?.addControl(line);
        
        const containerInput = new Rectangle();
        containerInput.width = "500px";
        containerInput.height = "150px";
        containerInput.thickness = 5;
        containerInput.color = "rgba(75, 75, 75, 1)";
        containerInput.cornerRadius = 10;
        line.addControl(containerInput);

        const inputText = new InputText();
        inputText.width = "100%";
        inputText.height = "100%";
        inputText.fontSize = 50;
        inputText.fontFamily = "Arial";
        inputText.background = "rgba(51, 51, 51, 1)";
        inputText.color = "white";
        inputText.focusedBackground = "gray";
        inputText.placeholderText = "Ajouter un amis";
        inputText.thickness = 0;
        containerInput.addControl(inputText);

        let msgInfo : TextBlock | null = null;
        let login : string = "";

        // INPUTTEXT EVENT
        inputText.onTextChangedObservable.add(() => {
            login = inputText.text;
        });

        const button = Button.CreateImageOnlyButton("send", "icon/sended.png");
        button.width = "140px";
        button.height = "140px";
        button.color = "rgba(75, 75, 75, 1)";
        button.background = 'rgba(51, 51, 51, 1)';
        button.cornerRadius = 10;
        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        (button.image as Image).width = "70px";
        (button.image as Image).height = "70px";
        (button.image as Image).stretch = Image.STRETCH_UNIFORM;
        (button.image as Image).horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        (button.image as Image).verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        line.addControl(button);

        const containerLog = new Rectangle();
        containerLog.paddingTop = 300;
        containerLog.width = "950px";
        containerLog.height = "400px";
        containerLog.background = "rgba(51, 51, 51, 1)";
        containerLog.thickness = 2;
        containerLog.cornerRadius = 10;
        containerLog.color = "rgba(75, 75, 75, 1)";
        this.containerUI.menuPanel?.addControl(containerLog);

        const logLine = new StackPanel();
        logLine.isVertical = false;
        logLine.width = "950px";
        logLine.height = "300px";
        // logLine.spacing = 20;
        containerLog.addControl(logLine);

        const logSpace = new Rectangle();
        logSpace.thickness = 0;
        logSpace.width = "50px";
        logLine.addControl(logSpace);

        const imgLeft = new Image("infoLeft", "icon/info.png");
        imgLeft.width = "50px";
        imgLeft.height = "50px";
        logLine.addControl(imgLeft);

        this.textLog = new TextBlock();
        this.textLog.text = "";
        this.textLog.color = "white";
        this.textLog.fontSize = 40;
        this.textLog.width = "725px";
        this.textLog.fontFamily = "Arial";
        logLine.addControl(this.textLog);

        const imgRight = new Image("infoRight", "icon/info.png");
        imgRight.width = "50px";
        imgRight.height = "50px";
        logLine.addControl(imgRight);

        // CLICK ON BUTTON
        button.onPointerClickObservable.add(() => {
            this.friendUI.getSceneManager.getUserX.sendFriendInvite(login)
            .then((res) => {
                console.log(res);
                if (res.success)
                {
                    this.textLog!.text = "Invitation envoyée";
                    this.textLog!.color = "rgba(40, 80, 112, 1)";
                }
                else
                {
                    this.textLog!.text = res.message || "error";
                    this.textLog!.color = "rgba(177, 67, 168, 1)";
                }
            })
            .catch ((err: any) => {
                console.error("Problème lors de l'appel à sendFriendInvite", err);
                this.textLog!.text = err.message;
                this.textLog!.color = "rgba(177, 67, 168, 1)";
            });
        });

        button.onPointerEnterObservable.add(() => {
            button.background = "rgba(111, 54, 67, 1)";            
        });

        button.onPointerOutObservable.add(() => {
            button.background = "rgba(51, 51, 51, 1)";
        })
    }

    public displayContainerR()
    {
        this.friendUI.resetContainerR();

        const navigationButtonsPanel = new StackPanel("NavigationPanel");
        navigationButtonsPanel.isVertical = false;
        navigationButtonsPanel.height = "200px";
        navigationButtonsPanel.spacing = 20;
        this.containerUI.viewPanel?.addControl(navigationButtonsPanel);

        const scrollViewer = new ScrollViewer();
        scrollViewer.width = "800px";
        scrollViewer.height = "500px";
        scrollViewer.background = "transparent";
        scrollViewer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        scrollViewer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        scrollViewer.barColor = "white";
        scrollViewer.thickness = 0;
        this.containerUI.viewPanel?.addControl(scrollViewer);

        const listContainer = new StackPanel();
        listContainer.width = "100%";
        listContainer.isVertical = true;
        listContainer.spacing = 10;
        scrollViewer.addControl(listContainer);

        const updateButton = Button.CreateImageButton("update", "", "icon/update.png");
        updateButton.width = "200px";
        updateButton.height = "100px";
        updateButton.color = "rgba(75, 75, 75, 1)";
        updateButton.background = 'rgba(51, 51, 51, 1)';
        updateButton.cornerRadius = 10;
        updateButton.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        updateButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        (updateButton.image as Image).width = "150px";
        (updateButton.image as Image).height = "75px";
        (updateButton.image as Image).stretch = Image.STRETCH_UNIFORM;
        (updateButton.image as Image).horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        (updateButton.image as Image).verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        updateButton.onPointerClickObservable.add(() => {
            this.friendUI.getSceneManager.getUserX.loadDataFriends()
                .then((response) => {
                    this.textLog!.text = response.message;
                    if (response.success)
                        this.textLog!.color = "rgba(63, 124, 173, 1)";
                    else
                        this.textLog!.color = "rgba(177, 67, 168, 1)";
                    this.displayContainerR();
                });
        });

        updateButton.onPointerEnterObservable.add(() => {
            updateButton.background = "rgba(111, 54, 67, 1)";            
        });

        updateButton.onPointerOutObservable.add(() => {
            updateButton.background = "rgba(51, 51, 51, 1)";
        })

        navigationButtonsPanel.addControl(this.createButtonNavigation(Page.RECEIVED, listContainer));
        navigationButtonsPanel.addControl(this.createButtonNavigation(Page.SENT, listContainer));
        navigationButtonsPanel.addControl(this.createButtonNavigation(Page.BLOCKED, listContainer));
        navigationButtonsPanel.addControl(updateButton);

        this.displayList(listContainer);
    }

    public displayHeader()
    {
        this.friendUI.resetHeader();

        const text = new TextBlock();
        text.text = "Gestion amis";
        text.color = "black";
        text.fontSize = 100;
        text.paddingTop = "125px";
        text.width = "1024px";
        text.height = "1024px";
        text.fontFamily = "Arial";
        text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        text.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.containerUI.headerPanel?.addControl(text);   
    }

    // PRIVATE METHODS
    private displayList(container: StackPanel) : void
    {
        let data : FriendInvitation[] | string[];
        if (this.currView === Page.SENT)
            data = this.friendUI.getSceneManager.getUserX.getFriendInvitations.sent;
        else if (this.currView === Page.RECEIVED)
            data = this.friendUI.getSceneManager.getUserX.getFriendInvitations.received;
        else 
            data = this.friendUI.getSceneManager.getUserX.getUserBlockeds;

        container.clearControls();

        data.forEach((d: string | FriendInvitation) => {
            const rect = new Rectangle();
            rect.background = "rgba(51, 51, 51, 1)";
            rect.color = "rgba(75, 75, 75, 1)";
            rect.cornerRadius = 20;
            rect.width = "1100px";
            rect.height = "100px";
            container.addControl(rect);

            const panel = new StackPanel("panelInvite");
            panel.width = "1100px";
            panel.height = "100px";
            panel.isVertical = false;
            panel.spacing = 5;
            panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            rect.addControl(panel);

            const username = new TextBlock();
            username.paddingLeft = 200;
            username.height = "100px";
            username.width = "675px"
            username.textWrapping = true;
            username.fontSize = 30;
            username.color = "white";
            username.fontFamily = "Arial";
            username.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            if (this.currView === Page.SENT)
                username.text = (d as FriendInvitation).getUsernames[1]
                    + " - " + (d as FriendInvitation).getCreatedAt.toLocaleDateString("fr-FR");
            else if (this.currView === Page.RECEIVED)
                username.text = (d as FriendInvitation).getUsernames[0]
                    + " - " + (d as FriendInvitation).getCreatedAt.toLocaleDateString("fr-FR");
            else if (this.currView === Page.BLOCKED)
                username.text = (d as string);
            panel.addControl(username);

            const buttons = this.createButtonsInvitation(d);
            buttons.forEach((b) => {
                panel.addControl(b);
            });
        });
    }

    private createButtonsInvitation(d: string | FriendInvitation) : Button[]
    {
        const b: Button[] = [];

        if (this.currView === Page.SENT || this.currView === Page.BLOCKED)
        {
            const cancel = Button.CreateImageButton("cancel", "", "icon/cancel.png");
            if (this.currView === Page.SENT)
                cancel.onPointerClickObservable.add(() => {
                    this.friendUI.getSceneManager.getUserX.deleteInvitation(
                        (d as FriendInvitation))
                            .then((response : PromiseUpdateResponse) => {
                                this.textLog!.text = response.message;
                                if (response.success)
                                    this.textLog!.color = "rgba(63, 124, 173, 1)";
                                else
                                    this.textLog!.color = "rgba(177, 67, 168, 1)";
                                this.displayContainerR();
                            }
                    )
                });
            else
                cancel.onPointerClickObservable.add(() => {
                    this.friendUI.getSceneManager.getUserX.deleteBlocked(
                        (d as string))
                            .then((response : PromiseUpdateResponse) => {
                                this.textLog!.text = response.message;
                                if (response.success)
                                    this.textLog!.color = "rgba(63, 124, 173, 1)";
                                else
                                    this.textLog!.color = "rgba(177, 67, 168, 1)";
                                this.displayContainerR();
                            }
                    )
                });
            applyStyle("rgba(177, 67, 168, 1)", cancel);
            b.push(cancel);
        }
        else if (this.currView === Page.RECEIVED)
        {
            const accept = Button.CreateImageButton("accept", "", "icon/accept.png");
            accept.onPointerClickObservable.add(() => {
                this.friendUI.getSceneManager.getUserX.updateInvitation(
                    (d as FriendInvitation), StatusInvitation.ACCEPTED)
                        .then((response) => {
                            this.textLog!.text = response.message;
                                if (response.success)
                                    this.textLog!.color = "rgba(63, 124, 173, 1)";
                                else
                                    this.textLog!.color = "rgba(177, 67, 168, 1)";
                            this.displayContainerR();
                        })
            });

            const declined = Button.CreateImageButton("decline", "", "icon/cancel.png");
            declined.onPointerClickObservable.add(() => {
                this.friendUI.getSceneManager.getUserX.updateInvitation(
                    (d as FriendInvitation), StatusInvitation.DECLINED)
                        .then((response) => {
                            this.textLog!.text = response.message;
                                if (response.success)
                                    this.textLog!.color = "rgba(63, 124, 173, 1)";
                                else
                                    this.textLog!.color = "rgba(177, 67, 168, 1)";
                            this.displayContainerR();
                        })
            });

            const blocked = Button.CreateImageButton("block", "", "icon/blocked.png");
            blocked.onPointerClickObservable.add(() => {
                this.friendUI.getSceneManager.getUserX.updateInvitation(
                    (d as FriendInvitation), StatusInvitation.BLOCKED)
                        .then((response) => {
                            this.textLog!.text = response.message;
                                if (response.success)
                                    this.textLog!.color = "rgba(63, 124, 173, 1)";
                                else
                                    this.textLog!.color = "rgba(177, 67, 168, 1)";
                            this.displayContainerR();
                        })
            });

            applyStyle("rgba(24, 61, 69, 1)", accept);
            applyStyle("rgba(111, 54, 67, 1)", declined);
            applyStyle("rgba(99, 30, 30, 1)", blocked);
            b.push(accept);
            b.push(declined);
            b.push(blocked);
        }

        function applyStyle(color: string, button: Button) : void
        {
            button.color = color;
            button.background = color;
            button.cornerRadius = 5;
            button.width = "75px";
            button.height = "75px";
            (button.image as Image).width = "35px";
            (button.image as Image).height = "35px";
            (button.image as Image).stretch = Image.STRETCH_UNIFORM;
            (button.image as Image).horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            (button.image as Image).verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        };
        return (b);
    }

    private createButtonNavigation(page: Page, container: StackPanel) : Button
    {
        let label: string = "";
        let urlImg: string = "";
        if (page === Page.SENT)
        {
            label = "Envoyees";
            urlImg = "icon/sended.png";
        }
        else if (page === Page.RECEIVED)
        {
            label = "Recues";
            urlImg = "icon/received.png";
        }
        else if (page === Page.BLOCKED)
        {
            label = "Bloquees";
            urlImg = "icon/blocked.png";
        }
        const button = Button.CreateImageButton(label + "Button", "", urlImg);
        button.width = "200px";
        button.height = "100px";
        button.color = "rgba(75, 75, 75, 1)";
        if (page === this.currView)
            button.background = 'rgba(24, 61, 69, 1)';
        else
            button.background = 'rgba(51, 51, 51, 1)';
        button.cornerRadius = 10;
        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        (button.image as Image).width = "150px";
        (button.image as Image).height = "75px";
        (button.image as Image).stretch = Image.STRETCH_UNIFORM;
        (button.image as Image).horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        (button.image as Image).verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;


        // (button.textBlock as TextBlock).color = "white";
        // (button.textBlock as TextBlock).fontSize = 25;

        this.buttons.push(button);

        button.onPointerClickObservable.add(() => {
            if (page !== this.currView)
            {
                this.buttons.forEach((b) => b.background = "rgba(51, 51, 51, 1)");
                this.currView = page;
                button.background = "rgba(40, 80, 112, 1)";
                this.displayList(container);
            }
        });

        button.onPointerEnterObservable.add(() => {
            if (page !== this.currView)
                button.background = "rgba(111, 54, 67, 1)";            
        });

        button.onPointerOutObservable.add(() => {
            if (page !== this.currView)
                button.background = "rgba(51, 51, 51, 1)";   
            else       
                button.background = "rgba(40, 80, 112, 1)";
        })

        
        return (button);
    }

    // GETTERS
}