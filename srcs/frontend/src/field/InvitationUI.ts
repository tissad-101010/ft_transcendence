// IMPORTS FOR BABYLON.JS
import {
    ScrollViewer,
    StackPanel,
    TextBlock,
    Control,
    Rectangle,
    InputText,
    Button
} from "@babylonjs/gui";

import { FriendUI } from "./FriendUI";
import { ContainerUI } from "./FriendUI";
import { FriendInvitation } from "../friends/FriendInvitation";
import { P } from "framer-motion/dist/types.d-BJcRxCew";
import { PromiseUpdateResponse, StatusInvitation } from "../friends/api/friends.api";

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

        const title = new TextBlock();
        title.text = "Ajouter un amis";
        title.fontSize = 100;
        title.fontFamily = "Arial";
        title.color = "black";
        title.width = "100%";
        title.height = "100px";
        this.containerUI.menuPanel?.addControl(title);

        const line = new StackPanel();
        line.isVertical = false;
        line.height = "200px";
        line.spacing = 20;
        this.containerUI.menuPanel?.addControl(line);
        

        const inputText = new InputText();
        inputText.width = "400px";
        inputText.height = "100px";
        inputText.fontSize = 50;
        inputText.fontFamily = "Arial";
        inputText.background = "white";
        inputText.color = "black";
        inputText.focusedBackground = "gray";
        inputText.thickness = 2;
        line.addControl(inputText);

        let msgInfo : TextBlock | null = null;
        let login : string = "";

        // INPUTTEXT EVENT
        inputText.onTextChangedObservable.add(() => {
            login = inputText.text;
        });

        const button = new Rectangle();
        button.width = "200px";
        button.height = "100px";
        button.thickness = 2;
        button.background = "white";
        button.color = "black";
        line.addControl(button);

        const self = this;
        // CLICK ON BUTTON
        button.onPointerClickObservable.add(() => {
            this.friendUI.getSceneManager.getUserX.sendFriendInvite(login)
            .then((res) => {
                if (!msgInfo)
                {
                    msgInfo = new TextBlock();
                    msgInfo.fontSize = 50;
                    msgInfo.color = "black";
                    msgInfo.fontFamily = "Arial";
                    msgInfo.height = "100px";
                    msgInfo.width = "100%";
                    this.containerUI.menuPanel?.addControl(msgInfo);
                }
                console.log(res);
                if (res.success)
                    msgInfo.text = "Invitation envoyée";
                else
                    msgInfo.text = res.message || "error";
            })
            .catch ((err) => {
                console.error("Problème lors de l'appel à sendFriendInvite", err);
            });
        });

        const textButton = new TextBlock();
        textButton.text = "Envoyer";
        textButton.height = "100%";
        textButton.width = "100%";
        textButton.color = "black";
        textButton.fontSize = 50;
        textButton.fontFamily = "Arial";
        button.addControl(textButton);
    }

    public displayContainerR()
    {
        this.friendUI.resetContainerR();

        const title = new TextBlock("Title invitation");
        title.text = "Invitations :";
        title.color = "black";
        title.fontSize = 100;
        title.fontFamily = "Arial";
        title.width = "100%";
        title.height = "200px";
        this.containerUI.viewPanel?.addControl(title);

        const navigationButtonsPanel = new StackPanel("NavigationPanel");
        navigationButtonsPanel.isVertical = false;
        navigationButtonsPanel.height = "200px";
        navigationButtonsPanel.spacing = 20;
        this.containerUI.viewPanel?.addControl(navigationButtonsPanel);

        const scrollViewer = new ScrollViewer();
        scrollViewer.width = "800px";
        scrollViewer.height = "100%";
        scrollViewer.background = "transparent";
        scrollViewer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        scrollViewer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        scrollViewer.barColor = "white";
        scrollViewer.thickness = 0;
        this.containerUI.viewPanel?.addControl(scrollViewer);

        const listContainer = new StackPanel();
        listContainer.width = "100%";
        listContainer.isVertical = true;
        listContainer.spacing = 20;
        scrollViewer.addControl(listContainer);

        navigationButtonsPanel.addControl(this.createButtonNavigation(Page.RECEIVED, listContainer));
        navigationButtonsPanel.addControl(this.createButtonNavigation(Page.SENT, listContainer));
        navigationButtonsPanel.addControl(this.createButtonNavigation(Page.BLOCKED, listContainer));

        this.displayList(listContainer);
    }

    public displayHeader()
    {
        this.friendUI.resetHeader();

        const text = new TextBlock();
        text.text = "Gestion amis";
        text.color = "black";
        text.fontSize = 100;
        text.width = "100%";
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
            const panel = new StackPanel("panelInvite");
            panel.height = "200px";
            panel.isVertical = false;
            panel.spacing = 10;
            panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            container.addControl(panel);
    
            const username = new TextBlock();
            username.width = "300px";
            username.height = "200px";
            username.fontSize = 50;
            username.color = "black";
            username.fontFamily = "Arial";
            if (this.currView === Page.SENT)
                username.text = (d as FriendInvitation).getUsernames[1];
            else if (this.currView === Page.RECEIVED)
                username.text = (d as FriendInvitation).getUsernames[0];
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
            const cancel = Button.CreateSimpleButton("cancel", "Annuler");
            if (this.currView === Page.SENT)
                cancel.onPointerClickObservable.add(() => {
                    this.friendUI.getSceneManager.getUserX.deleteInvitation(
                        (d as FriendInvitation))
                            .then((response : PromiseUpdateResponse) => {
                                console.log(response.message);
                            }
                    )
                });
            else
                cancel.onPointerClickObservable.add(() => {
                    this.friendUI.getSceneManager.getUserX.deleteBlocked(
                        (d as string))
                            .then((response : PromiseUpdateResponse) => {
                                console.log(response.message);
                            }
                    )
                });
            applyStyle("rgba(177, 67, 168, 1)", cancel);
            b.push(cancel);
        }
        else if (this.currView === Page.RECEIVED)
        {
            const accept = Button.CreateSimpleButton("accept", "Accepter");
            accept.onPointerClickObservable.add(() => {
                this.friendUI.getSceneManager.getUserX.updateInvitation(
                    (d as FriendInvitation), StatusInvitation.ACCEPTED)
                        .then((response) => {
                            console.log(response.message);
                        })
            });

            const declined = Button.CreateSimpleButton("decline", "Refuser");
            declined.onPointerClickObservable.add(() => {
                this.friendUI.getSceneManager.getUserX.updateInvitation(
                    (d as FriendInvitation), StatusInvitation.DECLINED)
                        .then((response) => {
                            console.log(response.message);
                        })
            });

            const blocked = Button.CreateSimpleButton("block", "Bloquer");
            blocked.onPointerClickObservable.add(() => {
                this.friendUI.getSceneManager.getUserX.updateInvitation(
                    (d as FriendInvitation), StatusInvitation.BLOCKED)
                        .then((response) => {
                            console.log(response.message);
                        })
            });

            applyStyle("rgba(30, 68, 99, 1)", accept);
            applyStyle("rgba(177, 67, 168, 1)", declined);
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
            button.width = "100px";
            button.height = "75px";
            (button.textBlock as TextBlock).fontSize = 20;
            (button.textBlock as TextBlock).color = "white";

        };
        return (b);
    }

    private createButtonNavigation(page: Page, container: StackPanel) : Button
    {
        let label: string = "";
        if (page === Page.SENT)
            label = "Envoyees";
        else if (page === Page.RECEIVED)
            label = "Recues";
        else if (page === Page.BLOCKED)
            label = "Bloquees";
        const button = Button.CreateSimpleButton(label + "Button", label);
        button.width = "200px";
        button.height = "100px";
        button.color = "rgba(51, 51, 51, 1)";
        if (page === this.currView)
            button.background = 'rgba(40, 80, 112, 1)';
        else
            button.background = 'rgba(51, 51, 51, 1)';
        button.cornerRadius = 5;
        button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        button.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        (button.textBlock as TextBlock).color = "white";
        (button.textBlock as TextBlock).fontSize = 25;

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

        return (button);
    }

    // GETTERS
}