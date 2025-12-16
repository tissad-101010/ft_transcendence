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
import { Env, UIData } from '../utils.ts';
import { Tournament } from '../../pong/Tournament.ts';

import { Match, MatchParticipant } from "../../pong/Match.ts";
import { SceneManager } from "../../scene/SceneManager.ts";
import { ZoneName } from "../../config.ts";
import { ScoreboardHandler } from '../ScoreboardHandler.ts';

interface Interval
{
    id: number
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
       utils.panelRound.clearControls();

    const nbRound = Math.log(utils.tournament.getParticipants.length) / Math.log(2); // Nombre de tour du tournoi
    console.log("Nombre de round pour le tournoi -> ", nbRound);
    let nbMatch = utils.nbMatchFirstRound / Math.pow(2, utils.currRound);
    if (utils.currRound !== 0)
    {
        const buttonLeft = new Rectangle();
        buttonLeft.width = "50px";
        buttonLeft.height = "50px";
        buttonLeft.thickness = 1;
        buttonLeft.color = UIData.button.color;

        const textLeft = new TextBlock();
        textLeft.text = "<";
        textLeft.fontSize = UIData.text.fontSize;
        textLeft.fontFamily = UIData.text.fontFamily;
        textLeft.color = UIData.text.color;
        textLeft.width = "50px";
        textLeft.height = "50px";
        buttonLeft.addControl(textLeft);

        buttonLeft.onPointerClickObservable.add(() => {
            utils.currRound--;
            menuTournament(env, true, utils);
        });

        buttonLeft.onPointerEnterObservable.add(() => {
            buttonLeft.background = UIData.button.hoveredBackground;
        });
        buttonLeft.onPointerOutObservable.add(() => {
            buttonLeft.background = UIData.button.background;
        });
        utils.panelRound.addControl(buttonLeft);
    }

    const round = new TextBlock();
    round.text = "1/" + nbMatch;
    round.fontSize = UIData.text.fontSize;
    round.fontFamily = UIData.text.fontFamily;
    round.color = UIData.text.color;
    round.height = "100px";
    round.width = "100px";
    utils.panelRound.addControl(round);

    if (utils.currRound + 1 < nbRound)
    {
        const buttonRight = new Rectangle();
        buttonRight.width = "50px";
        buttonRight.height = "50px";
        buttonRight.thickness = 1;
        buttonRight.color = UIData.button.color;

        const textRight = new TextBlock();
        textRight.text = ">";
        textRight.fontSize = UIData.text.fontSize;
        textRight.fontFamily = UIData.text.fontFamily;
        textRight.color = UIData.text.color;
        textRight.width = "50px";
        textRight.height = "50px";
        buttonRight.addControl(textRight);

        buttonRight.onPointerClickObservable.add(() => {
            utils.currRound++;
            console.log(utils.currRound, nbRound);
            menuTournament(env, true, utils);
        });

        buttonRight.onPointerEnterObservable.add(() => {
            buttonRight.background = UIData.button.hoveredBackground;
        });

        buttonRight.onPointerOutObservable.add(() => {
            buttonRight.background = UIData.button.background;
        });
        utils.panelRound.addControl(buttonRight);
    }
}

