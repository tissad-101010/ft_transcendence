// function that logout user from the application
import { logoutUser } from "../auth/controllers/signout.ts";
import { changePassword } from "../auth/controllers/auth.api.ts";
import {    sendEnableEmailOtp,
            enable2faEmail,
            disable2faEmail,
            getTotpSecret,
            enableTotp,
            disableTotp,
            getTwoFactorMethods
        } from "../auth/controllers/twoFactor.api.ts";

import { ZoneName } from "../config.ts";

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
import { use } from "react";
import { get } from "http";

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

// =============================================================
//  PALETTE SOMBRE
// =============================================================
const BG_DARK = "#1a1a1a";
const TEXT_BRIGHT = "#ffffff";


const BTN_NORMAL = "#f5989d";


const BTN_ACTIVE = "#2c4f53";

const BTN_BACK = "#1b1b1b";




export class MyProfilUI
{
    private sceneManager: SceneManager;
    private container: AdvancedDynamicTexture;
    private userX: UserX; 
    
    private profilePanel! :  Rectangle;
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

    // =============================================================
    //  2FA MAIL
    // =============================================================
    private enable2FaMailInterface(){
        
        const panel2fa = new StackPanel("panel2faApp");
        panel2fa.width = "100%";
        panel2fa.height = "100%";
        panel2fa.background = BG_DARK;
        panel2fa.isVertical = true;
        panel2fa.paddingTop = "10px";
        panel2fa.paddingLeft = "20px";
        panel2fa.paddingRight = "20px";
        panel2fa.spacing = 10;
        this.panel.addControl(panel2fa);

        const stackElements1 = new StackPanel("stackElements1");
        stackElements1.paddingTop = 15;
        stackElements1.height = "30%";
        stackElements1.background = "#222";
        stackElements1.spacing = 10;
        stackElements1.isVertical = true;
        panel2fa.addControl(stackElements1);

        const { textBlock: infoMsg } = createMsgInfo({
            parent: stackElements1,
            text: "Veuillez saisir le code reçu par email",
            height: "50px",
            fontSize: 30,
            color: TEXT_BRIGHT
        });
        infoMsg.shadowBlur = 4;
        infoMsg.shadowColor = "#000";

        const qrImgRec = new Rectangle("mailRec");
        qrImgRec.width = "200px";
        qrImgRec.height = "200px";
        qrImgRec.thickness = 0;
        qrImgRec.background = "#333";
        stackElements1.addControl(qrImgRec);

        // const qrImg = new Image("mailImg", "mail.png");
        // qrImg.width = 1;
        // qrImg.height = 1;
        // qrImgRec.addControl(qrImg);

        const stackElements2 = new StackPanel("stackElements2");
        stackElements2.height = "70px";
        stackElements2.width = "50%";
        stackElements2.isVertical = false;
        stackElements2.paddingLeft = 0;
        panel2fa.addControl(stackElements2);

        const input = createInputField2fa(stackElements2);

        const { textBlock: infoMsg1 } = createMsgInfo({
            parent: panel2fa,
            text: "",
            height: "50px",
            fontSize: 20,
            color: TEXT_BRIGHT
        });

        const confirmButtonMail = createButton({
            id: "enable2faMailConfirm",
            txt: "✔",
            width: "100px",
            height: "100%",
            fontSize: 20,
            color: TEXT_BRIGHT,
            background: BTN_ACTIVE,
            onClick: async () => {
                const code = input.text?.trim();
                if (!code) return infoMsg1.text = "Le champ est vide !";
                if (code.length !== 6) return infoMsg1.text = "Code invalide !";
                await enable2faEmail(code);
                this.flag = true;
                this.enable2faMail = true;
                this.displayMenu();
            }
        });
        stackElements2.addControl(confirmButtonMail);
    }

