import { AbstractMesh} from '@babylonjs/core';

import 
{
  Rectangle,
  TextBlock,
  AdvancedDynamicTexture,
  Grid
} from "@babylonjs/gui";

import { UserX } from "../../UserX.ts";
import { UIData } from "../utils.ts";
import { Tournament } from "../../Tournament.ts";
import { DataMatchBlock, genRulesMatchBlock } from './genRulesMatch.ts';
import { genInvitationPage } from './genInvitationPage.ts';
import { ScoreboardHandler } from '../ScoreboardHandler.ts';
import { genJoinMatch } from './menuCreate.ts';

import { Env } from './menuCreate.ts';

function swapPage(
    label: string,
    env: Env,
    settings: DataMatchBlock
) : boolean
{
    if (settings.currPage !== label)
    {
        if (env.page !== null)
            env.page.dispose();
        settings.currPage = label;
        return (true);
    }
    return (false);
}

export function createButton(
    env: Env,
    grid: Grid    
) : void
{
    const value = env.tournament.checkReady();
    if (value !== 0)
    {
        if (env.errorMsg !== null)
        {
            grid.removeControl(env.errorMsg);
            env.errorMsg.dispose();
            env.errorMsg = null;
        }
        env.errorMsg = new TextBlock();
        env.errorMsg.color = "red";
        env.errorMsg.width = "100%";
        env.errorMsg.height = "40px";
        env.errorMsg.fontSize = env.UIData.text.fontSize;
        env.errorMsg.fontFamily = env.UIData.text.fontFamily;
        grid.addControl(env.errorMsg, 1, 0);
        switch(value)
        {
            case 1 :
                env.errorMsg.text = "Vitesse non renseignee";
                break;
            case 2 :
                env.errorMsg.text = "Score non renseigne";
                break;
            case 3 :
                env.errorMsg.text = "Temps avant engagement non renseigne";
                break;
            case 4 :
                env.errorMsg.text = "Pas suffisament de participants (4 minimum)";
                break;
            case 5 :
                env.errorMsg.text = "Le nombre de participants doit etre pair";
                break;
            case 6 :
                env.errorMsg.text = "Des participants ne sont pas pret";
                break;
            case 7 :
                env.errorMsg.text = "Le nombre de participants doit etre une puissance de 2 (4, 8, 16, ...)";
        }
    }
    else
    {
        env.tournament.start().then(() => {
            env.control.selectMenu(env.meshScoreboard);
        }).catch((error) => {
            console.error("Erreur lors du démarrage du tournoi:", error);
            env.control.selectMenu(env.meshScoreboard);
        });
    }
}

export function invitationButton(
    label: string,
    env: Env,
    settings: DataMatchBlock,
    grid: Grid
) : void
{
    if (swapPage(label, env, settings) === true)
    {
        env.page = genInvitationPage(env.UIData, env.userX);
        grid.addControl(env.page, 0, 0);
    }
    else
        console.error("Error lors du changement de page pour " + label);
}

export function joinButton(
    label: string,
    env: Env,
    grid: Grid
) : void
{
    if (swapPage(label, env, grid) === true)
    {
        env.page = genJoinMatch(env);
        grid.addControl(env.page, 0, 0);
    }
    else
        console.error("Error lors du changement de page pour " + label);
}

export function newButton(
    label: string,
    env: Env,
    settings: DataMatchBlock,
    grid: Grid
) : void
{
    if (swapPage(label, env, grid) === true)
    {
        env.page = genRulesMatchBlock(settings, true);
        grid.addControl(env.page, 0, 0);
    }   
    else
        console.error("Error lors du changement de page pour " + label);
}


export function rulesButton(
    label: string,
    env: Env,
    settings: DataMatchBlock,
    grid: Grid
) : void
{
    if (swapPage(label, env, settings) === true)
    {
        env.page = genRulesMatchBlock(settings, false);
        grid.addControl(env.page, 0, 0);
    }
    else
        console.error("Error lors du changement de page pour " + label);
}

export function startButton(
    env: Env,
    setting: DataMatchBlock
) : void
{
    // Vérifier que l'utilisateur est défini
    const user = (env.userX as any).getUser;
    if (!user) {
        console.error("❌ Impossible de créer un match: utilisateur non défini dans UserX");
        alert("Erreur: Vous devez être connecté pour créer un match amical");
        return;
    }
    
    console.log("🔄 Création d'un match amical avec l'utilisateur:", user);
    
    const rules = {
        speed: setting.data.speed,
        timeBefore: setting.data.timeBefore,
        score: setting.data.score
    }
    
    console.log("📋 Règles du match:", rules);
    
    console.log("🚀 Appel de createFriendlyMatch avec les règles:", rules);
    
    env.userX.createFriendlyMatch(rules).then((success) => {
        console.log("📥 Réponse de createFriendlyMatch:", success);
        if (success) {
            console.log("✅ Match amical créé avec succès");
            // Rafraîchir la liste des matchs si on est sur la page "Rejoindre"
            if ((env as any).refreshJoinMatchList) {
                console.log("🔄 Rafraîchissement de la liste des matchs...");
                // Augmenter le délai pour s'assurer que le match est bien enregistré
                setTimeout(() => {
                    console.log("🔄 Exécution du rafraîchissement de la liste...");
                    (env as any).refreshJoinMatchList();
                }, 1000); // Augmenter à 1 seconde pour être sûr
            } else {
                console.warn("⚠️ refreshJoinMatchList n'est pas défini");
            }
        } else {
            console.error("❌ Échec de la création du match amical (success = false)");
            alert("Erreur lors de la création du match amical. Vérifiez la console pour plus de détails.");
        }
    }).catch((error) => {
        console.error("❌ Erreur lors de la création du match amical:", error);
        alert("Erreur lors de la création du match amical: " + (error.message || String(error)));
    });
}

export function backButton(
    env: Env, fn: (e: Env) => void
) : void
{
    if (env.page !== null)
        env.page.dispose();
    env.page = null;
    fn(env);
}