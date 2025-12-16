import { 
    Scene,
    AbstractMesh,
    Nullable,
    Material 
} from "@babylonjs/core";

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
    InputTextArea
} from "@babylonjs/gui";

import { UserX } from "../UserX.ts";
import { Friend } from "../friends/Friend.ts";

import WebSocket from "isomorphic-ws";
import { chatApi } from "../chatApi/chat.api.ts";
import { SceneManager } from "../scene/SceneManager.ts";
import { ZoneName } from "../config.ts";
import { PoolInteraction } from "./PoolInteraction.ts";
import { StandsInteraction } from "../field/StandsInteraction.ts";

export class Chat3D {
    private advancedTexture: AdvancedDynamicTexture;
    private mesh: AbstractMesh;
    private online: boolean;
    private originalMaterial: Nullable<Material> | null = null;

    private scrollViewer: ScrollViewer;
    private chatContainer: StackPanel;
    private loginText: TextBlock;
    private onlineIcon: Ellipse;
    private sendBtn: Button;

    private friend: Friend;
    private lastDate: Date | null;
    private userX: UserX;
    private sceneManager: SceneManager;
    private poolInteraction: PoolInteraction;

    private ws: WebSocket | null = null;

    constructor(scene: Scene, mesh: AbstractMesh, friend: Friend, userX: UserX, sceneManager: SceneManager, interaction: PoolInteraction) {
        this.mesh = mesh;
        this.online = false;
        this.friend = friend;
        this.lastDate = null;
        this.userX = userX;
        this.sceneManager = sceneManager;
        this.poolInteraction = interaction;

        this.originalMaterial = mesh.material;
        this.advancedTexture = AdvancedDynamicTexture.CreateForMesh(mesh);

        const backgroundRect = new Rectangle();
        backgroundRect.width = "50%";
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
        loginRect.background = "#ceb5b3ff";
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
        this.onlineIcon.background = friend.getOnline ? "#1f9e69ff" : "#cc6475ff";
        this.onlineIcon.thickness = 2;
        this.onlineIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        headerGrid.addControl(this.onlineIcon, 0, 1);

        const msgContainer = new Rectangle();
        msgContainer.width = "100%";
        msgContainer.height = "100%";
        msgContainer.background = "#02505ac4";
        msgContainer.thickness = 0;
        msgContainer.clipChildren = true;
        mainGrid.addControl(msgContainer, 1, 0);

        this.scrollViewer = new ScrollViewer();
        this.scrollViewer.width = "100%";
        this.scrollViewer.height = "100%";
        this.scrollViewer.background = "transparent";
        this.scrollViewer.thickness = 0;
        // this.scrollViewer.horizontalBarVisible = false;
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
        inputTxt.width = "80%";
        inputTxt.height = "80%";
        inputTxt.color = "white";
        inputTxt.fontSize = 25;
        inputTxt.background = "#444444AA";
        inputTxt.placeholderText = "Enter a message...";
        inputGrid.addControl(inputTxt, 0, 0);

        this.sendBtn = Button.CreateSimpleButton("sendBtn", "Send");
        this.sendBtn.width = "90%";
        this.sendBtn.height = "80%";
        this.sendBtn.color = "white";
        this.sendBtn.background = "#caaba8";
        this.sendBtn.fontSize = 25;
        this.sendBtn.cornerRadius = 10;
        inputGrid.addControl(this.sendBtn, 0, 1);

        this.sendBtn.onPointerUpObservable.add(() => {
            const message = inputTxt.text.trim();
            if (message.length === 0) return;

            this.addMessage(this.userX.getUser!.username, message, new Date());

            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                console.error("WebSocket not connected.");
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
        optionsGrid.addColumnDefinition(0.34);
        mainGrid.addControl(optionsGrid, 3, 0);

        const blockBtn = Button.CreateSimpleButton("blockBtn", "Block");
        blockBtn.width = "90%";
        blockBtn.height = "70%";
        blockBtn.color = "white";
        blockBtn.background = "#c06e7cff";
        blockBtn.fontSize = 22;
        blockBtn.cornerRadius = 10;
        optionsGrid.addControl(blockBtn, 0, 0);

        blockBtn.onPointerClickObservable.add(() => {
            this.userX.blockFriend(this.friend).then((response) => {
                // METTRE A JOUR L"AFFICHAGE SELON REPONSE
                if (response.success)
                {
                    const testRect = new Rectangle();
                    testRect.width = "50%";
                    testRect.height = "100%";
                    testRect.background = "rgba(82, 82, 82, 0.81)";
                    this.advancedTexture.addControl(testRect);
                }
                else
                    console.log(response.message);
            }
            );
        });

        const profileBtn = Button.CreateSimpleButton("profileBtn", "Profile");
        profileBtn.width = "90%";
        profileBtn.height = "70%";
        profileBtn.color = "white";
        profileBtn.background = "#3f8b95";
        profileBtn.fontSize = 22;
        profileBtn.cornerRadius = 10;
        optionsGrid.addControl(profileBtn, 0, 1);

        profileBtn.onPointerClickObservable.add(() => {
            const mesh = this.sceneManager.getScene().getMeshByName(ZoneName.STANDS)!;
            this.sceneManager.getSceneInteractor?.handleMainZoneClick(
                mesh,
                true,
                true
            );
            (this.sceneManager.getSceneInteractor?.getCurrSpecificInteraction() as StandsInteraction).handleFriendsProfile(mesh, []);
            (this.sceneManager.getSceneInteractor?.getCurrSpecificInteraction() as StandsInteraction).getFriendUI?.displayFriend(this.friend);
        });
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
            console.log("WebSocket message reçu:", event.data);
            try {

                const data = JSON.parse(event.data.toString());
                if (data.type === "new_message") {
                    this.addMessage(data.from, data.text, new Date(data.sentAt));
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

    areMessagesOnDifferentDays(date: Date): boolean {
        return (
            !this.lastDate ||
            this.lastDate.getFullYear() !== date.getFullYear() ||
            this.lastDate.getMonth() !== date.getMonth() ||
            this.lastDate.getDate() !== date.getDate()
        );
    }

    displayDate(date: Date): void {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        const dateText = new TextBlock();
        dateText.text = `${day}/${month}/${year}`; // 👈 FORMAT ICI
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
        if (msgs.length === 0) {
            if (chatApi.startConversation(this.userX.getUser!.username, this.friend.getUsername) === null) {
                console.error("Error start conversation");
                return;
            }
            return;
        }
        msgs.forEach((msg) => {
            this.addMessage(msg.senderUsername, msg.content, new Date(msg.sentAt));
        });
    }

    updateChat(friend: Friend): void {
        this.loginText.text = friend.getUsername;
        this.onlineIcon.background = friend.getOnline ? "#1f9e69ff" : "#cc6475ff";
        this.chatContainer.clearControls();
        this.friend = friend;
        this.lastDate = null;
        this.displayHistory();
    }

    private readonly MAX_WIDTH = 400;
    private readonly FONT_SIZE = 24;
    private readonly LINE_HEIGHT = 1.3;
    private readonly FONT_FAMILY = "Arial";

    wrapTextForChat(
        text: string,
        fontSize = this.FONT_SIZE,
        containerWidth = this.MAX_WIDTH,
        fontFamily = this.FONT_FAMILY
    ): string {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        ctx.font = `${fontSize}px ${fontFamily}`;

        const words = text.split(/\s+/);
        let line = "";
        const lines: string[] = [];

        for (let word of words) {
            // Si mot trop long -> découpage caractère par caractère
            if (ctx.measureText(word).width > containerWidth) {
                let segment = "";
                for (const char of word) {
                    const test = segment + char;
                    if (ctx.measureText(test).width > containerWidth) {
                        if (line !== "") {
                            lines.push(line.trim());
                            line = "";
                        }
                        lines.push(segment); // push segment coupé
                        segment = char;
                    } else {
                        segment = test;
                    }
                }
                // push dernier segment
                if (segment) {
                    if (line !== "") {
                        line += " ";
                    }
                    line += segment;
                }
                continue;
            }

            const testLine = line + (line ? " " : "") + word;
            if (ctx.measureText(testLine).width > containerWidth) {
                if (line) lines.push(line);
                line = word;
            } else {
                line = testLine;
            }
        }

        if (line) lines.push(line);

        return lines.join("\n");
    }


    estimateTextHeightModern(
        text: string,
        fontSize = this.FONT_SIZE,
        containerWidth = this.MAX_WIDTH,
        fontFamily = this.FONT_FAMILY,
        lineHeight = this.LINE_HEIGHT
    ): number {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        ctx.font = `${fontSize}px ${fontFamily}`;

        const words = text.split(/\s+/);
        let line = "";
        let lineCount = 1;

        for (let word of words) {
            // 1. Si un mot dépasse la largeur max, on le découpe
            if (ctx.measureText(word).width > containerWidth) {
                const segments = this.breakLongWord(word, ctx, containerWidth);
                for (let i = 0; i < segments.length; i++) {
                    const segment = segments[i];

                    if (line !== "") {
                        lineCount++;
                    }
                    line = segment;

                    // Si ce n’est pas le dernier segment, on force une nouvelle ligne
                    if (i < segments.length - 1) {
                        lineCount++;
                    }
                }
                continue;
            }

            // 2. Gestion classique wrap mot par mot
            const testLine = line + word + " ";
            if (ctx.measureText(testLine).width > containerWidth && line !== "") {
                line = word + " ";
                lineCount++;
            } else {
                line = testLine;
            }
        }

        return lineCount * fontSize * lineHeight;
    }

    private breakLongWord(
        word: string,
        ctx: CanvasRenderingContext2D,
        maxWidth: number
    ): string[] {
        const segments: string[] = [];
        let current = "";

        for (const char of word) {
            const test = current + char;
            if (ctx.measureText(test).width > maxWidth) {
                segments.push(current);
                current = char;
            } else {
                current = test;
            }
        }

        if (current.length > 0) {
            segments.push(current);
        }

        return segments;
    }

    estimateTextWidthModern(
        text: string,
        fontSize = this.FONT_SIZE,
        fontFamily = this.FONT_FAMILY
    ): number {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        ctx.font = `${fontSize}px ${fontFamily}`;
        return ctx.measureText(text).width;
    }

    addMessage(sender: string, text: string, date: Date) {
        if (this.areMessagesOnDifferentDays(date)) this.displayDate(date);

        const wrappedText = this.wrapTextForChat(text);

        const estHeight = this.estimateTextHeightModern(wrappedText, this.FONT_SIZE, this.MAX_WIDTH);
        const estWidth = Math.min(this.estimateTextWidthModern(wrappedText), this.MAX_WIDTH);

        const bubble = new Rectangle();
        bubble.width = (estWidth + 40) + "px";
        bubble.height = estHeight + "px";
        bubble.cornerRadius = 16;
        bubble.thickness = 0;

        const isMe = sender !== this.friend.getUsername;
        bubble.background = isMe ? "#88bcc0ff" : "#c07985ff";
        bubble.horizontalAlignment = isMe
            ? Control.HORIZONTAL_ALIGNMENT_RIGHT
            : Control.HORIZONTAL_ALIGNMENT_LEFT;

        const msgText = new TextBlock();
        msgText.text = wrappedText; // ici le texte déjà wrappé
        msgText.color = "white";
        msgText.width = "100%";
        msgText.textWrapping = true;
        msgText.fontSize = this.FONT_SIZE;
        msgText.paddingLeft = "12px";
        msgText.paddingRight = "12px";
        msgText.paddingTop = "6px";
        msgText.paddingBottom = "6px";
        msgText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT

        bubble.addControl(msgText);
        this.chatContainer.addControl(bubble);

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