    // =============================================================
    //  2FA APP
    // =============================================================
    private enable2FaAppInterface(qrCodeUrl?: any){
        const panel2fa = new StackPanel("panel2faApp");
        panel2fa.width = "100%";
        panel2fa.height = "100%";
        panel2fa.background = BG_DARK;
        panel2fa.isVertical = true;
        panel2fa.paddingTop = "10px";
        panel2fa.paddingLeft = "20px";
        panel2fa.paddingRight = "20px";
        panel2fa.spacing = 10;
        this.panel.addControl(panel2fa);

        const stackElements1 = new StackPanel("stackElements1");
        stackElements1.height = "30%";
        stackElements1.background = "#222";
        stackElements1.spacing = 10;
        stackElements1.isVertical = true;
        panel2fa.addControl(stackElements1);

        const { textBlock: infoMsg } = createMsgInfo({
            parent: stackElements1,
            text: "Scannez le QR Code puis entrez le code",
            height: "50px",
            fontSize: 30,
            color: TEXT_BRIGHT
        });

        const qrImgRec = new Rectangle("qrImgRec");
        qrImgRec.width = "200px";
        qrImgRec.height = "200px";
        qrImgRec.thickness = 0;
        qrImgRec.background = "#333";
        stackElements1.addControl(qrImgRec);
        console.log("QR Code URL:", qrCodeUrl.qrCodeUrl);
        const qrImg = new Image("qrImgImg", qrCodeUrl.qrCodeUrl);
        qrImg.width = 1;
        qrImg.height = 1;
        qrImgRec.addControl(qrImg);

        const stackElements2 = new StackPanel("stackElements2");
        stackElements2.height = "70px";
        stackElements2.width = "50%";
        stackElements2.isVertical = false;
        stackElements2.paddingLeft = 0;
        panel2fa.addControl(stackElements2);

        const input = createInputField2fa(stackElements2);

        const { textBlock: infoMsg1 } = createMsgInfo({
            parent: panel2fa,
            text: "",
            height: "50px",
            fontSize: 20,
            color: TEXT_BRIGHT
        });

        const confirmButton = createButton({
            id: "enable2faConfirm",
            txt: "✔",
            width: "100px",
            height: "100%",
            fontSize: 20,
            color: TEXT_BRIGHT,
            background: BTN_ACTIVE,
            onClick: async () => {
                const code = input.text?.trim();
                console.log("Code entered for TOTP enabling:", code);
                if (!code) return infoMsg1.text = "Le champ est vide !";
                if (code.length !== 6) return infoMsg1.text = "Code invalide !";
                const res = await enableTotp(code);
                this.flag = true;
                if (!res) return infoMsg1.text = "Échec de l'activation de 2FA App !";
                // this.enable2faApp = true;
                this.displayMenu();
            }
        });
        stackElements2.addControl(confirmButton);
    }

    // =============================================================
    //  CHANGE PASSWORD
    // =============================================================
    private changePwdInterface() : void {
        const panelPwd = new StackPanel("panelPwd");
        panelPwd.width = "100%";
        panelPwd.height = "100%";
        panelPwd.background = BG_DARK;
        panelPwd.isVertical = true;
        panelPwd.paddingTop = "60px";
        panelPwd.paddingLeft = "20px";
        panelPwd.paddingRight = "20px";
        panelPwd.spacing = 10;
        this.panel.addControl(panelPwd);

        const { textBlock: infoMsg } = createMsgInfo({
            parent: panelPwd,
            text: "",
            height: "50px",
            fontSize: 26,
            color: TEXT_BRIGHT
        });
        const { textBlock: title } = createMsgInfo({
            parent: panelPwd,
            text: "Changer le mot de passe 🔒" ,
            height: "50px",
            fontSize: 20,
            color: TEXT_BRIGHT,

        });
        const getOldPwd = createInputFieldPwd("Ancien mot de passe", panelPwd);
        const getNewPwd = createInputFieldPwd("Nouveau mot de passe", panelPwd);
        const getConfirmPwd = createInputFieldPwd("Confirmation", panelPwd);
        const changePwdBtn = createButton({
            id: "changePwd",
            txt: "✔",
            width: "40%",
            height: "60px",
            fontSize: 20,
            background: BTN_ACTIVE,
            color: TEXT_BRIGHT,
            cornerRadius: 10,
            onClick: () => {
                const newPwd = getNewPwd();
                const confirmPwd = getConfirmPwd();
                const oldPwd = getOldPwd();
                if (!newPwd || !confirmPwd || !oldPwd)
                    return infoMsg.text = "Champs vides";
                if (newPwd !== confirmPwd)
                    return infoMsg.text = "Les mots de passe ne correspondent pas";
                changePassword(oldPwd, newPwd).then((res) => {
                    if (res.success) {
                        title.text = "Mot de passe changé avec succès ! ✅";
                        infoMsg.text = "";
                    } else {
                        title.text = "Échec du changement de mot de passe ❌";
                        infoMsg.text = res.message || "Erreur inconnue";
                    }
                });
                this.flag = true;
                this.displayMenu();

            }
        });
        panelPwd.addControl(changePwdBtn);
    }

