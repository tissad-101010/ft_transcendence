import { Scene, AbstractMesh, StandardMaterial } from "@babylonjs/core";
import { AdvancedDynamicTexture, ScrollViewer, StackPanel, TextBlock, Control, Rectangle, Grid, Ellipse, Button, InputTextArea } from "@babylonjs/gui";

import { UserX } from "../UserX.ts";
import { Friend } from "../friends/Friend.ts";
import { Message } from "../friends/Friend.ts";

import WebSocket from "isomorphic-ws";

export class Chat3D {
    private advancedTexture: AdvancedDynamicTexture;
    private mesh: AbstractMesh;
    private online: boolean;
    private originalMaterial: StandardMaterial | null = null;

    private scrollViewer: ScrollViewer;
    private chatContainer: StackPanel;
    private loginText: TextBlock;
    private onlineIcon: Ellipse;
    private sendBtn: Button;

    private friend: Friend;
    private lastDate: Date | null;
    private userX: UserX;

    private ws: WebSocket | null = null;

    constructor(scene: Scene, mesh: AbstractMesh, friend: Friend, userX: UserX) {
        this.mesh = mesh;
        this.online = false;
        this.friend = friend;
        this.lastDate = null;
        this.userX = userX;

        this.originalMaterial = mesh.material;
        this.advancedTexture = AdvancedDynamicTexture.CreateForMesh(mesh);
        
        const backgroundRect = new Rectangle();
        backgroundRect.width = "65%";
        backgroundRect.height = "100%";
        backgroundRect.background = "#363636AA";
        backgroundRect.thickness = 3;
        this.advancedTexture.addControl(backgroundRect);

        const mainGrid = new Grid();
        mainGrid.width = "100%";
        mainGrid.height = "100%";
        backgroundRect.addControl(mainGrid);

        mainGrid.addRowDefinition(0.12);
        mainGrid.addRowDefinition(0.68);
        mainGrid.addRowDefinition(0.10);
        mainGrid.addRowDefinition(0.10);

        const loginRect = new Rectangle();
        loginRect.width = "800px";
        loginRect.height = "100%";
        loginRect.background = "#026379AA";
        loginRect.thickness = 0;
        mainGrid.addControl(loginRect, 0, 0);

        const headerGrid = new Grid();
        headerGrid.width = "40%";
        headerGrid.height = "100%";
        loginRect.addControl(headerGrid);

        headerGrid.addColumnDefinition(0.70);
        headerGrid.addColumnDefinition(0.10);

        this.loginText = new TextBlock();
        this.loginText.text = friend.getUsername;
        this.loginText.color = "white";
        this.loginText.fontSize = 40;
        this.loginText.paddingLeft = "30px";
        this.loginText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.loginText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        headerGrid.addControl(this.loginText, 0, 0);

        this.onlineIcon = new Ellipse();
        this.onlineIcon.width = "26px";
        this.onlineIcon.height = "26px";
        this.onlineIcon.background = friend.getOnline ? "#53d6d0ff" : "#ca0e4fff";
        this.onlineIcon.thickness = 2;
        this.onlineIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        headerGrid.addControl(this.onlineIcon, 0, 1);

        const msgContainer = new Rectangle();
        msgContainer.width = "100%";
        msgContainer.height = "100%";
        msgContainer.background = "#2a2a2aAA";
        msgContainer.thickness = 0;
        msgContainer.clipChildren = true;
        mainGrid.addControl(msgContainer, 1, 0);

        this.scrollViewer = new ScrollViewer();
        this.scrollViewer.width = "100%";
        this.scrollViewer.height = "100%";
        this.scrollViewer.background = "transparent";
        this.scrollViewer.thickness = 0;
        this.scrollViewer.horizontalBarVisible = false;
        msgContainer.addControl(this.scrollViewer);

        this.chatContainer = new StackPanel("chatcontainer");
        this.chatContainer.width = "100%";
        this.chatContainer.isVertical = true;
        this.chatContainer.spacing = 8;
        this.scrollViewer.addControl(this.chatContainer);

        const inputGrid = new Grid("inputgrid");
        inputGrid.width = "100%";
        inputGrid.height = "100%";
        mainGrid.addControl(inputGrid, 2, 0);

        inputGrid.addColumnDefinition(0.7);
        inputGrid.addColumnDefinition(0.3);

        const inputTxt = new InputTextArea();
        inputTxt.width = "100%";
        inputTxt.height = "80%";
        inputTxt.color = "white";
        inputTxt.fontSize = 25;
        inputTxt.background = "#444444AA";
        inputTxt.placeholderText = "Tapez votre message...";
        inputGrid.addControl(inputTxt, 0, 0);

        this.sendBtn = Button.CreateSimpleButton("sendBtn", "Envoyer");
        this.sendBtn.width = "90%";
        this.sendBtn.height = "80%";
        this.sendBtn.color = "white";
        this.sendBtn.background = "#026379AA";
        this.sendBtn.fontSize = 25;
        this.sendBtn.cornerRadius = 10;
        inputGrid.addControl(this.sendBtn, 0, 1);

        this.sendBtn.onPointerUpObservable.add(() => {
            const message = inputTxt.text.trim();
            if (message.length === 0) return;

            this.addMessage(this.userX.getUser!.username, message, new Date());

            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                console.error("WebSocket non connecté.");
                return;
            }

            this.ws.send(JSON.stringify({
                type: "send_message",
                from: this.userX.getUser!.username,
                to: this.friend.getUsername,
                text: message,
            }));

            inputTxt.text = "";
        });

