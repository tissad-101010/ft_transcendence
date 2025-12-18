import { Match } from "./Match.ts"
import { 
    MatchRules,
    MatchTournament,
} from "../types.ts";
import { shuffleArray } from "../utils.ts";

import { SceneManager } from '../scene/SceneManager.ts';
import { displayPlayers } from '../utils.ts';

export interface TournamentParticipant
{
    login: string;
    alias: string;
    ready: boolean;
    eliminate: boolean;
    id: number; // ID utilisateur
    // dbParticipantId?: number; // ID du participant dans tournament_participants (base de données)
}

export class Tournament
{
    private participants : TournamentParticipant[];
    private rules: MatchRules;
    private matchs: Match[];
    private sceneManager : SceneManager;
    private dbTournamentId: number | null = null; // ID du tournoi dans la base de données
    private status: number = 0; // 0: en cours de creation, 1: lance, 2: fini

    constructor(sceneManager : SceneManager)
    {
        this.participants = [];
        this.rules = {
            speed : "",
            score : "",
            timeBefore : ""
        }
        this.matchs = [];
        this.sceneManager = sceneManager;
    }

    playMatch(
        match: Match,
        id: number,
        sceneManager: SceneManager
    ) : boolean
    {
        return (match.play(id, sceneManager));
    }

    matchFinish(
        match: Match
    ) : boolean
    {
        if (!match.getSloatA || !match.getSloatB)
            return false;
        if (match.getStatus !== 2 || !match.getWinner)
        {
            console.error("Le match n'est pas termine ou n'a pas de vainqueur");
            return false;
        }

        // Sauvegarder les résultats dans la base de données si le tournoi est synchronisé
        // const matchInfo = match.getMatchInfo;
        // if (matchInfo && matchInfo.type === "tournament" && matchInfo.dbMatchId && matchInfo.dbTournamentId) {
        //     try {
        //         // Trouver l'ID du participant gagnant dans la base de données
        //         const winnerParticipant = this.participants.find((p) => p.id === match.getWinner?.id);
        //         if (!winnerParticipant) {
        //             console.error("Participant gagnant non trouvé");
        //             return false;
        //         }

        //         // Utiliser dbParticipantId si disponible, sinon id utilisateur
        //         const winnerParticipantId = winnerParticipant.dbParticipantId || winnerParticipant.id;

        //         // Appeler l'API pour sauvegarder les résultats
        //         const response = await fetch(`${API_URL}/api/tournament/${matchInfo.dbTournamentId}/match/${matchInfo.dbMatchId}/finish`, {
        //             method: "POST",
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 Accept: "application/json",
        //             },
        //             credentials: "include",
        //             body: JSON.stringify({
        //                 winnerId: winnerParticipantId,
        //                 score1: match.getScore[0],
        //                 score2: match.getScore[1],
        //             }),
        //         });

        //         if (!response.ok) {
        //             const errorData = await response.json();
        //             console.error("Erreur lors de la sauvegarde du match:", errorData);
        //         } else {
        //             console.log("Résultats du match sauvegardés dans la base de données");
        //         }
        //     } catch (error) {
        //         console.error("Erreur lors de l'appel API pour sauvegarder le match:", error);
        //     }
        // } else {
        //     console.log("Match non synchronisé avec la base de données, résultats non sauvegardés");
        // }

        const nextMatchId = (match.getMatchInfo as MatchTournament).nextMatchId;
        const nextMatch = this.matchs.find((m) => m.getId === nextMatchId);
        
        // Si pas de match suivant, le tournoi est terminé
        if (nextMatch === undefined)
        {
            console.log("Tournoi terminé !");
            displayPlayers(this.sceneManager.getScene(), this.participants, this.sceneManager.getTshirt);
            return true; // Tournoi terminé
        }
        
        if ((match.getMatchInfo as MatchTournament).nextMatchSlot === 0)
            nextMatch.setSloatA = match.getWinner;
        else
            nextMatch.setSloatB = match.getWinner;
        if (match.getSloatA.id === match.getWinner.id)
        {
            const other = this.participants.find((p) => p.id === match.getSloatB?.id);
            if (!other)
                return false;
            other.eliminate = true;
        }
        else
        {
            const other = this.participants.find((p) => p.id === match.getSloatA?.id);
            if (!other)
                return false;
            other.eliminate = true;
        }
        displayPlayers(this.sceneManager.getScene(), this.participants, this.sceneManager.getTshirt);
        return false; // Tournoi pas encore terminé
    }

    addRules(
        v: string,
        m: number
    ) : void
    {
        switch (m)
        {
            case 0: 
                this.rules.speed = v;
                break;
            case 1:
                this.rules.score = v;
                break;
            case 2:
                this.rules.timeBefore = v;
        }
    }

    addParticipant(
        p: TournamentParticipant
    ) : number
    {
        // Validation: le participant doit avoir un login
        if (!p.login || p.login.trim() === '') {
            console.error('Participant invalide: login manquant', p);
            return (1);
        }
        
        let stop = false;
        this.participants.forEach((a) => {
            if (a.login === p.login)
                stop = true;
        })
        if (stop)
            return (1);
        
        // S'assurer que eliminate est défini
        if (p.eliminate === undefined)
            p.eliminate = false;
        
        // En mode local, tous les participants sont prêts par défaut
        if (p.ready === undefined)
            p.ready = true;
            
        this.participants.push(p);
        return (0);
    }

    removeParticipant(
        p: TournamentParticipant
    ) : void
    {
        const index = this.participants.indexOf(p);
        if (index > -1)
            this.participants.splice(index, 1);
        else
            console.log(p.login + " n'est pas present dans ce tournoi");
    }

