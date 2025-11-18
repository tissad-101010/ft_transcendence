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
    scrollViewer.horizontalBarVisible = false;
    page.addControl(scrollViewer);

    const container = new StackPanel();
    container.width = "100%";
    container.isVertical = true;
    container.spacing = 20;
    scrollViewer.addControl(container);

    /*
        tableau utile pour simuler une liste de matchs crees par d'autres utilisateurs
        id -> id du match
        speed/time/score -> Regle defini pour le match
    */
    const matchs = [
        {idMatch: 0, idUser: 1, login: "Lolo", speed: "2", time: "4", score: "5"},
        {idMatch: 1, idUser: 1, login: "Lolo", speed: "2", time: "4", score: "5"},
        {idMatch: 2, idUser: 1, login: "Lolo", speed: "2", time: "4", score: "5"},
        {idMatch: 3, idUser: 1, login: "Lolo", speed: "2", time: "4", score: "5"},
        {idMatch: 4, idUser: 1, login: "Lolo", speed: "2", time: "4", score: "5"},
        {idMatch: 5, idUser: 1, login: "Lolo", speed: "2", time: "4", score: "5"},
        {idMatch: 6, idUser: 1, login: "Lolo", speed: "2", time: "4", score: "5"},
        {idMatch: 7, idUser: 1, login: "Lolo", speed: "2", time: "4", score: "5"},
        {idMatch: 8, idUser: 1, login: "Lolo", speed: "2", time: "4", score: "5"},
        {idMatch: 9, idUser: 1, login: "Lolo", speed: "2", time: "4", score: "5"},
        {idMatch: 10, idUser: 1, login: "Lolo", speed: "2", time: "4", score: "5"},
        {idMatch: 11, idUser: 1, login: "Lolo", speed: "2", time: "4", score: "5"},
        {idMatch: 12, idUser: 1, login: "Lolo", speed: "2", time: "4", score: "5"}
    ];

    const rect = new Rectangle();
    rect.width = "500px";
    rect.height = "50px";
    rect.background = "white";
    rect.thickness = 5;
    rect.color = "black";
    container.addControl(rect);

    const panel = new StackPanel();
    panel.isVertical = false;
    panel.width = "500px";
    panel.height = "100px";
    rect.addControl(panel);

    const login = new TextBlock();
    login.text = "Login";
    login.fontSize = env.UIData.text.fontSize;
    login.fontFamily = env.UIData.text.fontFamily;
    login.width = "100px";
    login.height = "100px";
    login.color = "black";
    panel.addControl(login);

    const speed = new TextBlock();
    speed.text = "Vitesse";
    speed.fontSize = env.UIData.text.fontSize;
    speed.fontFamily = env.UIData.text.fontFamily;
    speed.width = "100px";
    speed.height = "100px";
    speed.color = "black";
    panel.addControl(speed);

    const time = new TextBlock();
    time.text = "Delai";
    time.fontSize = env.UIData.text.fontSize;
    time.fontFamily = env.UIData.text.fontFamily;
    time.width = "100px";
    time.height = "100px";
    time.color = "black";
    panel.addControl(time);

    const score = new TextBlock();
    score.text = "Score";
    score.fontSize = env.UIData.text.fontSize;
    score.fontFamily = env.UIData.text.fontFamily;
    score.width = "100px";
    score.height = "100px";
    score.color = "black";
    panel.addControl(score);
    container.addControl(rect);

    matchs.forEach((m) => {
        const rect = new Rectangle();
        rect.width = "500px";
        rect.height = "100px";
        rect.background = "white";
        rect.thickness = 3;
        rect.color = "black";
        container.addControl(rect);

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
        button.width = "50px";
        button.thickness = env.UIData.button.thickness;
        button.color = env.UIData.text.color;
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
            if (!env.userX.joinFriendlyMatch(rules, m.idMatch, m.idUser, m.login, env))
                button.background = "red";
            else
                env.scoreboard.leaveMenu();
        });
    });

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
        mode: -1
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