import { Scene, AbstractMesh, StandardMaterial } from "@babylonjs/core";
import { AdvancedDynamicTexture, ScrollViewer, StackPanel, TextBlock, Control, Rectangle, Grid, Ellipse, Button, InputTextArea, Line } from "@babylonjs/gui";

import { UserX } from "../UserX.ts";
import { FriendManager } from "../friends/FriendsManager.ts";
import { Friend } from "../friends/Friend.ts";
import { Message } from "../friends/Friend.ts";

import { chatApi } from "../chatApi/chat.api.ts";

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

    constructor(
        scene: Scene,
        mesh: AbstractMesh,
        friend: Friend,
        userX: UserX
    ) 
    {
        this.mesh = mesh;
        this.online = false;
        this.friend = friend;
        this.lastDate = null;
        this.userX = userX;

        // --- Crée la texture GUI sur le mesh ---
        this.originalMaterial = mesh.material;
        this.advancedTexture = AdvancedDynamicTexture.CreateForMesh(mesh);

        // --- Fond principal ---
        const backgroundRect = new Rectangle();
        backgroundRect.width = "65%";
        backgroundRect.height = "100%";
        backgroundRect.background = "#363636AA";
        backgroundRect.thickness = 3;
        this.advancedTexture.addControl(backgroundRect);

        // --- Grid principale ---
        const mainGrid = new Grid();
        mainGrid.width = "100%";
        mainGrid.height = "100%";
        backgroundRect.addControl(mainGrid);

        mainGrid.addRowDefinition(0.12);  // login
        mainGrid.addRowDefinition(0.68); // messages
        mainGrid.addRowDefinition(0.10); // saisie
        mainGrid.addRowDefinition(0.10); //options

        // ================= Ligne 0 : LOGIN =================
        const loginRect = new Rectangle();
        loginRect.width = "800px";
        loginRect.height = "100%";
        loginRect.background = "#026379AA";
        loginRect.thickness = 0;
        mainGrid.addControl(loginRect, 0, 0);

       const headerGrid = new Grid();
        headerGrid.width = "40%";
        headerGrid.height = "100%";
        headerGrid.background = "red";
        loginRect.addControl(headerGrid);

        headerGrid.addColumnDefinition(0.70);
        headerGrid.addColumnDefinition(0.10);

        // TEXTE
        this.loginText = new TextBlock();
        this.loginText.text = friend.getUsername;
        this.loginText.color = "white";
        this.loginText.fontSize = 40;
        this.loginText.paddingLeft = "30px";
        this.loginText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.loginText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        headerGrid.addControl(this.loginText, 0, 0);

        // ICONE ONLINE
        this.onlineIcon = new Ellipse();
        this.onlineIcon.width = "26px";
        this.onlineIcon.height = "26px";
        this.onlineIcon.background = friend.getOnline ? "#53d6d0ff" : "#ca0e4fff";
        this.onlineIcon.thickness = 2;
        this.onlineIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.onlineIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        // this.onlineIcon.paddingLeft = "10px";
        headerGrid.addControl(this.onlineIcon, 0, 1);



        // ================= Ligne 1 : MESSAGES =================
        const msgContainer = new Rectangle();
        msgContainer.width = "100%";
        msgContainer.height = "100%";
        msgContainer.background = "#2a2a2aAA";
        msgContainer.thickness = 0;
        msgContainer.clipChildren = true;
        mainGrid.addControl(msgContainer, 1, 0);

        // ScrollViewer
        this.scrollViewer = new ScrollViewer();
        this.scrollViewer.width = "100%";
        this.scrollViewer.height = "100%";
        this.scrollViewer.background = "transparent";
        this.scrollViewer.barColor = "white";
        this.scrollViewer.thickness = 0;
        this.scrollViewer.horizontalBarVisible = false;
        msgContainer.addControl(this.scrollViewer);

        this.scrollViewer.onWheelObservable.add((wheelEvent) => {
            const target = this.scrollViewer.scrollTop + wheelEvent.deltaY * 20; // vitesse x2
            this.smoothScrollTo(this.scrollViewer, target, 6); // fonction smoothScrollTo vue précédemment
        });

        // StackPanel pour les messages
        this.chatContainer = new StackPanel("chatcontainer");
        this.chatContainer.width = "100%";
        this.chatContainer.isVertical = true;
        this.chatContainer.spacing = 8;
        this.scrollViewer.addControl(this.chatContainer);

        // ================= Ligne 2 : SAISIE =================
        const inputGrid = new Grid("inputgrid");
        inputGrid.width = "100%";
        inputGrid.height = "100%";
        mainGrid.addControl(inputGrid, 2, 0);

        // Colonnes : 70% texte, 30% bouton
        inputGrid.addColumnDefinition(0.7);
        inputGrid.addColumnDefinition(0.3);

        // Champ texte
        const inputTxt = new InputTextArea();
        inputTxt.width = "100%";
        inputTxt.height = "80%";
        inputTxt.color = "white";
        inputTxt.fontSize = 25;
        inputTxt.background = "#444444AA";
        inputTxt.placeholderText = "Tapez votre message...";
        inputGrid.addControl(inputTxt, 0, 0);

        // Bouton envoyer
        this.sendBtn = Button.CreateSimpleButton("sendBtn", "Envoyer");
        this.sendBtn.width = "90%";
        this.sendBtn.height = "80%";
        this.sendBtn.color = "white";
        this.sendBtn.background = "#026379AA";
        this.sendBtn.fontSize = 25;
        this.sendBtn.cornerRadius = 10;
        inputGrid.addControl(this.sendBtn, 0, 1);

        this.sendBtn.onPointerUpObservable.add(async () => {
            const message = inputTxt.text.trim();
            if (message.length === 0) return;

            // Utiliser la méthode de la classe pour ajouter le message
            this.addMessage(this.userX.getUser?.id, message, new Date());

            console.log("Message envoyé :", message, this.userX.getUser?.id, this.friend.getUsername);
            console.log("Message envoyé :", message, this.userX.getUser?.username, this.friend.getUsername);
            try
            {
                // const conversation = chatApi.startConversation(
                //     this.userX.getUser!.username,
                //     this.friend.getUsername,
                // );
                // console.log("=====>Conversation démarrée :", conversation);
                // const sended = await chatApi.sendMessage(
                //     this.userX.getUser!.username,
                //     this.friend.getLogin,
                //     message,
                // );
                // console.log("Message envoyé via chatApi", sended);
                const token = "123"; // normalement ton vrai JWT

                const ws = new WebSocket("wss://localhost:8443/chat/ws?token=" + token);

                // Handler pour tous les messages
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    console.log("MESSAGE REÇU WS:", data);

                    if (data.type === "new_message") {
                        console.log("Nouveau message:", data.message);
                    }
                };

                ws.onopen = () => {
                    console.log("WebSocket connecté");

                    ws.send(JSON.stringify({
                        type: "send_message",
                        from: this.userX.getUser!.username,
                        to: this.friend.getUsername,
                        text: message,
                    }));
                };

                ws.onclose = () => {
                    console.log("WebSocket fermé");
                };

                ws.onerror = (err) => {
                    console.error("Erreur WebSocket", err);
                };
            } 
            catch (error) {
                console.error("Erreur lors du démarrage de la conversation :", error);
            }
            // AJOUTER LE MESSAGE DANS LE TABLEAU MESSAGES PRESENT DANS FRIEND ET DANS LA BDD
            
            // Effacer le champ
            inputTxt.text = "";
        });

        this.displayHistory();

        //================= Ligne 3 : OPTIONS =================
        const optionsGrid = new Grid("gridOpt");
        optionsGrid.width = "100%";
        optionsGrid.height = "100%";
        optionsGrid.background = "#1f1f1fAA";

        optionsGrid.addColumnDefinition(0.33);
        optionsGrid.addColumnDefinition(0.33);
        optionsGrid.addColumnDefinition(0.34);

        mainGrid.addControl(optionsGrid, 3, 0);

        // ---- Bouton Inviter ----
        const inviteBtn = Button.CreateSimpleButton("inviteBtn", "Inviter");
        inviteBtn.width = "90%";
        inviteBtn.height = "70%";
        inviteBtn.color = "white";
        inviteBtn.background = "#3a8dde";
        inviteBtn.fontSize = 22;
        inviteBtn.cornerRadius = 10;
        optionsGrid.addControl(inviteBtn, 0, 0);

        inviteBtn.onPointerUpObservable.add(() => {
            console.log("Inviter clic");
        });

        // ---- Bouton Bloquer ----
        const blockBtn = Button.CreateSimpleButton("blockBtn", "Bloquer");
        blockBtn.width = "90%";
        blockBtn.height = "70%";
        blockBtn.color = "white";
        blockBtn.background = "#c0392b";
        blockBtn.fontSize = 22;
        blockBtn.cornerRadius = 10;
        optionsGrid.addControl(blockBtn, 0, 1);

        blockBtn.onPointerUpObservable.add(() => {
            console.log("Bloquer clic");
        });

        // ---- Bouton Profil ----
        const profileBtn = Button.CreateSimpleButton("profileBtn", "Profil");
        profileBtn.width = "90%";
        profileBtn.height = "70%";
        profileBtn.color = "white";
        profileBtn.background = "#27ae60";
        profileBtn.fontSize = 22;
        profileBtn.cornerRadius = 10;
        optionsGrid.addControl(profileBtn, 0, 2);

        profileBtn.onPointerUpObservable.add(() => {
            console.log("Profil clic");
        });

    }

    smoothScrollTo(
        scrollViewer: ScrollViewer,
        target: number,
        speed: number = 10
    ) : void 
    {
        const step = () => {
            const diff = target - scrollViewer.scrollTop;
            if (Math.abs(diff) < 1) return; // fin du scroll
            scrollViewer.scrollTop += diff / speed;
            requestAnimationFrame(step);
        };
        step();
    }

    areMessagesOnDifferentDays(
        date: Date
    ): boolean 
    {
        return (
            !this.lastDate ||
            this.lastDate.getFullYear() !== date.getFullYear() ||
            this.lastDate.getMonth() !== date.getMonth() ||
            this.lastDate.getDate() !== date.getDate()
        );
    }

    displayDate(
        date: Date
    ): void 
    {
        // Texte de la date
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

    async displayHistory() : Promise<void>
    {
        const msgs = await this.friend.loadMessages(this.userX.getUser!.username);
        console.log("Messages chargés :", msgs);

        if (msgs.length === 0)
            return ;

        msgs.forEach((msg) => {
            console.log("added a message:", msg);
            console.log("added a message:", msg.content, msg.senderId, msg.sentAt);

            this.addMessage(this.userX.getUser?.id, msg.content, new Date(msg.sentAt));
        });
    }

    updateChat(
        friend: Friend
    ) : void
    {
        this.loginText.text = friend.getUsername;
        this.onlineIcon.background = friend.getOnline ? "#128354ff" : "#e58ab8ff";
        this.chatContainer.clearControls();
        this.friend = friend;
        // this.friend.loadMessages(this.userX.getUser!.username);
        this.displayHistory();
    }

    estimateTextHeight(
        text: string,
        fontSize: number,
        containerWidth: number,
        fontFamily = "Arial",
        lineHeight = 1.2
    ) : number 
    {
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
        return (lineCount * fontSize * lineHeight);
    }
    
    // ================= Méthode pour ajouter un message =================
    addMessage = (
        sender: string,
        text: string,
        date: Date
    ) => {
        const estHeight = this.estimateTextHeight(
            text,
            34,      // taille police (fontSize)
            700,     // largeur conteneur en px
            "Arial"
        );
        if (this.areMessagesOnDifferentDays(date))
                this.displayDate(date);
        const msgRect = new Rectangle();
        msgRect.width = "80%";
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
        msgText.resizeToFit = false;
        msgText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        msgText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        msgRect.addControl(msgText);

        this.chatContainer.addControl(msgRect);

        // Faire défiler automatiquement vers le bas
        this.scrollViewer.verticalBar.value = this.scrollViewer.verticalBar.maximum;
    }

    public dispose() 
    {
        console.log("Chat3D: nettoyage en cours...");

        if (this.advancedTexture) {
            this.advancedTexture.rootContainer.dispose(); // supprime tout le contenu GUI
            this.advancedTexture.clear(); // retire les contrôles de la texture
            this.advancedTexture.dispose();
            this.advancedTexture = null!;
        }

        // Réaffecte le matériau d'origine obligatoire
        if (this.mesh && !this.mesh.isDisposed()) {
            this.mesh.material = this.originalMaterial; // doit exister
            this.mesh.isVisible = true;
        }

        // 3️⃣ Ne pas toucher au mesh, donc pas de this.mesh.dispose() ici !
        console.log("Chat3D: interface supprimée, mesh intact.");
    }

}