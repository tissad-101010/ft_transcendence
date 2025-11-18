import { AbstractMesh, Scene} from '@babylonjs/core';
import { 
  AdvancedDynamicTexture, 
  StackPanel, 
  Rectangle, 
  Button,
  TextBlock,
  Control,
  Grid,
  ScrollViewer
} from "@babylonjs/gui";

import { UserX } from '../../UserX.ts';

import { UIData } from '../utils.ts';

import { DataMatchBlock, genRulesMatchBlock } from './genRulesMatch.ts';
import { Tournament } from '../../Tournament.ts';

import { backButton, createButton, invitationButton, joinButton, rulesButton, newButton, startButton } from './navigationButton.ts';

import { myClearControls } from "../../utils.ts";
import { ScoreboardHandler } from '../ScoreboardHandler.ts';

import { Match } from '../../Match.ts';


export interface Env
{
    page: Rectangle | null;
    menuContainer: Rectangle | null;
    advancedTexture: AdvancedDynamicTexture | null;
    meshScoreboard: AbstractMesh;
    userX: UserX;
    UIData: UIData;
    tournament: Tournament;
    errorMsg: TextBlock | null;
    control: ScoreboardHandler;
    scoreboard: ScoreboardHandler;
}

function buttonNavigation(
    label: string,
    env: Env,
    settings: DataMatchBlock,
    grid: Grid
) : Rectangle
{
    const button = new Rectangle();
    button.height = "80px";
    button.width = "140px";
    button.thickness = env.UIData.button.thickness + 4;
    button.color = env.UIData.text.color;
    if (label === settings.currPage)
        button.background = env.UIData.button.clickedBackground;
    else
        button.background = env.UIData.button.background;

    const text = new TextBlock();
    text.text = label;
    text.color = env.UIData.text.color;
    text.fontSize = env.UIData.text.fontSize - 2;
    text.fontFamily = env.UIData.text.fontFamily;
    button.addControl(text);

    button.onPointerClickObservable.add(() => {
        if (settings.currPage !== label)
        {
            settings.controlButtons.forEach((b) => {
                b.background = env.UIData.button.background;
            })
            button.background = env.UIData.button.clickedBackground;
        }
        switch (label)
        {
            case "Retour" :
                backButton(env, menuCreate)
                break;
            case "Match" :
                rulesButton(label, env, settings, grid)
                break;
            case "Nouveau" :
                newButton(label, env, settings, grid);
                break;
            case "Rejoindre" :
                joinButton(label, env, grid);
                break;
            case "Participants" :
                invitationButton(label, env, settings, grid);
                break;
            case "Créer" :
                createButton(env, grid);
                break;
            case "Lancer" :
                /***** ***** */
                /*  A FAIRE  */
                /***** ***** */
                startButton(env, settings);
                console.info("Ce bouton n'est pas encore fonctionnel");
                break;
        }
    });
    button.onPointerEnterObservable.add(() => {
        button.background = env.UIData.button.hoveredBackground;
    });

    button.onPointerOutObservable.add(() => {
        if (label === settings.currPage)
            button.background = env.UIData.button.clickedBackground;
        else
            button.background = env.UIData.button.background;
    })
    settings.controlButtons.push(button);
    return (button);
}

