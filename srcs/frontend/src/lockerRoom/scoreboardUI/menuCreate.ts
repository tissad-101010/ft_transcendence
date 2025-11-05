import { AbstractMesh, Scene} from '@babylonjs/core';
import { 
  AdvancedDynamicTexture, 
  StackPanel, 
  Rectangle, 
  Button,
  TextBlock,
  Control,
  Grid 
} from "@babylonjs/gui";

import { UserX } from '../../UserX.ts';

import { UIData } from '../utils.ts';

import { DataMatchBlock, genRulesMatchBlock } from './genRulesMatch.ts';
import { Tournament } from '../../Tournament.ts';
import { backButton, createButton, invitationButton, rulesButton } from './navigationButton.ts';

import { myClearControls } from "../../utils.ts";
import { ScoreboardHandler } from '../ScoreboardHandler.ts';


interface Env
{
    page: Rectangle | null,
    menuContainer: Rectangle | null,
    advancedTexture: AdvancedDynamicTexture | null,
    meshScoreboard: AbstractMesh,
    userX: UserX,
    UIData: UIData,
    tournament: Tournament,
    errorMsg: TextBlock | null,
    control: ScoreboardHandler
}

function buttonNavigation(
    label: string,
    env: Env,
    settings: DataMatchBlock,
    grid: Grid,
) : Rectangle
{
    const button = new Rectangle();
    button.height = "80px";
    button.width = "140px";
    button.thickness = env.UIData.button.thickness;
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

function match(env: Env)
{
    myClearControls(env.menuContainer)

    const grid = new Grid();
    grid.width = "100%";
    grid.height = "60%";
    grid.addColumnDefinition(1);
    grid.addRowDefinition(0.7);
    grid.addRowDefinition(0.3);
    env.menuContainer.addControl(grid);

    const settings : DataMatchBlock = {
        data: {
            speed: "-1",
            score: "-1",
            timeBefore: "-1",
        },
        graph: {
            container: {
                width: "100%",
                height: "100%",
                thickness: 1,
                color: "blue", 
            },
            text : env.UIData.text,
            button: env.UIData.button,
            inputText: env.UIData.inputText
        },
        controlButtons: [],
        currPage: "Match",
        mode: -1,
        login: ""
    }

    env.page = genRulesMatchBlock(settings, true);
    grid.addControl(env.page, 0, 0);

    const rowButtons = new StackPanel();
    rowButtons.isVertical = false;
    rowButtons.height = "100%";
    rowButtons.spacing = 10;
    grid.addControl(rowButtons, 1, 0);

    rowButtons.addControl(buttonNavigation("Lancer", env, settings, grid));
    rowButtons.addControl(buttonNavigation("Retour", env, settings, grid));
}

function tournament(env: Env)
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
        login: ""
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

export function menuCreate(env: Env)
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

    button1.onPointerUpObservable.add(() => {
        env.userX.createTournament("nostag");
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