    checkReady() : number
    {
        if (this.rules.speed !== "1" && this.rules.speed !== "2" &&
            this.rules.speed !== "3")
            return (1);
        if (this.rules.score === "")
            return (2);
        if (this.rules.timeBefore === "")
            return (3);
        if (this.participants.length < 4)
            return (4);
        if (this.participants.length % 2 !== 0)
            return (5);
        if ((this.participants.length & (this.participants.length - 1)) !== 0)
            return (7);
        let unready = 0;
        this.participants.forEach((p) => {
            if (p.ready === false)
                unready++;
        })
        if (unready !== 0)
            return (6);
        return (0);
    }

    createMatchs(
        p : TournamentParticipant[]
    ) : void
    {
        const nbTour = Math.log(p.length) / Math.log(2); /* Nombre de tours du tournoi */
        let nbMatch = p.length / 2; // Nombre de mathc du tournoi
        let targetSlot = 0; // Position dans le match suivant
        let targetMatch : number | undefined = nbMatch; // Reference sur le match du prochain tour
        let indexP = 0;
        let indexM = 0;
        for (let i = 0; i < nbMatch; i++)
        {
            if (i % 2 === 0 && i !== 0)
                targetMatch += 1;
            const match = new Match(this.rules, "tournament", indexM, this.sceneManager);
            const settings : MatchTournament = {
                round: 1,
                sloatA: {
                    alias: p[indexP].alias,
                    id: p[indexP].id,
                    ready: true,
                    me: false
                },
                sloatB: {
                    alias: p[indexP + 1].alias,
                    id: p[indexP + 1].id,
                    ready: true,
                    me: false
                },
                nextMatchId: targetMatch,
                nextMatchSlot: targetSlot,
                tournament: this,
                type: "tournament"
            }
            indexP += 2;
            indexM++;
            if (targetSlot === 1)
                targetSlot = 0;
            else
                targetSlot = 1;
            match.setMatchInfo = settings;
            this.matchs.push(match);
        }
        for (let i = 2; i <= nbTour; i++)
        {
            let mem = indexM;
            nbMatch /= 2;
            targetSlot = 0;
            if (nbMatch === 1)
                targetMatch = undefined;
            for (let j = 0; j < nbMatch; j++)
            {
                if (targetMatch !== undefined && j % 2 === 0 && j !== mem)
                    targetMatch += 1;
                if (targetSlot === 1)
                    targetSlot = 0;
                else
                    targetSlot = 1;
                const match = new Match(this.rules, "tournament", indexM, this.sceneManager);
                const settings : MatchTournament = {
                    round: i,
                    sloatA: null,
                    sloatB: null,
                    nextMatchId: targetMatch,
                    nextMatchSlot: targetSlot,
                    tournament: this,
                    type: "tournament"
                }
                indexM++;
                match.setMatchInfo = settings;
                this.matchs.push(match);
            }
        }
    }

    async start() : Promise<void>
    {
        // Si le tournoi n'est pas encore créé dans la base de données, on crée d'abord les matchs localement
        // puis on les synchronise avec la BDD
        this.createMatchs(shuffleArray(this.participants));
        displayPlayers(this.sceneManager.getScene(), this.participants, this.sceneManager.getTshirt);
        this.status = 1;
        // Si le tournoi est synchronisé avec la BDD, créer les matchs dans la BDD
        // if (this.dbTournamentId !== null) {
        //     try {
        //         // Préparer les participants pour l'API (besoin des IDs des participants dans la BDD)
        //         const participantsForApi = this.participants.map(p => ({
        //             id: p.dbParticipantId || p.id, // Utiliser dbParticipantId si disponible, sinon id utilisateur
        //             ready: p.ready
        //         }));

        //         const response = await fetch(`${API_URL}/api/tournament/${this.dbTournamentId}/start`, {
        //             method: "POST",
        //             headers: {
        //                 Accept: "application/json"
        //             },
        //             credentials: "include"
        //         });

        //         if (response.ok) {
        //             const data = await response.json();
        //             console.log("Tournoi démarré dans la base de données, matchs créés:", data.matches);

        //             // Mapper les IDs des matchs de la BDD aux matchs locaux
        //             if (data.matches && Array.isArray(data.matches)) {
        //                 data.matches.forEach((dbMatch: any, index: number) => {
        //                     if (index < this.matchs.length) {
        //                         const localMatch = this.matchs[index];
        //                         const matchInfo = localMatch.getMatchInfo;
        //                         if (matchInfo && matchInfo.type === "tournament") {
        //                             matchInfo.dbMatchId = dbMatch.id;
        //                             matchInfo.dbTournamentId = this.dbTournamentId!;
        //                             localMatch.setMatchInfo = matchInfo;
        //                         }
        //                     }
        //                 });
        //             }
        //             this.status = 1;
        //         } else {
        //             const errorData = await response.json();
        //             console.error("Erreur lors du démarrage du tournoi:", errorData);
        //         }
        //     } catch (error) {
        //         console.error("Erreur lors de l'appel API pour démarrer le tournoi:", error);
        //     }
        // }
    }

    get getParticipants() : TournamentParticipant[]
    {
        return (this.participants);
    }

    get getRules() : MatchRules
    {
        return (this.rules);
    }

    get getMatchs() : Match[]
    {
        return (this.matchs);
    }

    get getStatus() : number
    {
        return (this.status);
    }

    get getDbTournamentId() : number | null
    {
        return (this.dbTournamentId);
    }

    set setDbTournamentId(id: number | null)
    {
        this.dbTournamentId = id;
    }
}