import { 
  StackPanel, 
  Rectangle, 
  Button,
  TextBlock,
  Control,
  Grid,
  ScrollViewer,
  Image
} from "@babylonjs/gui";

import { DataMatchBlock, genRulesMatchBlock } from './genRulesMatch.ts';

import { backButton, createButton, invitationButton, joinButton, rulesButton, newButton, startButton } from './navigationButton.ts';

import { MatchRules } from '../../pong/Match.ts';

import { Env, UIData } from '../utils.ts';
import { getApiUrl } from "../../utils.ts";
import { authFetch } from "../../auth/authFetch.ts";


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
    button.thickness = UIData.button.thickness + 2;
    button.color = UIData.text.color;
    if (label === settings.currPage)
        button.background = UIData.button.clickedBackground;
    else
        button.background = UIData.button.background;

    const text = new TextBlock();
    text.text = label;
    text.color = UIData.text.color;
    text.fontSize = UIData.text.fontSize - 2;
    text.fontFamily = UIData.text.fontFamily;
    button.addControl(text);

    button.onPointerClickObservable.add(() => {
        if (settings.currPage !== label)
        {
            settings.controlButtons.forEach((b) => {
                b.background = UIData.button.background;
            })
            button.background = UIData.button.clickedBackground;
        }
        switch (label)
        {
            case "Back" :
                backButton(env, menuCreate)
                break;
            case "Match" :
                rulesButton(label, env, settings, grid)
                break;
            case "New" :
                newButton(label, env, settings, grid);
                break;
            case "Join" :
                joinButton(label, env, settings, grid);
                break;
            case "Participants" :
                invitationButton(label, env, settings, grid);
                break;
            case "Create" :
                createButton(env, grid);
                break;
            case "Start" :
                startButton(env, settings);
                break;
        }
    });
    button.onPointerEnterObservable.add(() => {
        button.background = UIData.button.hoveredBackground;
    });

    button.onPointerOutObservable.add(() => {
        if (label === settings.currPage)
            button.background = UIData.button.clickedBackground;
        else
            button.background = UIData.button.background;
    })
    settings.controlButtons.push(button);
    return (button);
}

