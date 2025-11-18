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
        title.fontSize = 60;
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
        profileStack.spacing = 20;
        profileStack.background = "#92d4aeff";
        profilePanel.addControl(profileStack);

        /* --------------------------
        AVATAR (À GAUCHE)
        --------------------------- */
        const avatarContainer = new Rectangle("avatarContainer");
        avatarContainer.width = "200px";
        avatarContainer.height = "200px";
        avatarContainer.cornerRadius = 125;
        avatarContainer.thickness = 0;
        avatarContainer.background = "gray";

        profileStack.addControl(avatarContainer);

        // image de l’avatar
        const avatar = new Image("avatarImg", "textures/avatar.png");
        avatar.width = 1;
        avatar.height = 1;
        avatarContainer.addControl(avatar);

        /* --- Crayon pour modifier l’avatar --- */
        const editBtn = new Image("editBtn", "textures/edit.png");
        editBtn.width = "50px";
        editBtn.height = "50px";
        editBtn.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        editBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        editBtn.paddingRight = "10px";
        editBtn.paddingTop = "10px";

        editBtn.onPointerUpObservable.add(() => {
            console.log("Modifier l’avatar");
        });

        avatarContainer.addControl(editBtn);

        /* --------------------------
        INFOS UTILISATEUR (À DROITE)
        --------------------------- */
        const infoPanel = new StackPanel();
        infoPanel.isVertical = true;
        infoPanel.width = "90%";
        infoPanel.height = "100%";
        infoPanel.paddingTop = "10px";
        profileStack.addControl(infoPanel);


        /* --------------------------
        ACTIONS DE SÉCURITÉ
        --------------------------- */
        const securityPanel = new StackPanel();
        securityPanel.isVertical = true;
        securityPanel.width = "100%";
        securityPanel.height = "100%";
        securityPanel.spacing = 20;   // espace entre boutons
        securityPanel.paddingTop = "20px";

        profileStack.addControl(securityPanel);

        // Bouton changer de mot de passe
        const changePwdBtn = Button.CreateSimpleButton("changePwd", "Changer le mot de passe");
        changePwdBtn.height = "80px";
        changePwdBtn.width = "50%";
        changePwdBtn.color = "white";
        changePwdBtn.fontSize = 35;
        changePwdBtn.background = "#0066FF";
        changePwdBtn.cornerRadius = 10;

        changePwdBtn.onPointerUpObservable.add(() => {
            console.log("Changer le mot de passe");
        });

        securityPanel.addControl(changePwdBtn);

        // Bouton activer 2FA App
        const enable2FAAppBtn = Button.CreateSimpleButton("enable2FAApp", "Activer la 2FA (App)");
        enable2FAAppBtn.height = "80px";
        enable2FAAppBtn.width = "50%";
        enable2FAAppBtn.color = "white";
        enable2FAAppBtn.fontSize = 35;
        enable2FAAppBtn.background = "#009944";
        enable2FAAppBtn.cornerRadius = 10;

        enable2FAAppBtn.onPointerUpObservable.add(() => {
            console.log("Activer 2FA App");
        });

        securityPanel.addControl(enable2FAAppBtn);

        // Bouton activer 2FA Email
        const enable2FAEmailBtn = Button.CreateSimpleButton("enable2FAEmail", "Activer la 2FA (Email)");
        enable2FAEmailBtn.height = "80px";
        enable2FAEmailBtn.width = "50%";
        enable2FAEmailBtn.color = "white";
        enable2FAEmailBtn.fontSize = 35;
        enable2FAEmailBtn.background = "#CC8800";
        enable2FAEmailBtn.cornerRadius = 10;

        enable2FAEmailBtn.onPointerUpObservable.add(() => {
            console.log("Activer 2FA Email");
        });

        securityPanel.addControl(enable2FAEmailBtn);


        // LOGIN
        const loginText = new TextBlock();
        loginText.text = "Login : Lolo";
        loginText.height = "100px";
        loginText.fontSize = 40;
        loginText.color = "black";
        loginText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        infoPanel.addControl(loginText);

        // EMAIL
        const mailText = new TextBlock();
        mailText.text = "Email : tamere@hotmail.fr";
        mailText.height = "80px";
        mailText.fontSize = 35;
        mailText.color = "black";
        mailText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        infoPanel.addControl(mailText);

        // PHONE
        const phoneText = new TextBlock();
        phoneText.text = "Téléphone : 0689745410";
        phoneText.height = "80px";
        phoneText.fontSize = 35;
        phoneText.color = "black";
        phoneText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        infoPanel.addControl(phoneText);












        // //
        // // --- SECTION 3 : Bouton Déconnexion ---
        //
        const logoutButton = Button.CreateSimpleButton("logout", "Se déconnecter");
        logoutButton.width = "100%";
        logoutButton.height = "50px";
        logoutButton.color = "white";
        logoutButton.fontSize = 40;
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


