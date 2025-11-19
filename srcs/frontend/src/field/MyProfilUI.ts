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
    Image
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

    constructor(sceneManager: SceneManager, userX: UserX)
    {
        this.sceneManager = sceneManager;
        this.sceneManager.getScene().getMeshByName("logo").isVisible = false;

        const mesh = this.sceneManager.getScene().getMeshByName("field");
        // const bounds = mesh.getBoundingInfo().boundingBox;

        // const meshWidth  = bounds.maximumWorld.x - bounds.minimumWorld.x;
        // const meshHeight = bounds.maximumWorld.z - bounds.minimumWorld.z; // si le mesh est horizontal

        // const ratio = meshWidth / meshHeight;
        // const baseResolution = 1024;

        // const guiWidth  = baseResolution * ratio;
        // const guiHeight = baseResolution;

        this.container = AdvancedDynamicTexture.CreateForMesh(
            mesh,
1024, 1024
        );
        this.userX = userX;
        this.displayMenu();
    }
    
    public displayMenu() : void
    {
        const panel = new StackPanel();
        panel.width = "100%";
        panel.height = "1024px"; 
        panel.isVertical = true;
        // panel.spacing = 20;
        panel.background = "rgba(0, 102, 255, 1)";

        this.container.addControl(panel);

        // --- SECTION 1 : Titre ---
        const titlePanel = new Rectangle("titlepanel");
        titlePanel.width = "100%";
        titlePanel.height = "300px";
        titlePanel.thickness = 0;
        titlePanel.background = "rgba(255, 217, 0, 1)";
        panel.addControl(titlePanel);

        const title = new TextBlock("tiltetextblock");
        title.text = "Mon profil";
        title.width = "100%";
        // title.height = "100%";
        title.color = "white";
        title.fontSize = 45;
        // ALIGNE LE TEXTE EN BAS
        title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        title.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        titlePanel.addControl(title);



        // --- SECTION 2 : Profil utilisateur ---
        const profilePanel = new Rectangle("profilePanel");
        profilePanel.width = "100%";
        profilePanel.height = "400px";
        profilePanel.thickness = 0;
        profilePanel.background = "white"; 
        profilePanel.paddingTop = "20px";
        profilePanel.paddingLeft = "20px";
        profilePanel.paddingRight = "20px";
        panel.addControl(profilePanel);

        // layout horizontal : avatar + infos
        const profileStack = new StackPanel();
        profileStack.isVertical = false;
        profileStack.width = "100%";
        profileStack.height = "100%";
        profileStack.spacing = 5;
        profileStack.background = "#ffffffff";
        profilePanel.addControl(profileStack);

                                /* --------------------------
                                PANEL INFO + STATS (À GAUCHE)
                                --------------------------- */
        const leftPanel = new StackPanel();
        leftPanel.isVertical = true;
        leftPanel.background = "#ff8800ff";
        leftPanel.width = "320px";
        leftPanel.height = "100%";
        profileStack.addControl(leftPanel);

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
        loginText.text = "Login : Lolo";
        loginText.height = "40px";
        loginText.fontSize = 19;
        loginText.paddingLeft = "5px";
        loginText.color = "black";
        loginText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(loginText);

        // EMAIL
        const mailText = new TextBlock();
        mailText.text = "Email : tamere@hotmail.fr";
        mailText.height = "25px";
        mailText.paddingLeft = "5px";
        mailText.fontSize = 19;
        mailText.color = "black";
        mailText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(mailText);

        // PHONE
        const phoneText = new TextBlock();
        phoneText.text = "Téléphone : 0689745410";
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
        gamePlayed.text = "Parties jouees : 3";
        gamePlayed.height = "40px";
        gamePlayed.paddingLeft = "5px";
        gamePlayed.fontSize = 19;
        gamePlayed.color = "black";
        gamePlayed.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(gamePlayed);

        const win = new TextBlock();
        win.text = "Nombres de victoire : 1";
        win.height = "25px";
        win.fontSize = 19;
        win.paddingLeft = "5px";
        win.color = "black";
        win.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(win);

        const loss = new TextBlock();
        loss.text = "Nombres de defaites : 2";
        loss.height = "40px";
        loss.fontSize = 19;
        loss.paddingLeft = "5px";
        loss.color = "black";
        loss.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        leftPanel.addControl(loss);

                                /* --------------------------
                                       AVATAR (MILIEU)
                                --------------------------- */

        const centerPanel = new StackPanel();
        centerPanel.isVertical = true;
        centerPanel.background = "#8c00ffff";
        centerPanel.width = "300px";
        centerPanel.height = "100%";
        profileStack.addControl(centerPanel);

        const avatarContainer = new Rectangle("avatarContainer");
        avatarContainer.width = "250px";
        avatarContainer.height = "250px";
        avatarContainer.paddingTop = "15px";
        avatarContainer.cornerRadius = 120;
        avatarContainer.thickness = 0;
        avatarContainer.background = "gray";

        centerPanel.addControl(avatarContainer);

        // image de l’avatar
        const avatar = new Image("avatarImg", "textures/avatar.png");
        avatar.width = 1;
        avatar.height = 1;
        avatarContainer.addControl(avatar);

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

                                /* --------------------------
                                       SECURITE (RIGHT)
                                --------------------------- */

        const rightPanel = new StackPanel();
        rightPanel.isVertical = true;
        rightPanel.width = "370px";
        rightPanel.height = "100%";
        // rightPanel.paddingTop = "20px";
        profileStack.addControl(rightPanel);


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

        //


        // // --- SECTION 3 : Bouton Déconnexion ---
        //
        const logoutButton = Button.CreateSimpleButton("logout", "Se déconnecter");
        logoutButton.width = "100%";
        logoutButton.height = "50px";
        logoutButton.color = "white";
        logoutButton.fontSize = 30;
        logoutButton.background = "rgba(255, 0, 0, 0.7)";
        logoutButton.cornerRadius = 10;

        logoutButton.onPointerUpObservable.add(() => {
            console.log("Déconnexion !");
            // action personnalisée ici
        });

        panel.addControl(logoutButton);
    }

    public dispose() : void
    {
        if (this.container)
            this.container.dispose();
    }
}