function displayPlayer(
    c: StackPanel,
    p: MatchParticipant | null,
    env: Env
) : void
{
    console.log("player : ", p);
    const player = new TextBlock();
    if (p)
        player.text = p.alias;
    else
        player.text = "?";
        player.fontSize = UIData.text.fontSize;
        player.fontFamily = UIData.text.fontFamily;
        player.color = UIData.text.color;
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
       utils.scrollViewerMatch.clearControls();
    else
    {
        utils.scrollViewerMatch = new ScrollViewer("scrollViewerMatch");
        utils.scrollViewerMatch.width = "90%";
        utils.scrollViewerMatch.height = "400px";
        utils.scrollViewerMatch.background = "transparent";
        utils.scrollViewerMatch.barColor = UIData.text.color;
        utils.scrollViewerMatch.thickness = 0;
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
        matchRow.color = UIData.text.color;
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
            score.text = match.getScore[0].toString();
            score.color = "black";
            score.fontSize = UIData.text.fontSize;
            score.fontFamily = UIData.text.fontFamily;
            score.width = "50px";
            score.height = "70px";
            panelRow.addControl(score);
        }

        const vs = new TextBlock();
        vs.text = "VS";
        vs.fontSize = UIData.text.fontSize;
        vs.fontFamily = UIData.text.fontFamily;
        vs.color = "rgb(0,0,0)";
        vs.width = "50px";
        vs.height = "50px";
        panelRow.addControl(vs);

        if (match.getWinner)
        {
            const score = new TextBlock();
            score.text = match.getScore[1].toString();
            score.color = "black";
            score.fontSize = UIData.text.fontSize;
            score.fontFamily = UIData.text.fontFamily;
            score.width = "50px";
            score.height = "70px";
            panelRow.addControl(score);
        }
        displayPlayer(panelRow, match.getSloatB, env);

        // En mode local, on peut lancer tous les matchs où les deux participants sont prêts
        // Pas besoin de vérifier si l'utilisateur est dans le match en mode local
        const bothReady = (match.getSloatA && match.getSloatA.ready && match.getSloatB && match.getSloatB.ready);
        const canLaunch = match.getStatus === 0 && bothReady;
        
        if (canLaunch)
        {
            const start = new Rectangle();
            start.width = "100px";
            start.height = "50px";
            start.color = UIData.button.color;
            start.background = UIData.button.background;
            start.thickness = 1;
            panelRow.addControl(start);

            const textStart = new TextBlock();
            textStart.text = "Lancer";
            textStart.width = "100px";
            textStart.height = "50px";
            textStart.fontFamily = UIData.text.fontFamily;
            textStart.fontSize = UIData.text.fontSize;
            start.addControl(textStart);

            start.onPointerClickObservable.add(() => {
                waitingScreen(utils, env, match);
            });

            start.onPointerEnterObservable.add(() => {
                start.background = UIData.button.hoveredBackground;
            });

            start.onPointerOutObservable.add(() => {
                start.background = UIData.button.background;
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
    // Pour un tournoi local, on lance directement le match sans attendre
    // Vérifier si les deux participants sont prêts (mode local)
    const bothReady = (match.getSloatA && match.getSloatA.ready && match.getSloatB && match.getSloatB.ready);
    
    if (bothReady) {
        // Lancer directement le match en mode local
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
        return;
    }

    // Mode en ligne : attendre que l'adversaire soit prêt
    env.menuContainer?.clearControls();
    let panel = new StackPanel();
    panel.isVertical = true;
    panel.width = "100%";
    panel.spacing = 5;
    env.menuContainer?.addControl(panel);

    const info = new TextBlock();
    info.color = UIData.text.color;
    info.fontSize = UIData.text.fontSize + 10;
    info.paddingLeft = 100;
    info.fontFamily = UIData.text.fontFamily;
    info.width = "100%";
    info.height = "100px";
    info.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    env.menuContainer?.addControl(info);

    let i = 0;
    env.interval.id = setInterval(() => {
        if (i===5)
            i = 0;
        i++;
        if (match.getSloatA && match.getSloatA.id === env.userX.getUser?.id && match.getSloatB)
            info.text = "En attente de l'adversaire " + match.getSloatB.alias + " .".repeat(i);
        else if (match.getSloatB && match.getSloatB.id === env.userX.getUser?.id && match.getSloatA)
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
            clearInterval(env.interval.id);
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
            env.interval.id = -1;
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

    env.menuContainer?.clearControls();
    let panel = new StackPanel();
    panel.isVertical = true;
    panel.width = "100%";
    panel.spacing = 5;
    env.menuContainer?.addControl(panel);
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