    // =============================================================
    //  CAT 3 (SECURITY)
    // =============================================================
    private async displayMainCat3() : Promise<void> {
        const rightPanel = new StackPanel();
        rightPanel.isVertical = true;
        rightPanel.width = "370px";
        rightPanel.height = "100%";
        rightPanel.spacing = 40;
        this.profileStack.addControl(rightPanel);

        createSectionTitle({
            parent: rightPanel,
            text: "Sécurité & Auth 🔒",
            height: "50px",
            fontSize: 25,
            color: TEXT_BRIGHT,
            background: "#2d2d2d",
            textHorizontalAlignment: Control.HORIZONTAL_ALIGNMENT_LEFT
        });

        const changePwdBtn = createButton({
            id: "changePwd",
            width: "70%",
            height: "50px",
            txt: "Changer mot de passe",
            background: BTN_NORMAL,
            fontSize: 20,
            color: TEXT_BRIGHT,
            cornerRadius: 10,
            onClick: () =>{
                this.flag = true;
                this.mainInterfaceStruct();
                this.changePwdInterface();
            }
        });
        rightPanel.addControl(changePwdBtn);

        // change this with 2fa user methods request/!\
         //get 2fa methods from request
        const methods = await getTwoFactorMethods();
        console.log("User 2FA methods:", methods);
        if (!methods){
            console.error("No 2FA methods found for user.");
            this.enable2faApp = false;
            this.enable2faMail = false;
        }else{
            for (const method of methods) {
                if (method.type === "TOTP" && method.enabled) {
                    console.log("TOTP 2FA is enabled for user.");
                    this.enable2faApp = true;
                }
                if (method.type === "EMAIL" && method.enabled) {     
                    console.log("Email 2FA is enabled for user."); 
                    this.enable2faMail = true;
                }
            }  
        }


        console.log("App 2FA enabled state:", this.enable2faApp);

        const enable2faBtn = create2faButton({
            id: "enable2FAApp",
            stateVar: () => this.enable2faApp,
            setStateVar: (val) => this.enable2faApp = val,
            activeText: "Activer 2FA 📱",
            inactiveText: "Désactiver 2FA 📱",
            activeColor: BTN_ACTIVE,
            inactiveColor: BTN_NORMAL,
            onActivate: () => {
                getTotpSecret().then((data) => {
                    if (data) {
                        console.log("TOTP Secret fetched:", data.qrCodeUrl);
                        // Here you would typically generate a QR code from data.qrCodeUrl
                        // and display it in the UI for the user to scan.
                        this.enable2faApp = true;
                        this.flag = true;
                        this.mainInterfaceStruct();
                        this.enable2FaAppInterface(data.qrCodeUrl);
                        
                    } else {
                        console.error("Failed to fetch TOTP secret.");
                    }
                });
            },
            onDeactivate: () => {
                console.log("Disabling 2FA app...");
                disableTotp();
                this.enable2faApp = false;
                this.flag = false;
            }
        });
        rightPanel.addControl(enable2faBtn);

        // initialize email 2FA state from user methods
        if (!this.userX.getUser) return;
      
    

        const enable2faMailBtn = create2faButton({
            id: "enable2FAMail",
            stateVar: () => this.enable2faMail,
            setStateVar: (val) => this.enable2faMail = val,
            activeText: "Activer 2FA ✉️",
            inactiveText: "Désactiver 2FA ✉️",
            activeColor: BTN_ACTIVE,
            inactiveColor: BTN_NORMAL,
            onActivate: async () => {
                await sendEnableEmailOtp();
                this.flag = true;
                this.enable2faMail = true;
                this.mainInterfaceStruct();
                this.enable2FaMailInterface();
            },
            onDeactivate: async () => {
                console.log("Disabling 2FA email...");
                await disable2faEmail();
                this.flag = false;
                this.enable2faMail = false;
            }   
        });
        rightPanel.addControl(enable2faMailBtn);
    }

