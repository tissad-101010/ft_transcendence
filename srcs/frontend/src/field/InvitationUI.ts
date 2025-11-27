// IMPORTS FOR BABYLON.JS
import { AbstractMesh, Vector3, Matrix } from "@babylonjs/core";
import { AdvancedDynamicTexture, ScrollViewer, StackPanel, TextBlock, Control, Rectangle, InputText, Button } from "@babylonjs/gui";

import { FriendUI } from "./FriendUI";
import { ContainerUI } from "./FriendUI";

export class InvitationUI
{
    
    // PROPS
    private friendUI: FriendUI;
    private containerUI: ContainerUI;

    constructor(friendUI: FriendUI)
    {
        this.friendUI = friendUI;
        this.containerUI = this.friendUI.getContainerUI;
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
        this.containerUI.menuPanel.addControl(space);

        const title = new TextBlock();
        title.text = "Ajouter un amis";
        title.fontSize = 100;
        title.fontFamily = "Arial";
        title.color = "black";
        title.width = "100%";
        title.height = "100px";
        this.containerUI.menuPanel.addControl(title);

        const line = new StackPanel();
        line.isVertical = false;
        line.height = "200px";
        line.spacing = 20;
        this.containerUI.menuPanel.addControl(line);
        
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

        // REVOIR LE RETOUR DE PROMISE DE SENDFRIENDINVITE
        const self = this;
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
                    this.containerUI.menuPanel.addControl(msgInfo);
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

        const line = new StackPanel();
        line.isVertical = false;
        line.width = "1200px";
        line.height = "100%";
        
        const sendPanel = new StackPanel();
        sendPanel.width = "600px";
        sendPanel.height = "100%";
        sendPanel.isVertical = true;
        line.addControl(sendPanel);

        const receivedPanel = new StackPanel();
        receivedPanel.isVertical = true;
        receivedPanel.width = "600px";
        receivedPanel.height = "100%";
        line.addControl(receivedPanel);

        
        
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
        this.containerUI.headerPanel.addControl(text);   
    }

    // PRIVATE METHODS
    private displayList(name: string, container: StackPanel) : void
    {
        const scrollViewer = new ScrollViewer();
        scrollViewer.width = "600px";
        scrollViewer.height = "100%";
        scrollViewer.background = "transparent";
        scrollViewer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        scrollViewer.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        scrollViewer.barColor = "white";
        scrollViewer.thickness = 0;
        container.addControl(scrollViewer);

        const listContainer = new StackPanel();
        listContainer.width = "100%";
        listContainer.isVertical = true;
        listContainer.spacing = 20;
        scrollViewer.addControl(listContainer);

        let datas;
        if (name === "sent")
            datas = this.friendUI.getSceneManager.getUserX.getFriendInvitations.sent;
        else if (name === "received")
            datas = self.sceneManager.getUserX.getFriendInvitations.received;
    }

    // GETTERS
}