export function genJoinMatch(env: Env) : Rectangle
{
    const page = new Rectangle();
    page.paddingTop = "70px";
    page.width = "90%";
    page.thickness = 0;

    const panel = new StackPanel();
    panel.isVertical = true;
    panel.paddingTop = "70px";
    panel.width = "90%";
   
    const scrollViewer = new ScrollViewer();
    scrollViewer.width = "100%";
    scrollViewer.height = "300px";
    scrollViewer.background = "transparent";
    scrollViewer.barColor = UIData.text.color;
    scrollViewer.thickness = 0;
    page.addControl(scrollViewer);

    const container = new StackPanel();
    container.width = "100%";
    container.isVertical = true;
    container.spacing = 20;
    // S'assurer que le container est lié à la texture GUI avant d'ajouter des contrôles
    scrollViewer.addControl(container);

    // En-tête du tableau
    const headerRect = new Rectangle();
    headerRect.width = "500px";
    headerRect.height = "50px";
    headerRect.thickness = 5;
    headerRect.color = "black";
    headerRect.background = "white";
    headerRect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    container.addControl(headerRect);

    const headerPanel = new StackPanel();
    headerPanel.isVertical = false;
    headerPanel.width = "500px";
    headerPanel.height = "100px";
    headerRect.addControl(headerPanel);

    const headerLogin = new TextBlock();
    headerLogin.text = "Login";
    headerLogin.fontSize = UIData.text.fontSize;
    headerLogin.fontFamily = UIData.text.fontFamily;
    headerLogin.width = "100px";
    headerLogin.height = "100px";
    headerLogin.color = "black";
    headerPanel.addControl(headerLogin);

    const headerSpeed = new TextBlock();
    headerSpeed.text = "Vitesse";
    headerSpeed.fontSize = UIData.text.fontSize;
    headerSpeed.fontFamily = UIData.text.fontFamily;
    headerSpeed.width = "100px";
    headerSpeed.height = "100px";
    headerSpeed.color = "black";
    headerPanel.addControl(headerSpeed);

    const headerTime = new TextBlock();
    headerTime.text = "Delai";
    headerTime.fontSize = UIData.text.fontSize;
    headerTime.fontFamily = UIData.text.fontFamily;
    headerTime.width = "100px";
    headerTime.height = "100px";
    headerTime.color = "black";
    headerPanel.addControl(headerTime);

    const headerScore = new TextBlock();
    headerScore.text = "Score";
    headerScore.fontSize = UIData.text.fontSize;
    headerScore.fontFamily = UIData.text.fontFamily;
    headerScore.width = "100px";
    headerScore.height = "100px";
    headerScore.color = "black";
    headerPanel.addControl(headerScore);

    const buttonUpdate = Button.CreateImageOnlyButton("update", "/icon/update.png");
    buttonUpdate.width = "30px";
    buttonUpdate.height = "30px";
    buttonUpdate.thickness = 0;
    buttonUpdate.cornerRadius = 50;
    buttonUpdate.background = "black";
    (buttonUpdate.image as Image).width = "15px";
    (buttonUpdate.image as Image).height = "15px";
    (buttonUpdate.image as Image).stretch = Image.STRETCH_UNIFORM;
    (buttonUpdate.image as Image).horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    (buttonUpdate.image as Image).verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    headerPanel.addControl(buttonUpdate);

    buttonUpdate.onPointerClickObservable.add(() => {
        loadMatches();
    })

    // Fonction pour charger les matchs depuis l'API
    const loadMatches = async () => {
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
            const response = await authFetch(`${getApiUrl()}/api/friendly/list`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
            });

            if (!response.ok) {
                console.error("❌ Erreur lors de la récupération des matchs amicaux:", response.status, response.statusText);
                const errorText = new TextBlock();
                errorText.text = `Erreur de chargement (${response.status})`;
                errorText.color = "red";
                errorText.fontSize = UIData.text.fontSize;
                errorText.fontFamily = UIData.text.fontFamily;
                errorText.width = "500px";
                errorText.height = "50px";
                container.addControl(errorText);
                return;
            }

            const data = await response.json();
            
            const matchs = data.matches || [];
            
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
                const noMatchText = new TextBlock();
                noMatchText.text = "No match available";
                noMatchText.color = UIData.text.color;
                noMatchText.fontSize = UIData.text.fontSize;
                noMatchText.fontFamily = UIData.text.fontFamily;
                noMatchText.width = "500px";
                noMatchText.height = "50px";
                noMatchText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                container.addControl(noMatchText);
                return;
            }

            // Afficher les matchs
            matchs.forEach((m: any, index: number) => {
                const rect = new Rectangle();
                rect.width = "500px";
                rect.height = "100px";
                rect.background = "white";
                rect.thickness = 3;
                rect.color = "black";
                rect.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
                container.addControl(rect);

                const panel = new StackPanel();
                panel.isVertical = false;
                panel.width = "500px";
                panel.height = "100px";
                rect.addControl(panel);

                const login = new TextBlock();
                // Afficher "R" si le match est en ligne
                login.text = m.login;
                login.fontSize = UIData.text.fontSize;
                login.fontFamily = UIData.text.fontFamily;
                login.width = "100px";
                login.height = "100px";
                login.color = "black"; // Bleu pour les matchs en ligne
                panel.addControl(login);

                const speed = new TextBlock();
                speed.text = m.speed;
                speed.fontSize = UIData.text.fontSize;
                speed.fontFamily = UIData.text.fontFamily;
                speed.width = "100px";
                speed.height = "100px";
                speed.color = "black";
                panel.addControl(speed);

                const time = new TextBlock();
                time.text = m.time;
                time.fontSize = UIData.text.fontSize;
                time.fontFamily = UIData.text.fontFamily;
                time.width = "100px";
                time.height = "100px";
                time.color = "black";
                panel.addControl(time);

                const score = new TextBlock();
                score.text = m.score;
                score.fontSize = UIData.text.fontSize;
                score.fontFamily = UIData.text.fontFamily;
                score.width = "100px";
                score.height = "100px";
                score.color = "black";
                panel.addControl(score);

                const button = new Rectangle();
                button.height = "40px";
                button.width = "40px";
                button.thickness = UIData.button.thickness;
                button.color = UIData.text.color;
                button.background = UIData.button.background;
                panel.addControl(button);

                const text = new TextBlock();
                text.text = "Go";
                text.color = UIData.text.color;
                text.fontSize = UIData.text.fontSize - 4;
                text.fontFamily = UIData.text.fontFamily;
                button.addControl(text);
                
                button.onPointerClickObservable.add(() => {
                    const rules = {
                        speed: m.speed,
                        score: m.score,
                        timeBefore: m.time
                    };
                    env.userX.joinFriendlyMatch(rules, m.idMatch, m.idUser, m.login, env).then((success) => {
                        if (!success) {
                            button.background = "rgba(172, 76, 100, 1)";
                        } else {
                            env.scoreboard.leaveMenu();
                        }
                    }).catch((error) => {
                        console.error("Erreur lors de la jonction au match:", error);
                        button.background = "rgba(172, 76, 100, 1)";
                    });
                });

                button.onPointerEnterObservable.add(() => {
                    button.background = UIData.button.hoveredBackground;
                });

                button.onPointerOutObservable.add(() => {
                    button.background = UIData.button.background;
                });

                // Bouton Supprimer
                if (m.login === env.userX.getUser?.username)
                {
                    const deleteButton = new Rectangle();
                    deleteButton.height = "40px";
                    deleteButton.width = "50px";
                    deleteButton.paddingLeft = 10;
                    deleteButton.thickness = UIData.button.thickness;
                    deleteButton.color = UIData.button.color;
                    deleteButton.background = UIData.button.background;
                    panel.addControl(deleteButton);
    
                    const deleteText = new TextBlock();
                    deleteText.text = "X";
                    deleteText.color = "red";
                    deleteText.fontSize = UIData.text.fontSize - 6;
                    deleteText.fontFamily = UIData.text.fontFamily;
                    deleteButton.addControl(deleteText);
                    
                    deleteButton.onPointerClickObservable.add(async () => {
                        // Désactiver le bouton pendant la suppression
                        deleteButton.isEnabled = false;
                        deleteButton.background = "gray";
                        
                        const success = await env.userX.deleteFriendlyMatch(m.idMatch);
                        if (success) {
                            loadMatches();
                        } else {
                            deleteButton.background = UIData.button.hoveredBackground;
                            deleteButton.isEnabled = true;
                            setTimeout(() => {
                                deleteButton.background = UIData.button.background;
                            }, 2000);
                        }
                    });
    
                    deleteButton.onPointerEnterObservable.add(() => {
                        deleteButton.background = UIData.button.hoveredBackground;
                    });
    
                    deleteButton.onPointerOutObservable.add(() => {
                        deleteButton.background = UIData.button.background;
                    });
                }
            });
        } catch (error) {
            console.error("❌ Erreur lors du chargement des matchs:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("❌ Détails de l'erreur:", errorMessage);
            const errorText = new TextBlock();
            errorText.text = `Error connection: ${errorMessage.substring(0, 50)}`;
            errorText.color = "rgba(172, 76, 100, 1)";
            errorText.fontSize = UIData.text.fontSize;
            errorText.fontFamily = UIData.text.fontFamily;
            errorText.width = "500px";
            errorText.height = "50px";
            container.addControl(errorText);
        }
    };
    return (page);
}