    // =============================================================
    //  CAT 2 (CENTER)
    // =============================================================
    private displayMainCat2() : void {
        const centerPanel = new StackPanel();
        centerPanel.isVertical = true;
        centerPanel.background = "#242424";
        centerPanel.paddingTop = 0;
        centerPanel.spacing = 30;
        centerPanel.width = "300px";
        centerPanel.height = "100%";
        this.profileStack.addControl(centerPanel);

        createSectionTitle({
            parent: centerPanel,
            text: "Personnelles 👤",
            height: "50px",
            fontSize: 25,
            color: TEXT_BRIGHT,
            background: "#333",
            paddingLeft: "5px",
            textHorizontalAlignment: Control.HORIZONTAL_ALIGNMENT_LEFT
        });

        const avatarContainer = new Rectangle("avatarContainer");
        avatarContainer.width = "250px";
        avatarContainer.height = "250px";
        avatarContainer.cornerRadius = 120;
        avatarContainer.thickness = 0;
        avatarContainer.background = "#000";
        centerPanel.addControl(avatarContainer);

        let path = this.userX.getUser?.avatarUrl && this.userX.getUser?.avatarUrl !== "" ?
            this.userX.getUser?.avatarUrl : "logoPink.png";
        
        const avatarCircle = new Rectangle("avatarCircle");
        avatarCircle.width = 1;
        avatarCircle.height = 1;
        avatarCircle.cornerRadius = 40;
        avatarCircle.thickness = 0;
        avatarCircle.background = "transparent";
        avatarContainer.addControl(avatarCircle);
        
        const avatar = new Image("avatarImg", path);
        avatar.width = "100%";
        avatar.height = "100%";
        avatar.stretch = Image.STRETCH_UNIFORM;
        avatarCircle.addControl(avatar);
    }

    // =============================================================
    //  CAT 1 (LEFT)
    // =============================================================
    private displayMainCat1(): void {
        const leftPanel = new StackPanel();
        leftPanel.isVertical = true;
        leftPanel.background = "#2b2b2b";
        leftPanel.width = "320px";
        leftPanel.height = "100%";
        this.profileStack.addControl(leftPanel);

        createSectionTitle({
            parent: leftPanel,
            text: "Informations",
            height: "50px",
            fontSize: 25,
            color: TEXT_BRIGHT,
            background: "#333",
            paddingLeft: "180px",
            textHorizontalAlignment: Control.HORIZONTAL_ALIGNMENT_LEFT
        });

        const loginText = new TextBlock();
        loginText.text = "Login: " + this.userX.getUser?.username;
        loginText.height = "40px";
        loginText.fontSize = 19;
        loginText.paddingLeft = "5px";
        loginText.color = TEXT_BRIGHT;
        loginText.shadowColor = "#000";
        loginText.shadowBlur = 5;
        loginText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(loginText);

        const mailText = new TextBlock();
        mailText.text = "Email: " + this.userX.getUser?.email;
        mailText.height = "25px";
        mailText.paddingLeft = "5px";
        mailText.fontSize = 19;
        mailText.color = TEXT_BRIGHT;
        mailText.shadowColor = "#000";
        mailText.shadowBlur = 4;
        mailText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(mailText);

        const recSection2 = new Rectangle();
        recSection2.height = "80px";
        recSection2.thickness = 0;
        recSection2.paddingTop = "35px";
        recSection2.background = "#444";
        leftPanel.addControl(recSection2);

        const titleSection2 = new TextBlock();
        titleSection2.text = "Statistiques 📊";
        titleSection2.height = "100px";
        titleSection2.fontSize = 25;
        titleSection2.color = TEXT_BRIGHT;
        titleSection2.shadowColor = "#000";
        titleSection2.shadowBlur = 4;
        titleSection2.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        recSection2.addControl(titleSection2);

        const gamePlayed = new TextBlock();
        gamePlayed.text = "🕹️ Total: " + this.userX.getUser?.gamesPlayed;
        gamePlayed.height = "40px";
        gamePlayed.paddingLeft = "5px";
        gamePlayed.fontSize = 19;
        gamePlayed.color = TEXT_BRIGHT;
        gamePlayed.shadowColor = "#000";
        gamePlayed.shadowBlur = 4;
        gamePlayed.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(gamePlayed);

        const win = new TextBlock();
        win.text = "🏅 Victoires: " + this.userX.getUser?.wins;
        win.height = "25px";
        win.fontSize = 19;
        win.paddingLeft = "5px";
        win.color = TEXT_BRIGHT;
        win.shadowColor = "#000";
        win.shadowBlur = 4;
        win.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(win);

        const loss = new TextBlock();
        loss.text = "💩 Défaites: " + this.userX.getUser?.loss;
        loss.height = "40px";
        loss.fontSize = 19;
        loss.paddingLeft = "5px";
        loss.color = TEXT_BRIGHT;
        loss.shadowColor = "#000";
        loss.shadowBlur = 4;
        loss.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(loss);
    }

