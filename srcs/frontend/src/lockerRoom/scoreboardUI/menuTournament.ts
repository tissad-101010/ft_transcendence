import {
  Scene,
} from '@babylonjs/core';

import { 
  StackPanel, 
  Rectangle, 
  TextBlock,
  Control,
  ScrollViewer
} from "@babylonjs/gui";

import { UserX } from '../../UserX.ts';
import { UIData } from '../utils.ts';
import { Tournament, TournamentParticipant } from '../../Tournament.ts';

import { myClearControls } from "../../utils.ts";
import { Match } from "../../Match.ts";
import { SceneManager } from "../../scene/SceneManager.ts";
import { ZoneName } from "../../config.ts";
import { ScoreboardHandler } from '../ScoreboardHandler.ts';

interface Interval
{
    id: number
}

interface Env
{
    menuContainer: Rectangle | null,
    userX: UserX,
    UIData: UIData,
    sceneManager: SceneManager,
    waitingInterval: Interval,
    scoreboard: ScoreboardHandler
}

interface DataUtils
{
    panelRound: StackPanel | null,
    scrollViewerMatch: ScrollViewer | null,
    nbMatchFirstRound: number,
    currRound: number,
    tournament: Tournament
}

function rowRound(
    container: StackPanel,
    utils: DataUtils,
    env: Env
) : void
{
    if (utils.tournament === null)
    {
        console.error("tournament est null (très très bizarre de déclencher ceci");
        return ;
    }
    if (utils.panelRound === null)
    {
        utils.panelRound = new StackPanel();
        utils.panelRound.isVertical = false;
        utils.panelRound.height = "100px";
        utils.panelRound.spacing = 5;
        container.addControl(utils.panelRound);
    } else
       myClearControls(utils.panelRound);

    const nbRound = Math.log(utils.tournament.getParticipants.length) / Math.log(2); // Nombre de tour du tournoi
    console.log("Nombre de round pour le tournoi -> ", nbRound);
    let nbMatch = utils.nbMatchFirstRound / Math.pow(2, utils.currRound);
    if (utils.currRound !== 0)
    {
        const buttonLeft = new Rectangle();
        buttonLeft.width = "50px";
        buttonLeft.height = "50px";
        buttonLeft.thickness = 1;
        buttonLeft.color = env.UIData.button.color;

        const textLeft = new TextBlock();
        textLeft.text = "<";
        textLeft.fontSize = env.UIData.text.fontSize;
        textLeft.fontFamily = env.UIData.text.fontFamily;
        textLeft.color = env.UIData.text.color;
        textLeft.width = "50px";
        textLeft.height = "50px";
        buttonLeft.addControl(textLeft);

        buttonLeft.onPointerClickObservable.add(() => {
            utils.currRound--;
            menuTournament(env, true, utils);
        });

        buttonLeft.onPointerEnterObservable.add(() => {
            buttonLeft.background = env.UIData.button.hoveredBackground;
        });
        buttonLeft.onPointerOutObservable.add(() => {
            buttonLeft.background = env.UIData.button.background;
        });
        utils.panelRound.addControl(buttonLeft);
    }

    const round = new TextBlock();
    round.text = "1/" + nbMatch;
    round.fontSize = env.UIData.text.fontSize;
    round.fontFamily = env.UIData.text.fontFamily;
    round.color = env.UIData.text.color;
    round.height = "100px";
    round.width = "100px";
    utils.panelRound.addControl(round);

    if (utils.currRound + 1 < nbRound)
    {
        const buttonRight = new Rectangle();
        buttonRight.width = "50px";
        buttonRight.height = "50px";
        buttonRight.thickness = 1;
        buttonRight.color = env.UIData.button.color;

        const textRight = new TextBlock();
        textRight.text = ">";
        textRight.fontSize = env.UIData.text.fontSize;
        textRight.fontFamily = env.UIData.text.fontFamily;
        textRight.color = env.UIData.text.color;
        textRight.width = "50px";
        textRight.height = "50px";
        buttonRight.addControl(textRight);

        buttonRight.onPointerClickObservable.add(() => {
            utils.currRound++;
            console.log(utils.currRound, nbRound);
            menuTournament(env, true, utils);
        });

        buttonRight.onPointerEnterObservable.add(() => {
            buttonRight.background = env.UIData.button.hoveredBackground;
        });

        buttonRight.onPointerOutObservable.add(() => {
            buttonRight.background = env.UIData.button.background;
        });
        utils.panelRound.addControl(buttonRight);
    }
}

