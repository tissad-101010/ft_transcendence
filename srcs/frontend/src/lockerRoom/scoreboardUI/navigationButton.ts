import 
{
  TextBlock,
  Grid
} from "@babylonjs/gui";

import { UIData } from "../utils.ts";
import { DataMatchBlock, genRulesMatchBlock } from './genRulesMatch.ts';
import { genInvitationPage } from './genInvitationPage.ts';
import { genJoinMatch } from './menuCreate.ts';

import { Env } from '../utils.ts';

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
    const value = env.userX.getTournament?.checkReady();
    if (value === undefined)
        return ;
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
        env.errorMsg.fontSize = UIData.text.fontSize;
        env.errorMsg.fontFamily = UIData.text.fontFamily;
        grid.addControl(env.errorMsg, 1, 0);
        switch(value)
        {
            case 1 :
                env.errorMsg.text = "Missing speed";
                break;
            case 2 :
                env.errorMsg.text = "Missing score";
                break;
            case 3 :
                env.errorMsg.text = "Missing time before engagement";
                break;
            case 4 :
                env.errorMsg.text = "Not enough participant (4 min)";
                break;
            case 5 :
                env.errorMsg.text = "Number of participants must be odd";
                break;
            case 7 :
                env.errorMsg.text = "Number must be power of 2 (4, 8, 16, ...)";
                break;
        }
    }
    else
    {
        env.userX.getTournament!.start().then(() => {
            env.scoreboard.selectMenu(env.meshScoreboard);
        }).catch((error) => {
            env.scoreboard.selectMenu(env.meshScoreboard);
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
        env.page = genInvitationPage(env.userX);
        grid.addControl(env.page, 0, 0);
    }
    else
        console.error("Error lors du changement de page pour " + label);
}

export function joinButton(
    label: string,
    env: Env,
    settings: DataMatchBlock,
    grid: Grid
) : void
{
    if (swapPage(label, env, settings) === true)
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
    if (swapPage(label, env, settings) === true)
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
        return;
    }
    
    console.log("🔄 Création d'un match amical avec l'utilisateur:", user);
    
    const rules = {
        speed: setting.data.speed,
        timeBefore: setting.data.timeBefore,
        score: setting.data.score
    }
    
    env.userX.createFriendlyMatch(rules).then((success) => {
        console.log("📥 Réponse de createFriendlyMatch:", success);
        if (success) {
            // Rafraîchir la liste des matchs si on est sur la page "Rejoindre"
            if ((env as any).refreshJoinMatchList) {
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
            alert("Error");
        }
    }).catch((error) => {
        console.error("❌ Erreur lors de la création du match amical:", error);
        alert("Error " + (error.message || String(error)));
    });
}

export async function backButton(
    env: Env, fn: (e: Env) => void
) : Promise<void>
{
    if (env.page !== null)
        env.page.dispose();
    env.page = null;
    fn(env);
}