export function genJoinMatch(env: Env) : StackPanel
{
    const page = new StackPanel();
    page.isVertical = true;
    page.paddingTop = "70px";
    page.width = "90%";

    const title = new TextBlock();
    title.text = "Rejoindre un match";
    title.color = env.UIData.title.color;
    title.fontSize = env.UIData.title.fontSize;
    title.fontFamily = env.UIData.title.fontFamily;
    title.width = "500px";
    title.height = "80px";
    
    page.addControl(title);
   
    const scrollViewer = new ScrollViewer();
    scrollViewer.width = "100%";
    scrollViewer.height = "300px";
    scrollViewer.background = "transparent";
    scrollViewer.barColor = env.UIData.text.color;
    scrollViewer.thickness = 0;
    page.addControl(scrollViewer);

    const container = new StackPanel();
    container.width = "100%";
    container.isVertical = true;
    container.spacing = 20;
    scrollViewer.addControl(container);

    // En-tête du tableau
    const headerRect = new Rectangle();
    headerRect.width = "500px";
    headerRect.height = "50px";
    headerRect.background = "white";
    headerRect.thickness = 5;
    headerRect.color = "black";
    headerRect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    container.addControl(headerRect);

    const headerPanel = new StackPanel();
    headerPanel.isVertical = false;
    headerPanel.width = "500px";
    headerPanel.height = "100px";
    headerRect.addControl(headerPanel);

    const headerLogin = new TextBlock();
    headerLogin.text = "Login";
    headerLogin.fontSize = env.UIData.text.fontSize;
    headerLogin.fontFamily = env.UIData.text.fontFamily;
    headerLogin.width = "100px";
    headerLogin.height = "100px";
    headerLogin.color = "black";
    headerPanel.addControl(headerLogin);

    const headerSpeed = new TextBlock();
    headerSpeed.text = "Vitesse";
    headerSpeed.fontSize = env.UIData.text.fontSize;
    headerSpeed.fontFamily = env.UIData.text.fontFamily;
    headerSpeed.width = "100px";
    headerSpeed.height = "100px";
    headerSpeed.color = "black";
    headerPanel.addControl(headerSpeed);

    const headerTime = new TextBlock();
    headerTime.text = "Delai";
    headerTime.fontSize = env.UIData.text.fontSize;
    headerTime.fontFamily = env.UIData.text.fontFamily;
    headerTime.width = "100px";
    headerTime.height = "100px";
    headerTime.color = "black";
    headerPanel.addControl(headerTime);

    const headerScore = new TextBlock();
    headerScore.text = "Score";
    headerScore.fontSize = env.UIData.text.fontSize;
    headerScore.fontFamily = env.UIData.text.fontFamily;
    headerScore.width = "100px";
    headerScore.height = "100px";
    headerScore.color = "black";
    headerPanel.addControl(headerScore);

    // Fonction pour charger les matchs depuis l'API
    const loadMatches = async () => {
        console.log("🔄 Chargement des matchs amicaux...");
        
        // Nettoyer le conteneur (garder seulement l'en-tête)
        // On récupère tous les contrôles du conteneur sauf headerRect
        const controlsToRemove: Control[] = [];
        if (container.children) {
            container.children.forEach((control) => {
                if (control !== headerRect) {
                    controlsToRemove.push(control);
                }
            });
        }
        
        // Supprimer tous les contrôles sauf l'en-tête
        controlsToRemove.forEach((control) => {
            container.removeControl(control);
            control.dispose();
        });

        try {
            console.log("🔄 Tentative de récupération des matchs amicaux...");
            const response = await fetch("https://localhost:8443/api/friendly/list", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });

            console.log("📡 Réponse reçue:", response.status, response.statusText);

            if (!response.ok) {
                console.error("❌ Erreur lors de la récupération des matchs amicaux:", response.status, response.statusText);
                const errorText = new TextBlock();
                errorText.text = `Erreur de chargement (${response.status})`;
                errorText.color = "red";
                errorText.fontSize = env.UIData.text.fontSize;
                errorText.fontFamily = env.UIData.text.fontFamily;
                errorText.width = "500px";
                errorText.height = "50px";
                container.addControl(errorText);
                return;
            }

            const data = await response.json();
            console.log("✅ Données reçues:", data);
            console.log("📦 Données brutes de l'API:", data);
            
            const matchs = data.matches || [];
            
            console.log("📋 Matchs récupérés depuis l'API:", matchs);
            console.log("📊 Nombre de matchs:", matchs.length);

            // Réajouter l'en-tête si nécessaire (au cas où il aurait été supprimé)
            let headerExists = false;
            if (container.children) {
                container.children.forEach((control) => {
                    if (control === headerRect) {
                        headerExists = true;
                    }
                });
            }
            if (!headerExists) {
                container.addControl(headerRect);
            }

            // Si aucun match, afficher un message
            if (matchs.length === 0) {
                console.log("ℹ️ Aucun match disponible");
                const noMatchText = new TextBlock();
                noMatchText.text = "Aucun match disponible";
                noMatchText.color = env.UIData.text.color;
                noMatchText.fontSize = env.UIData.text.fontSize;
                noMatchText.fontFamily = env.UIData.text.fontFamily;
                noMatchText.width = "500px";
                noMatchText.height = "50px";
                noMatchText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                container.addControl(noMatchText);
                return;
            }

            // Afficher les matchs
            console.log("✅ Affichage de", matchs.length, "match(s)");
            console.log("📦 Conteneur avant ajout des matchs:", container.children?.length || 0, "contrôles");
            
            matchs.forEach((m: any, index: number) => {
                console.log(`  📋 Match ${index + 1}:`, m);
                const rect = new Rectangle();
                rect.width = "500px";
                rect.height = "100px";
                rect.background = "white";
                rect.thickness = 3;
                rect.color = "black";
                rect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                container.addControl(rect);
                console.log(`  ✅ Rectangle du match ${index + 1} ajouté au conteneur (total: ${container.children?.length || 0} contrôles)`);

                const panel = new StackPanel();
                panel.isVertical = false;
                panel.width = "500px";
                panel.height = "100px";
                rect.addControl(panel);

                const login = new TextBlock();
                login.text = m.login;
                login.fontSize = env.UIData.text.fontSize;
                login.fontFamily = env.UIData.text.fontFamily;
                login.width = "100px";
                login.height = "100px";
                login.color = "black";
                panel.addControl(login);

                const speed = new TextBlock();
                speed.text = m.speed;
                speed.fontSize = env.UIData.text.fontSize;
                speed.fontFamily = env.UIData.text.fontFamily;
                speed.width = "100px";
                speed.height = "100px";
                speed.color = "black";
                panel.addControl(speed);

                const time = new TextBlock();
                time.text = m.time;
                time.fontSize = env.UIData.text.fontSize;
                time.fontFamily = env.UIData.text.fontFamily;
                time.width = "100px";
                time.height = "100px";
                time.color = "black";
                panel.addControl(time);

                const score = new TextBlock();
                score.text = m.score;
                score.fontSize = env.UIData.text.fontSize;
                score.fontFamily = env.UIData.text.fontFamily;
                score.width = "100px";
                score.height = "100px";
                score.color = "black";
                panel.addControl(score);

                const button = new Rectangle();
                button.height = "50px";
                button.width = "80px";
                button.thickness = env.UIData.button.thickness;
                button.color = env.UIData.text.color;
                button.background = env.UIData.button.background;
                panel.addControl(button);

                const text = new TextBlock();
                text.text = "Go";
                text.color = env.UIData.text.color;
                text.fontSize = env.UIData.text.fontSize - 4;
                text.fontFamily = env.UIData.text.fontFamily;
                button.addControl(text);
                
                button.onPointerClickObservable.add(() => {
                    const rules = {
                        speed: m.speed,
                        score: m.score,
                        timeBefore: m.time
                    };
                    env.userX.joinFriendlyMatch(rules, m.idMatch, m.idUser, m.login, env).then((success) => {
                        if (!success) {
                            button.background = "red";
                        } else {
                            env.scoreboard.leaveMenu();
                        }
                    }).catch((error) => {
                        console.error("Erreur lors de la jonction au match:", error);
                        button.background = "red";
                    });
                });
            });
        } catch (error) {
            console.error("❌ Erreur lors du chargement des matchs:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("❌ Détails de l'erreur:", errorMessage);
            const errorText = new TextBlock();
            errorText.text = `Erreur de connexion: ${errorMessage.substring(0, 50)}`;
            errorText.color = "red";
            errorText.fontSize = env.UIData.text.fontSize;
            errorText.fontFamily = env.UIData.text.fontFamily;
            errorText.width = "500px";
            errorText.height = "50px";
            container.addControl(errorText);
        }
    };

    // Charger les matchs au chargement de la page
    loadMatches();

    // Rafraîchir la liste toutes les 2 secondes pour une meilleure réactivité
    const refreshInterval = setInterval(() => {
        loadMatches();
    }, 2000);
    
    // Stocker la fonction de rafraîchissement dans l'environnement pour pouvoir l'appeler depuis l'extérieur
    (env as any).refreshJoinMatchList = loadMatches;
    
    // Stocker aussi l'intervalle pour pouvoir le nettoyer si nécessaire
    (env as any).refreshJoinMatchInterval = refreshInterval;

    // Nettoyer l'intervalle quand la page est fermée (optionnel)
    // Note: Dans un vrai projet, il faudrait gérer le nettoyage proprement

    return (page);
}