function displayPlayer(
    c: StackPanel,
    p: TournamentParticipant | null,
    env: Env
) : void
{
    const player = new TextBlock();
    if (p)
        player.text = p.alias;
    else
        player.text = "?";
        player.fontSize = env.UIData.text.fontSize;
        player.fontFamily = env.UIData.text.fontFamily;
        player.color = env.UIData.text.color;
        player.width = "200px";
        player.height = "70px";
        c.addControl(player);
}

function listMatch(
    container: StackPanel,
    utils: DataUtils,
    env: Env
) : void
{
    if (utils.scrollViewerMatch !== null)
       myClearControls(utils.scrollViewerMatch);
    else
    {
        utils.scrollViewerMatch = new ScrollViewer("scrollViewerMatch");
        utils.scrollViewerMatch.width = "90%";
        utils.scrollViewerMatch.height = "400px";
        utils.scrollViewerMatch.background = "transparent";
        utils.scrollViewerMatch.barColor = env.UIData.text.color;
        utils.scrollViewerMatch.thickness = 0;
        utils.scrollViewerMatch.horizontalBarVisible = false;
        container.addControl(utils.scrollViewerMatch);
    }

    const panelMatch = new StackPanel();
    panelMatch.width = "100%";
    panelMatch.isVertical = true;
    panelMatch.spacing = 5;
    utils.scrollViewerMatch.addControl(panelMatch);

    let nbMatch = utils.nbMatchFirstRound / Math.pow(2, utils.currRound);
    let idStart = 0
    for (let i = 0; i < utils.currRound; i++)
        idStart += utils.nbMatchFirstRound / Math.pow(2, i);

    for (let i = idStart; i < idStart + nbMatch; i++)
    {
        const matchRow = new Rectangle();
        matchRow.height = "70px";
        matchRow.width = "70%";
        matchRow.thickness = 1;
        matchRow.color = env.UIData.text.color;
        panelMatch.addControl(matchRow);

        const panelRow = new StackPanel();
        panelRow.isVertical = false;
        panelRow.height = "100%";
        matchRow.addControl(panelRow);

        const match : Match = utils.tournament.getMatchs[i];
        displayPlayer(panelRow, match.getSloatA, env);

        if (match.getWinner)
        {
            const score = new TextBlock();
            score.text = match.getScore[0];
            score.color = "black";
            score.fontSize = env.UIData.text.fontSize;
            score.fontFamily = env.UIData.text.fontFamily;
            score.width = "50px";
            score.height = "70px";
            panelRow.addControl(score);
        }

        const vs = new TextBlock();
        vs.text = "VS";
        vs.fontSize = env.UIData.text.fontSize;
        vs.fontFamily = env.UIData.text.fontFamily;
        vs.color = "rgb(0,0,0)";
        vs.width = "50px";
        vs.height = "50px";
        panelRow.addControl(vs);

        if (match.getWinner)
        {
            const score = new TextBlock();
            score.text = match.getScore[1];
            score.color = "black";
            score.fontSize = env.UIData.text.fontSize;
            score.fontFamily = env.UIData.text.fontFamily;
            score.width = "50px";
            score.height = "70px";
            panelRow.addControl(score);
        }
        displayPlayer(panelRow, match.getSloatB, env);

        // Match de l'utilisateur en attente
        if (((match.getSloatA && match.getSloatA.id === env.userX.getUser.id ||
                match.getSloatB && match.getSloatB.id === env.userX.getUser.id)
                && match.getStatus === 0))
        {
            const start = new Rectangle();
            start.width = "100px";
            start.height = "50px";
            start.color = env.UIData.button.color;
            start.background = env.UIData.button.background;
            start.thickness = 1;
            panelRow.addControl(start);

            const textStart = new TextBlock();
            textStart.text = "Lancer";
            textStart.width = "100px";
            textStart.height = "50px";
            textStart.fontFamily = env.UIData.text.fontFamily;
            textStart.fontSize = env.UIData.text.fontSize;
            start.addControl(textStart);

            start.onPointerClickObservable.add(() => {
                waitingScreen(utils, env, match);
            });

            start.onPointerEnterObservable.add(() => {
                start.background = env.UIData.button.hoveredBackground;
            });

            start.onPointerOutObservable.add(() => {
                start.background = env.UIData.button.background;
            });
        }
    }
}

