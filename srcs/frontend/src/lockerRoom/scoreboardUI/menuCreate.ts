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

import { DataMatchBlock, genRulesMatchBlock } from './genRulesMatch.ts';
import { Tournament } from '../../pong/Tournament.ts';

import { backButton, createButton, invitationButton, joinButton, rulesButton, newButton, startButton } from './navigationButton.ts';

import { API_URL } from "../../utils.ts";
import { ScoreboardHandler } from '../ScoreboardHandler.ts';

import { Match, MatchRules } from '../../pong/Match.ts';

import { Env, UIData } from '../utils.ts';


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
    button.thickness = UIData.button.thickness + 4;
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
                startButton(env, settings);
                console.info("Ce bouton n'est pas encore fonctionnel");
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

export function genJoinMatch(env: Env) : StackPanel
{
    // Vérifier que env.advancedTexture existe et a une scène associée
    if (!env.advancedTexture) {
        console.error("❌ genJoinMatch: advancedTexture n'est pas défini");
        const errorPage = new StackPanel();
        errorPage.isVertical = true;
        const errorText = new TextBlock();
        errorText.text = "Erreur: Texture GUI non disponible";
        errorText.color = "red";
        errorPage.addControl(errorText);
        return errorPage;
    }

    const page = new StackPanel();
    page.isVertical = true;
    page.paddingTop = "70px";
    page.width = "90%";

    const title = new TextBlock();
    title.text = "Rejoindre un match";
    title.color = UIData.title.color;
    title.fontSize = UIData.title.fontSize;
    title.fontFamily = UIData.title.fontFamily;
    title.width = "500px";
    title.height = "80px";
    
    page.addControl(title);
   
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
            const response = await fetch(`${API_URL}/api/friendly/list`, {
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
                errorText.fontSize = UIData.text.fontSize;
                errorText.fontFamily = UIData.text.fontFamily;
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
                // Afficher "R" si le match est en ligne
                login.text = m.isOnline ? `${m.login} (R)` : m.login;
                login.fontSize = UIData.text.fontSize;
                login.fontFamily = UIData.text.fontFamily;
                login.width = "100px";
                login.height = "100px";
                login.color = m.isOnline ? "blue" : "black"; // Bleu pour les matchs en ligne
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
                button.height = "50px";
                button.width = "80px";
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
                            button.background = "red";
                        } else {
                            env.scoreboard.leaveMenu();
                        }
                    }).catch((error) => {
                        console.error("Erreur lors de la jonction au match:", error);
                        button.background = "red";
                    });
                });

                // Bouton Supprimer
                const deleteButton = new Rectangle();
                deleteButton.height = "50px";
                deleteButton.width = "80px";
                deleteButton.thickness = UIData.button.thickness;
                deleteButton.color = "white";
                deleteButton.background = "red";
                panel.addControl(deleteButton);

                const deleteText = new TextBlock();
                deleteText.text = "Supprimer";
                deleteText.color = "white";
                deleteText.fontSize = UIData.text.fontSize - 6;
                deleteText.fontFamily = UIData.text.fontFamily;
                deleteButton.addControl(deleteText);
                
                deleteButton.onPointerClickObservable.add(async () => {
                    console.log("🗑️ Suppression du match:", m.idMatch);
                    // Désactiver le bouton pendant la suppression
                    deleteButton.isEnabled = false;
                    deleteButton.background = "gray";
                    
                    const success = await env.userX.deleteFriendlyMatch(m.idMatch);
                    if (success) {
                        console.log("✅ Match supprimé, rafraîchissement de la liste...");
                        // Rafraîchir immédiatement la liste des matchs
                        if ((env as any).refreshJoinMatchList) {
                            // Appeler immédiatement puis attendre un peu pour un second rafraîchissement
                            (env as any).refreshJoinMatchList();
                            setTimeout(() => {
                                (env as any).refreshJoinMatchList();
                            }, 500);
                        } else {
                            console.warn("⚠️ refreshJoinMatchList n'est pas défini");
                        }
                    } else {
                        console.error("❌ Échec de la suppression du match");
                        deleteButton.background = "darkred";
                        deleteButton.isEnabled = true;
                        setTimeout(() => {
                            deleteButton.background = "red";
                        }, 2000);
                    }
                });

                deleteButton.onPointerEnterObservable.add(() => {
                    deleteButton.background = "darkred";
                });

                deleteButton.onPointerOutObservable.add(() => {
                    deleteButton.background = "red";
                });
            });
        } catch (error) {
            console.error("❌ Erreur lors du chargement des matchs:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("❌ Détails de l'erreur:", errorMessage);
            const errorText = new TextBlock();
            errorText.text = `Erreur de connexion: ${errorMessage.substring(0, 50)}`;
            errorText.color = "red";
            errorText.fontSize = UIData.text.fontSize;
            errorText.fontFamily = UIData.text.fontFamily;
            errorText.width = "500px";
            errorText.height = "50px";
            container.addControl(errorText);
        }
    };

    // Ne pas charger les matchs immédiatement, attendre que la page soit ajoutée à la grille
    // Stocker la fonction de rafraîchissement dans l'environnement pour pouvoir l'appeler depuis l'extérieur
    (env as any).refreshJoinMatchList = loadMatches;
    
    // Charger les matchs après un court délai pour s'assurer que la page est ajoutée à la grille
    // Vérifier que le container est correctement attaché en vérifiant s'il a un parent
    const tryLoadMatches = () => {
        // Vérifier que le container a un parent (signifie qu'il est attaché à la hiérarchie GUI)
        // Si parent est null, le contrôle n'est plus attaché
        if (container.parent) {
            try {
                loadMatches();
                
                // Rafraîchir la liste toutes les 2 secondes pour une meilleure réactivité
                const refreshInterval = setInterval(() => {
                    // Vérifier que le container a toujours un parent
                    // Si parent devient null, cela signifie que le contrôle a été supprimé
                    if (container.parent) {
                        try {
                            loadMatches();
                        } catch (error) {
                            console.error("❌ Erreur lors du rafraîchissement des matchs:", error);
                            // Arrêter l'intervalle en cas d'erreur
                            clearInterval(refreshInterval);
                        }
                    } else {
                        // Si le container n'est plus attaché (parent est null), arrêter l'intervalle
                        clearInterval(refreshInterval);
                    }
                }, 2000);
                
                // Stocker aussi l'intervalle pour pouvoir le nettoyer si nécessaire
                (env as any).refreshJoinMatchInterval = refreshInterval;
            } catch (error) {
                console.error("❌ Erreur lors du chargement initial des matchs:", error);
            }
        } else {
            // Réessayer après un court délai (maximum 10 tentatives pour éviter une boucle infinie)
            const maxRetries = 10;
            let retryCount = (env as any).__loadMatchesRetryCount || 0;
            if (retryCount < maxRetries) {
                (env as any).__loadMatchesRetryCount = retryCount + 1;
                setTimeout(tryLoadMatches, 50);
            } else {
                console.warn("⚠️ Impossible de charger les matchs après plusieurs tentatives");
            }
        }
    };
    
    // Réinitialiser le compteur de tentatives
    (env as any).__loadMatchesRetryCount = 0;
    
    // Démarrer la tentative de chargement après un court délai
    setTimeout(tryLoadMatches, 100);

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
            console.log("🚀 onCreateMatch appelé avec les règles:", rules);
            // mode: 0 = Local, 1 = En ligne
            const isOnline = settings.mode === 1;
            console.log("🌐 Mode du match:", isOnline ? "En ligne" : "Local");
            const success = await env.userX.createFriendlyMatch(rules, isOnline);
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
    env.menuContainer!.clearControls();

    if (env.userX.getTournament === undefined)
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
    rowButtons.addControl(buttonNavigation("Créer", env, settings, grid));
    rowButtons.addControl(buttonNavigation("Retour", env, settings, grid));
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
        // Utiliser le login de l'utilisateur connecté comme alias
        const userLogin = env.userX.getUser!.username || "Player";
        // Nettoyer un éventuel tournoi brouillon déjà créé côté serveur
        await env.userX.deleteTournament();
        await env.userX.createTournament(userLogin);
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