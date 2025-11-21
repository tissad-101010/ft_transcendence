ss
// fuuction that logout user from the application
import { logoutUser } from "../auth/controllers/signout.ts";


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
    Rectangle,
    Button,
    Grid,
    Image,
    InputText
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

    //INTERFACE UI
    private profilePanel! :  Rectangle; //! dit que sera initialisee avant usage
    private panel! : StackPanel;
    private profileStack! : StackPanel;
    private flag : boolean = false;
    private enable2faApp = false;
    private enable2faMail = false;

    constructor(sceneManager: SceneManager, userX: UserX)
    {
        this.sceneManager = sceneManager;
        this.sceneManager.getScene().getMeshByName("logo").isVisible = false;
        this.sceneManager.getScene().getMeshByName("ballPong").isVisible = false;

        const mesh = this.sceneManager.getScene().getMeshByName("field");
        this.container = AdvancedDynamicTexture.CreateForMesh(mesh ,1024, 1024);
        this.userX = userX;
        this.displayMenu();
    }

    private enable2FaMailInterface(){
        const panel2fa = new StackPanel("panel2fa");
        panel2fa.width = "70%";
        panel2fa.height = "100%";
        panel2fa.background = "red";
        panel2fa.isVertical = true;
        panel2fa.paddingTop = "10px";
        panel2fa.paddingLeft = "20px";
        panel2fa.paddingRight = "20px";
        panel2fa.spacing = 5;
        this.panel.addControl(panel2fa);

        const infoMsg = new TextBlock();
        infoMsg.text = "Un code de vérification à 6 chiffres vient de vous être envoyé par email. Veuillez saisir ce code dans le champ ci-dessous pour confirmer votre identité.";
        infoMsg.height = "250px";
        infoMsg.textWrapping = true; // <<< important
        infoMsg.width = "500px";
        infoMsg.fontSize = 30;
        infoMsg.color = "white";
        panel2fa.addControl(infoMsg);

        const input = new InputText();
        input.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        input.width = "40%";
        input.height = "70px";
        input.color = "red";
        input.fontSize = 26;
        input.thickness = 0;
        input.background = "white";
        input.focusedBackground = "white";   // garde fond blanc au clic
        input.placeholderText = "code de verification";
        input.placeholderColor = "gray";
        panel2fa.addControl(input);

        const confirmButton = Button.CreateSimpleButton("enabsle2fa", "✔");
        confirmButton.height = "80px";
        confirmButton.width = "100px";
        confirmButton.color = "white";
        confirmButton.fontSize = 20;
        confirmButton.background = "#0066FF";
        panel2fa.addControl(confirmButton);

        confirmButton.onPointerUpObservable.add(() => {
            console.log("code verification confirme");
            // if (!input.text || input.text.trim() === "") {
            //     infoMsg.text = "Le champ ne peut pas être vide !";
            //     return;
            // }
            // if (input.text.trim().length !== 6){
            //     infoMsg.text = "Le code doit contenir exactement 6 caractères !";
            //     return;
            // }
            // this.flag = false;
            // this.enable2faApp = true;
            // console.log("Code valide :");
            // this.displayMenu();
        });

    }

    private enable2FaAppInterface(){
        const panel2fa = new StackPanel("panel2faApp");
        panel2fa.width = "100%";
        panel2fa.height = "100%";
        panel2fa.background = "red";
        panel2fa.isVertical = true;
        panel2fa.paddingTop = "10px";
        panel2fa.paddingLeft = "20px";
        panel2fa.paddingRight = "20px";
        panel2fa.spacing = 10;
        this.panel.addControl(panel2fa);

        const stackElements1 = new StackPanel("stackElements1");
        stackElements1.height = "30%";
        stackElements1.background = "blue";
        stackElements1.spacing = 10;
        stackElements1.isVertical = true;
        panel2fa.addControl(stackElements1);

        const recElement1 = new Rectangle("recElement1");
        recElement1.height = "20px";
        recElement1.thickness = 0;
        stackElements1.addControl(recElement1);

        const infoMsg = new TextBlock();
        infoMsg.text = "Scanne le code qr et donne ton code pd";
        infoMsg.height = "50px";
        infoMsg.fontSize = 30;
        infoMsg.color = "white";
        stackElements1.addControl(infoMsg);

        const qrImgRec = new Rectangle("qrImgRec");
        qrImgRec.width = "200px";
        qrImgRec.height = "200px";
        qrImgRec.thickness = 0;
        qrImgRec.background = "gray";
        stackElements1.addControl(qrImgRec);

        const qrImg = new Image("qrImgImg", "qrImg.png");
        qrImg.width = 1;
        qrImg.height = 1;
        qrImgRec.addControl(qrImg);

        //LES ENFANTS NE DOIVENT PAS USE DE WIDTH EN %
        const stackElements2 = new StackPanel("stackElements2");
        stackElements2.height = "70px";
        stackElements2.width = "50%";
        stackElements2.isVertical = false;
        stackElements2.paddingLeft = 0;
        panel2fa.addControl(stackElements2);

        const recElement2 = new Rectangle("recElement2");
        // recElement2.height = "10%";
        recElement2.width = "100px";
        recElement2.thickness = 0;
        stackElements2.addControl(recElement2);

        const input = new InputText();
        input.width = "200px";
        input.height = "100%";
        input.color = "red";
        input.fontSize = 20;
        input.thickness = 0;
        input.background = "white";
        input.focusedBackground = "white";   // garde fond blanc au clic
        input.placeholderText = "code de verification";
        input.placeholderColor = "gray";
        input.onTextChangedObservable.add(() => {
            if (input.text.length > 6) {
                input.text = input.text.slice(0, 6); // tronque à 6 caractères max
            }
        });
        stackElements2.addControl(input);

        const recMsg = new Rectangle();
        recMsg.height = "50px";
        recMsg.thickness = 0;
        panel2fa.addControl(recMsg);

        const infoMsg1 = new TextBlock();
        infoMsg1.text = "";
        infoMsg1.height = "100px";
        infoMsg1.fontSize = 20;
        infoMsg1.color = "white";
        recMsg.addControl(infoMsg1);

        const confirmButton = Button.CreateSimpleButton("enabsle2fa", "✔");
        confirmButton.height = "100%";
        confirmButton.width = "100px";
        confirmButton.color = "white";
        confirmButton.fontSize = 20;
        confirmButton.background = "#0066FF";
        stackElements2.addControl(confirmButton);

        confirmButton.onPointerUpObservable.add(() => {
            console.log("code verification confirme");
            if (!input.text || input.text.trim() === "") {
                infoMsg1.text = "Le champ ne peut pas être vide !";
                return;
            }
            if (input.text.trim().length !== 6){
                infoMsg1.text = "Le code doit contenir exactement 6 caractères !";
                return;
            }
            this.flag = false;
            this.enable2faApp = true;
            console.log("Code valide :");
            this.displayMenu();
        });
    }

    private createInputField(placeholderText: string, panelPwd : StackPanel) {
        const panelRec = new Rectangle();
        panelRec.width = "40%";
        panelRec.thickness = 0;
        panelRec.height = "60px";
        panelPwd.addControl(panelRec);

        const input = new InputText();
        input.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        input.paddingTop = "5px";
        input.width = "100%";
        input.height = "100%";
        input.color = "red";
        input.fontSize = 26;
        input.thickness = 0;
        input.background = "white";
        input.focusedBackground = "white";   // garde fond blanc au clic
        input.placeholderText = placeholderText;
        input.placeholderColor = "gray";

        let realValue = "";
        input.onTextChangedObservable.add(() => {
            const lastChar = input.text.slice(realValue.length);
            // si ajout
            if (input.text.length > realValue.length) {
                realValue += lastChar;
            }
            // si suppression
            else {
                realValue = realValue.slice(0, input.text.length);
            }

            input.text = "•".repeat(realValue.length);
        });
        panelRec.addControl(input);
        return () => realValue;

    }

    private changePwdInterface() : void {
        const panelPwd = new StackPanel("panelPwd");
        panelPwd.width = "100%";
        panelPwd.height = "100%";
        panelPwd.background = "red";
        panelPwd.isVertical = true;
        panelPwd.paddingTop = "60px";
        panelPwd.paddingLeft = "20px";
        panelPwd.paddingRight = "20px";
        panelPwd.spacing = 20;
        this.panel.addControl(panelPwd);

        const getOldPwd = this.createInputField("Ancien mot de passe", panelPwd);
        const getNewPwd = this.createInputField("Nouveau mot de passe", panelPwd);
        const getConfirmPwd = this.createInputField("Confirmation", panelPwd);

        const recMsg = new Rectangle();
        recMsg.height = "50px";
        recMsg.thickness = 0;
        panelPwd.addControl(recMsg);

        const infoMsg = new TextBlock();
        infoMsg.text = "";
        infoMsg.height = "100px";
        infoMsg.fontSize = 26;
        infoMsg.color = "white";
        recMsg.addControl(infoMsg);

        const changePwdBtn = Button.CreateSimpleButton("changedPwd", "✔");
        changePwdBtn.height = "60px";
        changePwdBtn.width = "40%";
        changePwdBtn.color = "white";
        changePwdBtn.fontSize = 20;
        changePwdBtn.background = "#0066FF";
        changePwdBtn.cornerRadius = 10;
        panelPwd.addControl(changePwdBtn);

        changePwdBtn.onPointerUpObservable.add(() => {
            this.flag = false;
            const newPwd = getNewPwd();
            const confirmPwd = getConfirmPwd();
            const oldPwd = getOldPwd();

            if (newPwd !== confirmPwd) {
                infoMsg.text = "Concentre toi le sang, les mp correspondent pas 🥱";
                return;
            }
            if (!newPwd || !confirmPwd || !oldPwd || newPwd.trim() === ""
            || confirmPwd.trim() === "" || oldPwd.trim() === ""){
                infoMsg.text = "Vas y tu forces c est vide 😑";
                return;
            }
            this.flag = false;
            console.log("Mot de passe valide :", newPwd);
            this.displayMenu();
        });
    }

    private displayMainCat3() : void {
        const rightPanel = new StackPanel();
        rightPanel.isVertical = true;
        rightPanel.width = "370px";
        rightPanel.height = "100%";
        rightPanel.spacing = 40;
        this.profileStack.addControl(rightPanel);

        const recSection3 = new Rectangle();
        recSection3.height = "50px";
        recSection3.thickness = 0;
        recSection3.background = "rgba(124, 70, 131, 1)";
        rightPanel.addControl(recSection3);

        const titleSection3 = new TextBlock();
        titleSection3.text = "Securite & Authentification ​🔒​";
        titleSection3.height = "100px";
        titleSection3.fontSize = 25;
        titleSection3.color = "black";
        titleSection3.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        recSection3.addControl(titleSection3);

        // Bouton changer de mot de passe
        const changePwdBtn = Button.CreateSimpleButton("changePwd", "Changer le mot de passe");
        changePwdBtn.height = "50px";
        changePwdBtn.width = "70%";
        changePwdBtn.color = "white";
        changePwdBtn.fontSize = 20;
        changePwdBtn.background = "#0066FF";
        changePwdBtn.cornerRadius = 10;

        changePwdBtn.onPointerUpObservable.add(() => {
            console.log("Changer le mot de passe");
            this.flag = true;
            this.mainInterfaceStruct();
            this.changePwdInterface();
        });

        //BOUTON 2FA APP
        rightPanel.addControl(changePwdBtn);
        let enable2faBtn = Button.CreateSimpleButton("enable2FAApp", "");
        enable2faBtn.height = "50px";
        enable2faBtn.width = "70%";
        enable2faBtn.color = "white";
        enable2faBtn.fontSize = 20;
        enable2faBtn.cornerRadius = 10;

        if (!this.enable2faApp) {
            enable2faBtn.textBlock.text = "Activer 2FA (App)";
            enable2faBtn.background = "#009944";

        } else {
            enable2faBtn.textBlock.text = "Desactiver 2FA (App)";
            enable2faBtn.background = "#c200c2ff";
        }
        enable2faBtn.onPointerUpObservable.add(() => {
            if (this.enable2faApp){
                enable2faBtn.textBlock.text = "Activer 2FA (App)";
                enable2faBtn.background = "#009944";
                this.enable2faApp = false;
            }
            else{
                this.flag = true;
                this.mainInterfaceStruct();
                this.enable2FaAppInterface();
            }
        });
        rightPanel.addControl(enable2faBtn);


        //BOUTON 2FA EMAIL
        let enable2faMailBtn = Button.CreateSimpleButton("enable2FAMail", "")
        enable2faMailBtn.height = "50px";
        enable2faMailBtn.width = "70%";
        enable2faMailBtn.color = "white";
        enable2faMailBtn.fontSize = 20;
        // enable2faMailBtn.background = "#CC8800";
        enable2faMailBtn.cornerRadius = 10;

        if (!this.enable2faMail){
            enable2faMailBtn.textBlock.text = "Activer 2FA (Mail)";
            enable2faMailBtn.background = "#009944";
        }
        else{
            enable2faMailBtn.textBlock.text = "Desactiver 2FA (Mail)";
            enable2faMailBtn.background = "#df0000ff";
        }
        enable2faMailBtn.onPointerUpObservable.add(() => {
            if (this.enable2faMail){
                enable2faBtn.textBlock.text = "Activer 2FA (App)";
                enable2faBtn.background = "#009944";
                this.enable2faMail = false;
            }
            else{
                this.flag = true;
                this.mainInterfaceStruct();
                this.enable2FaMailInterface();
            }
        });

        rightPanel.addControl(enable2faMailBtn);
    }

    private displayMainCat2() : void {
        const centerPanel = new StackPanel();
        centerPanel.isVertical = true;
        centerPanel.background = "#8c00ffff";
        centerPanel.paddingTop = 0;
        centerPanel.spacing = 30;
        centerPanel.width = "300px";
        centerPanel.height = "100%";
        this.profileStack.addControl(centerPanel);

        const recSection2 = new Rectangle();
        recSection2.height = "50px";
        recSection2.thickness = 0;
        recSection2.background = "rgba(194, 212, 30, 1)";
        centerPanel.addControl(recSection2);

        const titleSection2 = new TextBlock();
        titleSection2.text = "personnelles 👤​";
        titleSection2.height = "100px";
        titleSection2.paddingLeft = "5px";
        titleSection2.fontSize = 25;
        titleSection2.color = "black";
        titleSection2.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        recSection2.addControl(titleSection2);

        const avatarContainer = new Rectangle("avatarContainer");
        avatarContainer.width = "250px";
        avatarContainer.height = "250px";
        avatarContainer.cornerRadius = 120;
        avatarContainer.thickness = 0;
        avatarContainer.background = "gray";

        centerPanel.addControl(avatarContainer);

        // image de l’avatar
        console.log("==========================================================User Avatar URL:", this.userX.getUser?.avatarUrl);
        console.log("==========================================================User Login:", this.userX.getUser?.username);
        
        let path = this.userX.getUser?.avatarUrl && this.userX.getUser?.avatarUrl !== "" ? this.userX.getUser?.avatarUrl : "logoPink.png";
        console.log("Avatar URL:", path);
        
        // Use a rounded Rectangle as a mask/container for the image (Image doesn't have cornerRadius)
        const avatarCircle = new Rectangle("avatarCircle");
        avatarCircle.width = 1;
        avatarCircle.height = 1;
        avatarCircle.cornerRadius = 40;
        avatarCircle.thickness = 0;
        avatarCircle.background = "transparent";
        avatarContainer.addControl(avatarCircle);
        
        const avatar = new Image("avatarImg", path); // ← URL distante OK
        avatar.width = "100%";
        avatar.height = "100%";
        avatar.stretch = Image.STRETCH_UNIFORM;
        avatarCircle.addControl(avatar);

        // --- Rectangle pour contenir le bouton ---
        const editButton = Button.CreateSimpleButton("editAvatar", "Modifier l'avatar");
        editButton.width = "70%";
        editButton.height = "70px";
        editButton.color = "white";
        editButton.paddingTop = "20px";
        editButton.fontSize = 20;
        editButton.background = "#ff6600"; // couleur du bouton
        editButton.cornerRadius = 10;

        // Action au clic
        editButton.onPointerUpObservable.add(() => {
            console.log("Modifier l'avatar cliqué !");
        });

        centerPanel.addControl(editButton);
    }

    private displayMainCat1(): void {
        const leftPanel = new StackPanel();
        leftPanel.isVertical = true;
        leftPanel.background = "#ff8800ff";
        leftPanel.width = "320px";
        leftPanel.height = "100%";
        this.profileStack.addControl(leftPanel);

        const recSection1 = new Rectangle();
        recSection1.height = "50px";
        recSection1.thickness = 0;
        recSection1.background = "rgba(194, 212, 30, 1)";
        leftPanel.addControl(recSection1);

        const titleSection1 = new TextBlock();
        titleSection1.text = "Informations";
        titleSection1.paddingLeft = "180px";
        titleSection1.height = "100px";
        titleSection1.fontSize = 25;
        titleSection1.color = "black";
        titleSection1.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        recSection1.addControl(titleSection1);


        // LOGIN
    
        const loginText = new TextBlock();
        loginText.text = "Login: " + this.userX.getUser?.username;
        loginText.height = "40px";
        loginText.fontSize = 19;
        loginText.paddingLeft = "5px";
        loginText.color = "black";
        loginText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(loginText);

        // EMAIL
        const mailText = new TextBlock();
        mailText.text = "Email: " + this.userX.getUser?.email;
        mailText.height = "25px";
        mailText.paddingLeft = "5px";
        mailText.fontSize = 19;
        mailText.color = "black";
        mailText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(mailText);

        const recSection2 = new Rectangle();
        recSection2.height = "80px";
        recSection2.thickness = 0;
        recSection2.paddingTop = "35px";
        recSection2.background = "rgba(194, 212, 30, 1)";
        leftPanel.addControl(recSection2);

        const titleSection2 = new TextBlock();
        titleSection2.text = "Statistiques 📊";
        titleSection2.height = "100px";
        titleSection2.fontSize = 25;
        titleSection2.color = "black";
        titleSection2.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        recSection2.addControl(titleSection2);

        //NB PARTIES JOUEES
        const gamePlayed = new TextBlock();
        gamePlayed.text = "​🕹️​ Total: " + this.userX.getUser?.gamesPlayed;
        gamePlayed.height = "40px";
        gamePlayed.paddingLeft = "5px";
        gamePlayed.fontSize = 19;
        gamePlayed.color = "black";
        gamePlayed.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(gamePlayed);

        const win = new TextBlock();
        win.text = "​​🏅 Victoires​: " + this.userX.getUser?.wins;
        win.height = "25px";
        win.fontSize = 19;
        win.paddingLeft = "5px";
        win.color = "black";
        win.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(win);

        const loss = new TextBlock();
        loss.text = "​💩​ Defaites: " + this.userX.getUser?.loss;
        loss.height = "40px";
        loss.fontSize = 19;
        loss.paddingLeft = "5px";
        loss.color = "black";
        loss.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(loss);
    }
    
    private mainInterfaceStruct() : void {
        this.panel = new StackPanel();
        this.panel.width = "100%";
        this.panel.height = "1024px";
        this.panel.isVertical = true;
        this.panel.background = "rgba(0, 102, 255, 1)";

        this.container.addControl(this.panel);

        // --- SECTION 1 : Titre ---
        const titlePanel = new Rectangle("titlepanel");
        titlePanel.width = "100%";
        titlePanel.height = "300px"; //jamais toucher
        titlePanel.thickness = 0;
        titlePanel.background = "rgba(255, 217, 0, 1)";
        this.panel.addControl(titlePanel);

        const horizontalLayout = new StackPanel();
        horizontalLayout.isVertical = false; // horizontal
        horizontalLayout.width = "100%";
        horizontalLayout.height = "100%";
        titlePanel.addControl(horizontalLayout);

        if (this.flag){
            const backButton = Button.CreateSimpleButton("backBtn", "←");
            backButton.width = "200px";
            backButton.height = "100%";
            backButton.color = "white";
            backButton.paddingLeft = "10px";
            backButton.background = "green";
            backButton.cornerRadius = 10;
            const btnLabel = backButton.children[0] as TextBlock;
            btnLabel.color = "white";
            btnLabel.fontSize = 100;          // taille du texte
            btnLabel.paddingTop = "210px"; // pour éviter collé au bord 
            backButton.textBlock!.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            backButton.onPointerUpObservable.add(() => {
                this.flag = false;
                this.displayMenu();
            });
            horizontalLayout.addControl(backButton);
        }
        
        const title = new TextBlock("tiltetextblock");
        title.text = "Mon profil";
        if (this.flag)
            title.width = "600px";
        else
            title.width = "1000px";
        title.color = "white";
        title.fontSize = 45;
        // ALIGNE LE TEXTE EN BAS
        title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        title.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        horizontalLayout.addControl(title);


        // --- SECTION 2 : Profil utilisateur ---
        if (!this.flag){
        this.profilePanel = new Rectangle("this.profilePanel");
        this.profilePanel.width = "100%";
        this.profilePanel.height = "400px";
        this.profilePanel.thickness = 0;
        this.profilePanel.background = "white"; 
        this.profilePanel.paddingTop = "20px";
        this.profilePanel.paddingLeft = "20px";
        this.profilePanel.paddingRight = "20px";
        this.panel.addControl(this.profilePanel);

        // layout horizontal : avatar + infos
        this.profileStack = new StackPanel();
        this.profileStack.isVertical = false;
        this.profileStack.width = "100%";
        this.profileStack.height = "100%";
        this.profileStack.spacing = 0;
        this.profileStack.background = "#ffffffff";
        this.profilePanel.addControl(this.profileStack);


        // // --- SECTION 3 : Bouton Déconnexion ---
            const logoutButton = Button.CreateSimpleButton("logout", "Se déconnecter");
            logoutButton.width = "100%";
            logoutButton.height = "50px";
            logoutButton.color = "white";
            logoutButton.fontSize = 30;
            logoutButton.background = "rgba(255, 0, 0, 0.7)";
            logoutButton.cornerRadius = 10;

            logoutButton.onPointerUpObservable.add(async () => {
                console.log("Déconnexion...");
                const success = await logoutUser();
                if (success) {

                    console.log("Déconnecté avec succès");
                } else {
                    console.error("Échec de la déconnexion");
                }
            });

            this.panel.addControl(logoutButton);
        }
    }

    public displayMenu() : void
    {
        this.mainInterfaceStruct();
        this.displayMainCat1();
        this.displayMainCat2();
        this.displayMainCat3();
    }

    public dispose() : void
    {
        if (this.container)
            this.container.dispose();
    }
}


