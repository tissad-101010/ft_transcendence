
// fuuction that logout user from the application
import { logoutUser } from "../auth/controllers/signout.ts";

import { ZoneName } from "../config.ts";

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
    private changePwd : boolean = false;

    constructor(sceneManager: SceneManager, userX: UserX)
    {
        this.sceneManager = sceneManager;
        this.sceneManager.getScene().getMeshByName("logo").isVisible = false;

        const mesh = this.sceneManager.getScene().getMeshByName("field");
        this.container = AdvancedDynamicTexture.CreateForMesh(mesh,1024, 1024);
        this.userX = userX;
        this.displayMenu();
    }

    private createInputField(placeholderText: string) {
        const fieldContainer = new Rectangle();
        fieldContainer.width = "80%";
        fieldContainer.height = "70px";
        fieldContainer.cornerRadius = 10;
        fieldContainer.thickness = 2;
        fieldContainer.color = "gray";
        fieldContainer.background = "white";
        fieldContainer.paddingLeft = "10px";
        formPanel.addControl(fieldContainer);

        // Champ de saisie
        const input = new InputText();
        input.width = "100%";
        input.height = "100%";
        input.color = "black";
        input.fontSize = 26;
        input.thickness = 0;
        input.background = "transparent";
        fieldContainer.addControl(input);

        // Placeholder (TextBlock par dessus)
        const placeholder = new TextBlock();
        placeholder.text = placeholderText;
        placeholder.color = "gray";
        placeholder.fontSize = 26;
        placeholder.paddingLeft = 5;
        placeholder.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        placeholder.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        fieldContainer.addControl(placeholder);
    }


    private displayChangePwdInt() : void {
        const zoneTxt = new Rectangle("zoneTxt");
        zoneTxt.width = "100%";
        zoneTxt.height = "100%";
        zoneTxt.thickness = 0;
        zoneTxt.background = "black"; 
        zoneTxt.paddingTop = "20px";
        zoneTxt.paddingLeft = "20px";
        zoneTxt.paddingRight = "20px";
        this.panel.addControl(zoneTxt);

        // const panel = new StackPanel();
        // panel.isVertical = true;
        // panel.width = "70%";
        // panel.height = "100%";
        // panel.paddingTop = "20px";
        // zoneTxt.addControl(panel);

        // const input = new InputText();
        // input.width = "100%";
        // input.height = "100%";
        // input.color = "black";
        // input.fontSize = 26;
        // input.thickness = 0;
        // input.background = "transparent";
        // panel.addControl(input);

        // Placeholder (TextBlock par dessus)
        // const placeholder = new TextBlock();
        // placeholder.text = placeholderText;
        // placeholder.color = "gray";
        // placeholder.fontSize = 26;
        // placeholder.paddingLeft = 5;
        // placeholder.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        // placeholder.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        // fieldContainer.addControl(placeholder);

    }

    private displayMainCat3() : void {
        const rightPanel = new StackPanel();
        rightPanel.isVertical = true;
        rightPanel.width = "370px";
        rightPanel.height = "100%";
        // rightPanel.paddingTop = "20px";
        this.profileStack.addControl(rightPanel);

        const recSection3 = new Rectangle();
        recSection3.height = "50px";
        recSection3.thickness = 0;
        // recSection3.paddingTop = "35px";
        recSection3.background = "rgba(191, 30, 212, 1)";
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
        changePwdBtn.height = "90px";
        changePwdBtn.paddingTop = "40px";
        changePwdBtn.width = "70%";
        changePwdBtn.color = "white";
        changePwdBtn.fontSize = 20;
        changePwdBtn.background = "#0066FF";
        changePwdBtn.cornerRadius = 10;

        changePwdBtn.onPointerUpObservable.add(() => {
            console.log("Changer le mot de passe");
            this.changePwd = true;
            this.displayMainInterface();
            this.displayChangePwdInt();
        });

        rightPanel.addControl(changePwdBtn);

        // Bouton activer 2FA App
        const enable2FAAppBtn = Button.CreateSimpleButton("enable2FAApp", "Activer la 2FA (App)");
        enable2FAAppBtn.height = "120px";
        enable2FAAppBtn.paddingTop = "70px";
        enable2FAAppBtn.width = "70%";
        enable2FAAppBtn.color = "white";
        enable2FAAppBtn.fontSize = 20;
        enable2FAAppBtn.background = "#009944";
        enable2FAAppBtn.cornerRadius = 10;

        enable2FAAppBtn.onPointerUpObservable.add(() => {
            console.log("Activer 2FA App");
        });

        rightPanel.addControl(enable2FAAppBtn);

        // Bouton activer 2FA Email
        const enable2FAEmailBtn = Button.CreateSimpleButton("enable2FAEmail", "Activer la 2FA (Email)");
        enable2FAEmailBtn.height = "100px";
        enable2FAEmailBtn.paddingTop = "60px";
        enable2FAEmailBtn.width = "70%";
        enable2FAEmailBtn.color = "white";
        enable2FAEmailBtn.fontSize = 20;
        enable2FAEmailBtn.background = "#CC8800";
        enable2FAEmailBtn.cornerRadius = 10;

        enable2FAEmailBtn.onPointerUpObservable.add(() => {
            console.log("Activer 2FA Email");
        });

        rightPanel.addControl(enable2FAEmailBtn);
    }

    private displayMainCat2() : void {
        const centerPanel = new StackPanel();
        centerPanel.isVertical = true;
        centerPanel.background = "#8c00ffff";
        centerPanel.width = "300px";
        centerPanel.height = "100%";
        this.profileStack.addControl(centerPanel);

        const avatarContainer = new Rectangle("avatarContainer");
        avatarContainer.width = "250px";
        avatarContainer.height = "250px";
        avatarContainer.paddingTop = "15px";
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
        recSection1.height = "40px";
        recSection1.thickness = 0;
        recSection1.background = "rgba(194, 212, 30, 1)";
        leftPanel.addControl(recSection1);

        const titleSection1 = new TextBlock();
        titleSection1.text = "Informations personnelles 👤​";
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

        // PHONE
        const phoneText = new TextBlock();
        phoneText.text = "​📞​ Tel: " + this.userX.getUser?.phone;
        phoneText.height = "40px";
        phoneText.fontSize = 19;
        phoneText.paddingLeft = "5px";
        phoneText.color = "black";
        phoneText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(phoneText);

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
    
    private displayMainInterface() : void {
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

        if (this.changePwd){
            console.log("entrree dans foncot");
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
            // btnLabel.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM; 
            btnLabel.paddingTop = "210px"; // pour éviter collé au bord 
            backButton.textBlock!.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            horizontalLayout.addControl(backButton);
        }
        
        const title = new TextBlock("tiltetextblock");
        title.text = "Mon profil";
        if (this.changePwd)
            title.width = "600px";
        else
            title.width = "950px";
        title.color = "white";
        title.fontSize = 45;
        // ALIGNE LE TEXTE EN BAS
        title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        title.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        horizontalLayout.addControl(title);


        // --- SECTION 2 : Profil utilisateur ---
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
        this.profileStack.spacing = 5;
        this.profileStack.background = "#ffffffff";
        this.profilePanel.addControl(this.profileStack);


        // // --- SECTION 3 : Bouton Déconnexion ---
        if (!this.changePwd){
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
                    this.dispose();
                    this.sceneManager.moveCameraTo(ZoneName.START, () => {
                        // A voir s'il y a des choses supplmentaires  faire aprs la dconnexion
                        this.sceneManager.getSceneInteractor?.enableInteractions();
                    });
                } else {
                    console.error("Échec de la déconnexion");
                }
            });

            this.panel.addControl(logoutButton);
        }
    }

    public displayMenu() : void
    {
        this.displayMainInterface();
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