function waitingScreen(
    utils : DataUtils,
    env: Env,
    match: Match
) : void
{
    myClearControls(env.menuContainer);
    let panel = new StackPanel();
    panel.isVertical = true;
    panel.width = "100%";
    panel.spacing = 5;
    env.menuContainer.addControl(panel);

    const info = new TextBlock();
    info.color = env.UIData.text.color;
    info.fontSize = env.UIData.text.fontSize + 10;
    info.paddingLeft = 100;
    info.fontFamily = env.UIData.text.fontFamily;
    info.width = "100%";
    info.height = "100px";
    info.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    env.menuContainer.addControl(info);

    let i = 0;
    env.waitingInterval.id = setInterval(() => {
        if (i===5)
            i = 0;
        i++;
        if (match.getSloatA && match.getSloatA.id === env.userX.getUser.id && match.getSloatB)
            info.text = "En attente de l'adversaire " + match.getSloatB.alias + " .".repeat(i);
        else if (match.getSloatB && match.getSloatB.id === env.userX.getUser.id && match.getSloatA)
            info.text = "En attente de l'adversaire " + match.getSloatA.alias + " .".repeat(i);
        else
        {
            console.error("Bizarre bizarre");
            info.text = "Oupsi quelque chose ne va pas :(";
            return ;
        }

        if ((match.getSloatA && match.getSloatA.id === env.userX.getUser.id
            && match.getSloatB && match.getSloatB.ready)
            ||  ((match.getSloatB && match.getSloatB.id === env.userX.getUser.id
            && match.getSloatA && match.getSloatA.ready))
        )
        {
            clearInterval(env.waitingInterval.id);
            env.menuContainer.dispose();
            if (!env.userX.playTournamentMatch(utils.tournament, match, env.sceneManager))
                console.error("Impossible de lancer le match");
            else
            {
                env.sceneManager.getSceneInteractor?.disableInteractions();
                env.scoreboard.setClic = false;
                env.sceneManager.moveCameraTo(ZoneName.FIELD, () => {
                    env.sceneManager.setSpecificMesh(false);
                    env.sceneManager.getSceneInteractor?.enableInteractionScene();
                });
            }
            env.waitingInterval.id = -1;
        }
    }, 1000);
}

export function menuTournament(
    env: Env,
    refresh: boolean,
    utils: DataUtils | undefined
) : void
{
    if (env.userX.getTournament === null)
        return ;

    myClearControls(env.menuContainer);
    let panel = new StackPanel();
    panel.isVertical = true;
    panel.width = "100%";
    panel.spacing = 5;
    env.menuContainer.addControl(panel);
    if (!refresh && utils === undefined)
    {
        utils = {
            tournament: env.userX.getTournament,
            panelRound: null,
            scrollViewerMatch: null,
            nbMatchFirstRound: env.userX.getTournament.getParticipants.length / 2,
            currRound: 0
        }
    }
    else if (utils !== undefined)
    {
        utils.scrollViewerMatch = null;
        utils.panelRound = null;
    }
    if (utils === undefined)
    {
        console.error("utils est undefined dans menuTournament()");
        return ;
    }
    rowRound(panel, utils, env);
    listMatch(panel, utils, env);
};