function match(
    env: Env,
) : void
{
    myClearControls(env.menuContainer)

    const grid = new Grid();
    grid.width = "100%";
    grid.height = "60%";
    grid.addColumnDefinition(1);
    grid.addRowDefinition(0.8);
    grid.addRowDefinition(0.05);
    grid.addRowDefinition(0.15);
    env.menuContainer.addControl(grid);
    const settings : DataMatchBlock = {
        data: {
            speed: "",
            score: "",
            timeBefore: ""
        },
        graph: {
            container: {
                width: "100%",
                height: "100%",
                thickness: 1,
                color: "blue"
            },
            text : env.UIData.text,
            button: env.UIData.button,
            inputText: env.UIData.inputText
        },
        controlButtons: [],
        currPage: "Menu",
        mode: -1,
        onCreateMatch: async (rules: MatchRules) => {
            console.log("🚀 onCreateMatch appelé avec les règles:", rules);
            const success = await env.userX.createFriendlyMatch(rules);
            if (success) {
                console.log("✅ Match créé, rafraîchissement de la liste...");
                // Rafraîchir la liste des matchs si on est sur la page "Rejoindre"
                if ((env as any).refreshJoinMatchList) {
                    setTimeout(() => {
                        (env as any).refreshJoinMatchList();
                    }, 1000);
                }
            }
            return success;
        }
    }

    env.page = genRulesMatchBlock(settings, true);
    grid.addControl(env.page, 0, 0);

    const rowButtons = new StackPanel();
    rowButtons.isVertical = false;
    rowButtons.height = "100%";
    rowButtons.spacing = 10;
    grid.addControl(rowButtons, 2, 0);

    rowButtons.addControl(buttonNavigation("Nouveau", env, settings, grid));
    rowButtons.addControl(buttonNavigation("Rejoindre", env, settings, grid));
    rowButtons.addControl(buttonNavigation("Retour", env, settings, grid));
}