function match(
    env: Env,
) : void
{
    env.menuContainer?.clearControls();

    const grid = new Grid();
    grid.width = "100%";
    grid.height = "60%";
    grid.addColumnDefinition(1);
    grid.addRowDefinition(0.8);
    grid.addRowDefinition(0.05);
    grid.addRowDefinition(0.15);
    env.menuContainer?.addControl(grid);
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
            text : UIData.text,
            button: UIData.button,
            inputText: UIData.inputText
        },
        controlButtons: [],
        currPage: "Menu",
        mode: -1,
        onCreateMatch: async (rules: MatchRules) => {
            // mode: 0 = Local, 1 = En ligne
            const isOnline = settings.mode === 1;
            const success = await env.userX.createFriendlyMatch(rules, isOnline);
            if (success) {
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

    rowButtons.addControl(buttonNavigation("New", env, settings, grid));
    rowButtons.addControl(buttonNavigation("Join", env, settings, grid));
    rowButtons.addControl(buttonNavigation("Back", env, settings, grid));
}

function tournament(
    env: Env
) : void
{
    env.menuContainer!.clearControls();

    const grid = new Grid();
    grid.width = "100%";
    grid.height = "70%";
    grid.addColumnDefinition(1);
    grid.addRowDefinition(0.6);
    grid.addRowDefinition(0.025);
    grid.addRowDefinition(0.275);
    env.menuContainer!.addControl(grid);
    const settings : DataMatchBlock = {
        data: env.userX.getTournament!.getRules,
        graph: {
            container: {
                width: "100%",
                height: "100%",
                thickness: 1,
                color: "blue"
            },
            text : UIData.text,
            button: UIData.button,
            inputText: UIData.inputText
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
    rowButtons.addControl(buttonNavigation("Create", env, settings, grid));
    rowButtons.addControl(buttonNavigation("Back", env, settings, grid));
}

export function menuCreate(
    env: Env
) : void
{
    env.menuContainer!.clearControls();
    const panel = new StackPanel();
    panel.isVertical = false;
    panel.height = "90%";
    panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    panel.spacing = 10;
    env.menuContainer!.addControl(panel);

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
        env.userX.deleteTournament();
        env.userX.createTournament();
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