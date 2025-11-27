import { 
    AbstractMesh,
    Vector3,
    Matrix 
} from "@babylonjs/core";

import {
    AdvancedDynamicTexture,
    StackPanel,
    TextBlock,
    Control,
    Rectangle,
    Button,
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

import { 
    createButton, 
    create2faButton, 
    createInputFieldPwd, 
    createInputField2fa, 
    createSectionTitle,
    createMsgInfo
} from "./utilsUI.ts";
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
        stackElements1.paddingTop = 15;
        stackElements1.height = "30%";
        stackElements1.background = "blue";
        stackElements1.spacing = 10;
        stackElements1.isVertical = true;
        panel2fa.addControl(stackElements1);

        //Message d indication
        const { textBlock: infoMsg } = createMsgInfo({
            parent: stackElements1,
            text: "Veuillez saisir le code que vous venez de recevoir par email",
            height: "50px",
            fontSize: 30,
            color: "white"
        });

        const qrImgRec = new Rectangle("mailRec");
        qrImgRec.width = "200px";
        qrImgRec.height = "200px";
        qrImgRec.thickness = 0;
        qrImgRec.background = "gray";
        stackElements1.addControl(qrImgRec);

        const qrImg = new Image("mailImg", "mail.png");
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

        const input = createInputField2fa(stackElements2);

        //Message d erreur qui s affiche si erreur
        const { rect: recMsg, textBlock: infoMsg1 } = createMsgInfo({
            parent: panel2fa,
            text: "",
            height: "50px",
            fontSize: 20,
            color: "white"
        });

        const confirmButtonMail = createButton({
            id: "enable2faMailConfirm",
            txt: "✔",
            width: "100px",
            height: "100%",
            fontSize: 20,
            color: "white",
            background: "#0066FF",
            onClick: () => {
                console.log("code verification confirme");
                const code = input.text?.trim();
                if (!code) {
                    infoMsg1.text = "Le champ ne peut pas être vide !";
                    return;
                }
                if (code.length !== 6) {
                    infoMsg1.text = "Le code doit contenir exactement 6 caractères !";
                    return;
                }
                this.flag = false;
                this.enable2faMail = true;
                console.log("Code valide :", code);
                this.displayMenu();
            }
        });
        stackElements2.addControl(confirmButtonMail);
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

        //Message indication
        const { textBlock: infoMsg } = createMsgInfo({
            parent: stackElements1,
            text: "Veuillez saisir le code QR dans le champ ci-dessous",
            height: "50px",
            fontSize: 30,
            color: "white"
        });

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

        const input = createInputField2fa(stackElements2);

        //Message d erreur qui s affiche si erreur
        const { rect: recMsg, textBlock: infoMsg1 } = createMsgInfo({
            parent: panel2fa,
            text: "",
            height: "50px",
            fontSize: 20,
            color: "white"
        });

        //CONFIRMATION DU BOUTON 2FA APP INTERFACE APRES RECU DU CODE DE VALIDATION
        const confirmButton = createButton({
            id: "enable2faConfirm",
            txt: "✔",
            width: "100px",
            height: "100%",
            fontSize: 20,
            color: "white",
            background: "#0066FF",
            onClick: () => {
                console.log("code verification confirme");
                const code = input.text?.trim();
                if (!code) {
                    infoMsg1.text = "Le champ ne peut pas être vide !";
                    return;
                }
                if (code.length !== 6) {
                    infoMsg1.text = "Le code doit contenir exactement 6 caractères !";
                    return;
                }
                this.flag = false;
                this.enable2faApp = true;
                console.log("Code valide :", code);
                this.displayMenu();
            }
        });
        stackElements2.addControl(confirmButton);
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

        //Message info qui s affiche si une erreur est detecte
        const { rect: recMsg, textBlock: infoMsg } = createMsgInfo({
            parent: panelPwd,
            text: "",
            height: "50px",
            fontSize: 26,
            color: "white"
        });
        
        const getOldPwd = createInputFieldPwd("Ancien mot de passe", panelPwd);
        const getNewPwd = createInputFieldPwd("Nouveau mot de passe", panelPwd);
        const getConfirmPwd = createInputFieldPwd("Confirmation", panelPwd);

        //VALIDATION CLIC BOUTON CHANGEMENT DE MOT DE PASSE
        const changePwdBtn = createButton({
            id: "changePwd",
            txt: "✔",
            width: "40%",
            height: "60px",
            fontSize: 20,
            background: "#0066FF",
            color: "white",
            cornerRadius: 10,
            onClick: () => {
                //action au clic du bouton
                this.flag = false;
                const newPwd = getNewPwd();
                const confirmPwd = getConfirmPwd();
                const oldPwd = getOldPwd();
                if (!newPwd?.trim() || !confirmPwd?.trim() || !oldPwd?.trim()) {
                    infoMsg.text = "Vas y tu forces c est vide 😑";
                    return;
                }
                if (newPwd !== confirmPwd) {
                    infoMsg.text = "Concentre toi le sang, les mp correspondent pas 🥱";
                    return;
                }
                console.log("Mot de passe valide :", newPwd);
                this.displayMenu();
            }
        });
        panelPwd.addControl(changePwdBtn);
    }

    private displayMainCat3() : void {
        const rightPanel = new StackPanel();
        rightPanel.isVertical = true;
        rightPanel.width = "370px";
        rightPanel.height = "100%";
        rightPanel.spacing = 40;
        this.profileStack.addControl(rightPanel);

        const title = createSectionTitle({
            parent: rightPanel,
            text: "Securite & Authentification 🔒",
            height: "50px",
            fontSize: 25,
            color: "black",
            background: "rgba(124, 70, 131, 1)",
            textHorizontalAlignment: Control.HORIZONTAL_ALIGNMENT_LEFT
        });

        // BOUTON CHANGER DE MOT DE PASSE
        const changePwdBtn = createButton({
            id: "changePwd",
            width: "70%",
            height: "50px",
            txt: "Changer mot de passe",
            background: "blue",
            fontSize: 20,
            color: "white",
            cornerRadius: 10,
            onClick: () =>{
                //Action au clic du bouton(tu rajoutes tes fonctions mais n enleve rien d ici)
                this.flag = true;
                this.mainInterfaceStruct();
                this.changePwdInterface();
            }
        });
        rightPanel.addControl(changePwdBtn);

        //BUTTON 2FA APPLICATION
        const enable2faBtn = create2faButton({
            id: "enable2FAApp",
            stateVar: () => this.enable2faApp,
            setStateVar: (val) => this.enable2faApp = val,
            activeText: "Activer 2FA 📱",
            inactiveText: "Desactiver 2FA 📱",
            activeColor: "#009944",
            inactiveColor: "#c200c2ff",
            onActivate: () => {
                this.flag = true;
                this.mainInterfaceStruct();
                this.enable2FaAppInterface();
            }
        });
        rightPanel.addControl(enable2faBtn);

        //BUTTON 2FA MAIL
        const enable2faMailBtn = create2faButton({
            id: "enable2FAMail",
            stateVar: () => this.enable2faMail,
            setStateVar: (val) => this.enable2faMail = val,
            activeText: "Activer 2FA ✉️",
            inactiveText: "Desactiver 2FA ✉️",
            activeColor: "#009944",
            inactiveColor: "#df0000ff",
            onActivate: () => {
                //Action au clic du bouton(tu rajoutes tes fonctions mais n enleve rien d ici)
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

        const title = createSectionTitle({
            parent: centerPanel,
            text: "personnelles 👤",
            height: "50px",
            fontSize: 25,
            color: "black",
            background: "rgba(225, 0, 255, 1)",
            paddingLeft: "5px",
            textHorizontalAlignment: Control.HORIZONTAL_ALIGNMENT_LEFT
        });

        const avatarContainer = new Rectangle("avatarContainer");
        avatarContainer.width = "250px";
        avatarContainer.height = "250px";
        avatarContainer.cornerRadius = 120;
        avatarContainer.thickness = 0;
        avatarContainer.background = "gray";

        centerPanel.addControl(avatarContainer);

        // image de l’avatar
        const avatar = new Image("avatarImg", "textures/avatar.png");
        avatar.width = 1;
        avatar.height = 1;
        avatarContainer.addControl(avatar);
    }

    private displayMainCat1(): void {
        const leftPanel = new StackPanel();
        leftPanel.isVertical = true;
        leftPanel.background = "#ff8800ff";
        leftPanel.width = "320px";
        leftPanel.height = "100%";
        this.profileStack.addControl(leftPanel);

        const title = createSectionTitle({
            parent: leftPanel,
            text: "Informations",
            height: "50px",
            fontSize: 25,
            color: "black",
            background: "rgba(225, 0, 255, 1)",
            paddingLeft: "180px",
            textHorizontalAlignment: Control.HORIZONTAL_ALIGNMENT_LEFT
        });

        // Sous categories 1 : Informations personnelles + Statistiques
        const loginText = new TextBlock();
        loginText.text = "Login: " + this.userX.getUser?.login;
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

        //GAME (A MODIFIER PAR GRAPHIQUES)
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
        this.panel.spacing = 0;
        this.panel.background = "rgba(0, 102, 255, 1)";
        this.container.addControl(this.panel);

        // --- SECTION 1 : Titre ---
        const titlePanel = new Rectangle("titlepanel");
        titlePanel.width = "100%";
        titlePanel.height = "300px";
        titlePanel.thickness = 0;
        titlePanel.background = "rgba(255, 217, 0, 1)";
        this.panel.addControl(titlePanel);

        const horizontalLayout = new StackPanel();
        horizontalLayout.isVertical = false;
        horizontalLayout.width = "100%";
        horizontalLayout.height = "100%";
        titlePanel.addControl(horizontalLayout);

        if (this.flag){
            const backBtn = createButton({
                id: "back",
                width: "200px",
                height: "100%",
                txt: "←",
                paddingLeft: "10px",
                paddingTop: "210px",
                background: "green",
                fontSize: 100,
                color: "white",
                cornerRadius: 0,
                textHorizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
                textVerticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
                onClick: () =>{
                    //Action au clic du bouton
                    this.flag = false;
                    this.displayMenu();
                }
            });
            horizontalLayout.addControl(backBtn);
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
            // --- SECTION 3 : Bouton Déconnexion ---
            const logoutBtn = createButton({
                id: "logout",
                width: "100%",
                height: "50px",
                txt: "Se deconnecter",
                background: "rgba(255, 0, 0, 0.7)",
                fontSize: 30,
                color: "white",
                cornerRadius: 0,
                onClick: () =>{
                    //Action au clic du bouton
                    console.log("Déconnexion !");
                }
            });
            this.panel.addControl(logoutBtn);
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
    
    public hide(): void {
        if (this.container) {
            this.container.rootContainer.isVisible = false;  // masque toute l'interface
            this.container.rootContainer._children.forEach(c => c.isVisible = false); // facultatif
        }
    }

    public show(): void {
        console.log("entree ici");
        if (this.container) {
            this.container.rootContainer.isVisible = true;   // réaffiche toute l'interface
            this.container.rootContainer._children.forEach(c => c.isVisible = true); // facultatif
        }
    }

}