    // =============================================================
    //  MAIN LAYOUT
    // =============================================================
    private mainInterfaceStruct() : void {
        this.panel = new StackPanel();
        this.panel.width = "100%";
        this.panel.height = "1024px";
        this.panel.isVertical = true;
        this.panel.spacing = 0;
        this.panel.background = BG_DARK;
        this.container.addControl(this.panel);

        const titlePanel = new Rectangle("titlepanel");
        titlePanel.width = "100%";
        titlePanel.height = "300px";
        titlePanel.thickness = 0;
        titlePanel.background = "#111";
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
                background: BTN_BACK,
                fontSize: 100,
                color: TEXT_BRIGHT,
                cornerRadius: 0,
                textHorizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER,
                textVerticalAlignment: Control.VERTICAL_ALIGNMENT_CENTER,
                onClick: () =>{
                    this.flag = false;
                    this.displayMenu();
                }
            });
            horizontalLayout.addControl(backBtn);
        }
        
        const title = new TextBlock("tiltetextblock");
        title.text = "Mon profil";
        title.width = this.flag ? "600px" : "1000px";
        title.color = TEXT_BRIGHT;
        title.fontSize = 45;
        title.shadowBlur = 8;
        title.shadowColor = "#000";
        title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        title.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        horizontalLayout.addControl(title);


        if (!this.flag){
            this.profilePanel = new Rectangle("this.profilePanel");
            this.profilePanel.width = "100%";
            this.profilePanel.height = "400px";
            this.profilePanel.thickness = 0;
            this.profilePanel.background = "#1f1f1f"; 
            this.profilePanel.paddingTop = "20px";
            this.profilePanel.paddingLeft = "20px";
            this.profilePanel.paddingRight = "20px";
            this.panel.addControl(this.profilePanel);

            this.profileStack = new StackPanel();
            this.profileStack.isVertical = false;
            this.profileStack.width = "100%";
            this.profileStack.height = "100%";
            this.profileStack.spacing = 0;
            this.profileStack.background = "#1f1f1f";
            this.profilePanel.addControl(this.profileStack);

            const logoutBtn = createButton({
                id: "logout",
                width: "100%",
                height: "50px",
                txt: "Se déconnecter",
                background: BTN_NORMAL,
                fontSize: 30,
                color: TEXT_BRIGHT,
                cornerRadius: 0,
                onClick: async () =>{
                    try {
                        const success = await logoutUser();
                        if (success) {
                            this.sceneManager.getSceneInteractor?.reset();
                            this.dispose();
                            this.userX.clearUser();
                            this.sceneManager.moveCameraTo(ZoneName.START, () => {
                                this.sceneManager.getSceneInteractor?.enableInteractions();
                            });
                        }
                    } catch (err) {
                        console.error("Erreur :", err);
                    }
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
}