function tournament(
    env: Env
) : void
{
    myClearControls(env.menuContainer);

    if (env.tournament === undefined)
    {
        console.info("Tournament existe pas");
        return ;
    }

    const grid = new Grid();
    grid.width = "100%";
    grid.height = "60%";
    grid.addColumnDefinition(1);
    grid.addRowDefinition(0.7);
    grid.addRowDefinition(0.1);
    grid.addRowDefinition(0.2);
    env.menuContainer.addControl(grid);
    const settings : DataMatchBlock = {
        data: env.tournament.getRules,
        graph: {
            container: {
                width: "100%",
                height: "100%",
                thickness: 1,
                color: "blue"
            },
            text : env.UIData.text,
            button: env.UIData.button,
            inputText: env.UIData.inputText
        },
        controlButtons: [],
        currPage: "Match",
        mode : -1,
    }
    env.page = genRulesMatchBlock(settings, false);
    grid.addControl(env.page, 0, 0);
    
    const rowButtons = new StackPanel();
    rowButtons.isVertical = false;
    rowButtons.height = "100%";
    rowButtons.spacing = 10;
    grid.addControl(rowButtons, 2, 0);

    env.errorMsg = null;
    rowButtons.addControl(buttonNavigation("Match", env, settings, grid));
    rowButtons.addControl(buttonNavigation("Participants", env, settings, grid));
    rowButtons.addControl(buttonNavigation("Créer", env, settings, grid));
    rowButtons.addControl(buttonNavigation("Retour", env, settings, grid));
}

export function menuCreate(
    env: Env
) : void
{
    myClearControls(env.menuContainer);
    const panel = new StackPanel();
    panel.isVertical = false;
    panel.height = "90%";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    panel.spacing = 10;
    env.menuContainer.addControl(panel);

    const button1 = Button.CreateImageOnlyButton("tournamentButton", "/lockerRoom/textures/trophy.png");
    button1.width = "200px";
    button1.height = "200px";
    button1.thickness = 0;
    panel.addControl(button1);

    // Effets de survol
    button1.onPointerEnterObservable.add(() => {
        button1.alpha = 0.7;           
        button1.scaleX = 1;          // agrandit légèrement
        button1.scaleY = 1;
    });

    button1.onPointerOutObservable.add(() => {
        button1.alpha = 1;             // remet normal
        button1.scaleX = 0.9;            // remet taille normale
        button1.scaleY = 0.9;
    });

    button1.onPointerUpObservable.add(async () => {
        // Utiliser le login de l'utilisateur connecté comme alias
        const userLogin = env.userX.getUser?.login || "Player";
        await env.userX.createTournament(userLogin);
        if (env.userX.getTournament)
            env.tournament = env.userX.getTournament;
        tournament(env);
    });

    const button2 = Button.CreateImageOnlyButton("amicalButton", "/lockerRoom/textures/handshake.png");
    button2.width = "200px";
    button2.height = "200px";
    button2.thickness = 0;
    panel.addControl(button2);

    button2.onPointerEnterObservable.add(() => {
        button2.alpha = 0.7;
        button2.scaleX = 1;
        button2.scaleY = 1;
    });

    button2.onPointerOutObservable.add(() => {
        button2.alpha = 1;
        button2.scaleX = 0.9;
        button2.scaleY = 0.9;
    });

    button2.onPointerUpObservable.add(() => {
        match(env);
    });
}