        this.displayHistory();
        this.initWebSocket();
        

        const optionsGrid = new Grid("gridOpt");
        optionsGrid.width = "100%";
        optionsGrid.height = "100%";
        optionsGrid.background = "#1f1f1fAA";
        optionsGrid.addColumnDefinition(0.33);
        optionsGrid.addColumnDefinition(0.33);
        optionsGrid.addColumnDefinition(0.34);
        mainGrid.addControl(optionsGrid, 3, 0);

        const inviteBtn = Button.CreateSimpleButton("inviteBtn", "Inviter");
        inviteBtn.width = "90%";
        inviteBtn.height = "70%";
        inviteBtn.color = "white";
        inviteBtn.background = "#3a8dde";
        inviteBtn.fontSize = 22;
        inviteBtn.cornerRadius = 10;
        optionsGrid.addControl(inviteBtn, 0, 0);

        const blockBtn = Button.CreateSimpleButton("blockBtn", "Bloquer");
        blockBtn.width = "90%";
        blockBtn.height = "70%";
        blockBtn.color = "white";
        blockBtn.background = "#c0392b";
        blockBtn.fontSize = 22;
        blockBtn.cornerRadius = 10;
        optionsGrid.addControl(blockBtn, 0, 1);

        const profileBtn = Button.CreateSimpleButton("profileBtn", "Profil");
        profileBtn.width = "90%";
        profileBtn.height = "70%";
        profileBtn.color = "white";
        profileBtn.background = "#27ae60";
        profileBtn.fontSize = 22;
        profileBtn.cornerRadius = 10;
        optionsGrid.addControl(profileBtn, 0, 2);
    }

    private initWebSocket() {
        this.ws = new WebSocket("wss://localhost:8443/chat/ws");

        this.ws.onopen = () => {
            console.log("WebSocket connecté.");

            // ➜ ENVOYER ICI UNIQUEMENT
            this.ws!.send(JSON.stringify({
                type: "init_connection",
                from: this.userX.getUser!.username,
            }));
            
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data.toString());

                if (data.type === "new_message") {
                    const msg: Message = data.message;
                    this.addMessage(msg.senderUsername, msg.content, new Date(msg.sentAt));
                }
            } catch (e) {
                console.error("WS parse error", e);
            }
        };

        this.ws.onerror = (err) => {
            console.error("Erreur WebSocket", err);
        };

        this.ws.onclose = () => {
            console.warn("WebSocket fermé. Reconnexion dans 2s…");
            setTimeout(() => this.initWebSocket(), 2000);
        };
    }

    smoothScrollTo(scrollViewer: ScrollViewer, target: number, speed: number = 10): void {
        const step = () => {
            const diff = target - scrollViewer.scrollTop;
            if (Math.abs(diff) < 1) return;
            scrollViewer.scrollTop += diff / speed;
            requestAnimationFrame(step);
        };
        step();
    }

    areMessagesOnDifferentDays(date: Date): boolean {
        return (
            !this.lastDate ||
            this.lastDate.getFullYear() !== date.getFullYear() ||
            this.lastDate.getMonth() !== date.getMonth() ||
            this.lastDate.getDate() !== date.getDate()
        );
    }

    displayDate(date: Date): void {
        const dateText = new TextBlock();
        dateText.text = date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });
        dateText.color = "white";
        dateText.fontSize = 18;
        dateText.width = "100%";
        dateText.height = "40px";
        dateText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        dateText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.chatContainer.addControl(dateText);
        this.lastDate = date;
    }

    async displayHistory(): Promise<void> {
        const msgs = await this.friend.loadMessages(this.userX.getUser!.username);
        if (msgs.length === 0) return;

        msgs.forEach((msg) => {
            this.addMessage(msg.senderUsername, msg.content, new Date(msg.sentAt));
        });
    }

    updateChat(friend: Friend): void {
        this.loginText.text = friend.getUsername;
        this.onlineIcon.background = friend.getOnline ? "#128354ff" : "#e58ab8ff";
        this.chatContainer.clearControls();
        this.friend = friend;
        this.displayHistory();
    }

    estimateTextHeight(text: string, fontSize: number, containerWidth: number, fontFamily = "Arial", lineHeight = 1.2): number {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        ctx.font = `${fontSize}px ${fontFamily}`;

        const words = text.split(/\s+/);
        let line = "";
        let lineCount = 1;

        for (let word of words) {
            const testLine = line + word + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > containerWidth && line !== "") {
                line = word + " ";
                lineCount++;
            } else {
                line = testLine;
            }
        }
        return lineCount * fontSize * lineHeight;
    }

    estimateTextWidth(text: string, fontSize: number, fontFamily = "Arial"): number {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        ctx.font = `${fontSize}px ${fontFamily}`;
        const metrics = ctx.measureText(text);
        return metrics.width;
    }

    addMessage(sender: string, text: string, date: Date) {
        const estHeight = this.estimateTextHeight(text, 34, 700, "Arial");
        const estWidth = this.estimateTextWidth(text, 34, "Arial");

        if (this.areMessagesOnDifferentDays(date))
            this.displayDate(date);

        const msgRect = new Rectangle();
        msgRect.width = (estWidth < 400 ? estWidth + 40 : 400) + "px";
        msgRect.height = estHeight + "px";
        msgRect.cornerRadius = 10;
        msgRect.thickness = 0;
        msgRect.background = sender !== this.friend.getUsername ? "rgba(104, 174, 179, 1)" : "#d397a6ff";
        msgRect.horizontalAlignment =
            sender !== this.friend.getUsername
                ? Control.HORIZONTAL_ALIGNMENT_RIGHT
                : Control.HORIZONTAL_ALIGNMENT_LEFT;

        const msgText = new TextBlock();
        msgText.text = text;
        msgText.color = "white";
        msgText.width = "100%";
        msgText.paddingLeft = "10px";
        msgText.paddingRight = "10px";
        msgText.fontSize = 24;
        msgText.textWrapping = true;
        msgRect.addControl(msgText);

        this.chatContainer.addControl(msgRect);
        this.scrollViewer.verticalBar.value = this.scrollViewer.verticalBar.maximum;
    }

    public dispose() {
        if (this.advancedTexture) {
            this.advancedTexture.rootContainer.dispose();
            this.advancedTexture.clear();
            this.advancedTexture.dispose();
            this.advancedTexture = null!;
        }

        if (this.mesh && !this.mesh.isDisposed()) {
            this.mesh.material = this.originalMaterial;
            this.mesh.isVisible = true;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}
