
import { MatchParticipant } from "../Match.ts";
import { MatchBase, MatchStatus } from "./MatchBase.ts";

import Game3D from "../gameplay/Game3D.ts";
import GameLogic from "../gameplay/GameLogic.ts";
import { API_URL } from "../../utils.ts";
/*
    Classe pour gerer un match amical en ligne (remote players)
    
    Etapes de fonctionnement :
     1. 
     2. Mettre en place l'environnement 3D (Lumieres, Mesh player, deplacement camera)
     3. Lancer le fonctionnement remote players
     4. S'assurer que les deux utilisateurs soient bien sur le terrain + env 3D bien construit
     5. Le match continue jusqu'a detection d'un vainqueur
     6. Enregistrer dans la BDD le resultat du match
     7. Detruire l'env 3D + eteindre lumiere + detruire ce qui permet le remote player
*/

export class MatchFriendlyOnline extends MatchBase
{
    private isOnline: boolean = false;
    private websocket: WebSocket | null = null;
    private myUserId: number | null = null;        // ID utilisateur réel (du système d'auth)
    private remoteUserId: number | null = null;    // ID utilisateur réel de l'adversaire
    private myPlayerTeam: number | null = null;    // Team de mon joueur (1 = gauche/score gauche, 2 = droite/score droit)
    private playersConnected: Set<number> = new Set();
    private matchStarted: boolean = false;
    private isFirstConnector: boolean | null = null; // true si ce navigateur est le premier à se connecter au match
    private dbIdToGameId: Map<number, number> = new Map(); // mapping DB user id -> game-local id (1/2)
    private myGamePlayerId: number | null = null;  // 1 or 2 - position dans le jeu (gauche/droite)
    private lastScoreSnapshot = { score1: 0, score2: 0 };

    init(players: MatchParticipant[], isOnline: boolean = false): boolean
    {
        console.log("🎮 MatchFriendlyOnline.init() appelé avec:", { players, isOnline, currentUser: this.currentUser });
        if (players.length !== 2)
            return (false);
        this.participants = players;
        this.isOnline = isOnline;
        
        // Réinitialiser les états pour éviter les problèmes lors des parties suivantes
        this.playersConnected.clear();
        this.dbIdToGameId.clear();
        this.matchStarted = false;
        this.isFirstConnector = null;
        this.myGamePlayerId = null;

        // IMPORTANT: Utiliser l'ID de l'utilisateur authentifié (currentUser) plutôt que celui des participants
        // L'ID du participant peut être celui de la DB du service game, pas l'ID auth
        if (this.currentUser && this.currentUser.id > 0) {
            this.myUserId = this.currentUser.id;
            console.log("✅ myUserId défini depuis currentUser (système d'auth):", this.myUserId);
        } else {
            // Fallback: utiliser l'ID du participant marqué comme "me"
            const me = players.find(p => p.me);
            this.myUserId = me?.id || null;
            console.warn("⚠️ currentUser non disponible, fallback sur participant.id:", this.myUserId);
        }

        // Déterminer quel joueur est moi et quel est l'adversaire
        console.log("🔍 Analyse des participants reçus:", players.map((p, idx) => ({ 
            index: idx, 
            id: p.id, 
            alias: p.alias, 
            me: p.me,
            ready: p.ready
        })));
        
        const me = players.find(p => p.me);
        const opponent = players.find(p => !p.me);
        
        if (!me) {
            console.error("❌ ERREUR: Aucun joueur avec me=true trouvé dans:", players);
            return false;
        }
        
        // Définir remoteUserId à partir de l'adversaire
        this.remoteUserId = opponent?.id || null;
            
        // Déterminer la team de mon joueur basée sur sa position dans le tableau participants
        // p[0] = team 1 (gauche, score gauche), p[1] = team 2 (droite, score droit)
        const meIndex = players.indexOf(me);
        this.myPlayerTeam = meIndex === 0 ? 1 : 2;
        
        console.log("✅ Joueur 'me' trouvé:", { 
            id: me.id, 
            alias: me.alias, 
            me: me.me, 
            indexInArray: meIndex,
            team: this.myPlayerTeam,
            position: this.myPlayerTeam === 1 ? "gauche (score gauche)" : "droite (score droit)",
            myUserId: this.myUserId
        });
        
        if (opponent) {
            const opponentIndex = players.indexOf(opponent);
            const opponentTeam = opponentIndex === 0 ? 1 : 2;
            console.log("✅ Joueur 'opponent' trouvé:", { 
                id: opponent.id, 
                alias: opponent.alias, 
                me: opponent.me, 
                indexInArray: opponentIndex,
                team: opponentTeam,
                position: opponentTeam === 1 ? "gauche (score gauche)" : "droite (score droit)"
            });
        }
        
        console.log("👤 Joueurs identifiés:", { 
            myUserId: this.myUserId, 
            remoteUserId: this.remoteUserId,
            myPlayerTeam: this.myPlayerTeam,
            areDifferent: this.myUserId !== this.remoteUserId,
            isOnline,
            participants: players.map((p, idx) => ({ 
                index: idx, 
                id: p.id, 
                alias: p.alias, 
                me: p.me,
                team: idx === 0 ? 1 : 2,
                position: idx === 0 ? "gauche (score gauche)" : "droite (score droit)"
            }))
        });

        // Mode 0 = local (même clavier), Mode 1 = remote (websockets)
        const gameMode = isOnline ? 1 : 0;

        // Build a game-local participants array (ids 1 = left, 2 = right) for GameLogic
        // while preserving original DB ids in this.participants for websocket join.
        const gameParticipants = this.participants.map((p, idx) => {
            const gameId = idx === 0 ? 1 : 2;
            // register mapping from participant DB id -> game position id
            if (p.id !== null && p.id !== undefined) {
                this.dbIdToGameId.set(p.id, gameId);
            }
            return {
                alias: p.alias,
                id: gameId,
                ready: p.ready,
                me: p.me,
            } as any as import('../Match.ts').MatchParticipant;
        });

        // Déterminer myGamePlayerId basé sur la position du joueur "me" dans le tableau
        // C'est plus fiable que de chercher par ID car les IDs peuvent différer
        const myParticipantIndex = this.participants.findIndex(p => p.me);
        if (myParticipantIndex !== -1) {
            this.myGamePlayerId = myParticipantIndex === 0 ? 1 : 2;
            console.log("✅ myGamePlayerId déterminé depuis la position 'me':", {
                myGamePlayerId: this.myGamePlayerId,
                myParticipantIndex,
                myUserId: this.myUserId
            });
        } else if (this.myPlayerTeam) {
            // fallback: infer from team
            this.myGamePlayerId = this.myPlayerTeam === 1 ? 1 : 2;
            console.log("⚠️ myGamePlayerId déterminé depuis myPlayerTeam (fallback):", this.myGamePlayerId);
        }
        
        console.log("📊 Mapping dbIdToGameId:", Array.from(this.dbIdToGameId.entries()));

        this.game = {
            logic: new GameLogic(
                {
                    scoreMax: parseInt(this.rules.score),
                    ballSpeed: 0.3 * parseInt(this.rules.speed),
                    playerSpeed: 1.25 * parseInt(this.rules.speed),
                    countDownGoalTime: parseInt(this.rules.timeBefore),
                    allowPause: false
                },
                [gameParticipants[0], gameParticipants[1]],
                gameMode
            ),
            interface: new Game3D(this.sceneManager)
        };
        if (!this.game.interface.initField(this.game.logic))
        {
            console.error("initField a echouée");
            return (false);
        }
        else if (!this.game.interface.initBall(this.game.logic.getBall))
        {
            console.error("initBall a échouée");
            return (false);
        }
        else 
        {
            this.game.logic.getPlayers.forEach((player, index) => {
                if (!this.game?.interface.initPlayer(player, index))
                {
                    console.error("iniPlayer a échouée " + index);
                    return (false);
                }
                // Log pour vérifier l'ordre des joueurs créés
                console.log(`🎮 Joueur ${index} initialisé:`, { 
                    id: player.getId, 
                    team: player.getTeam, 
                    alias: player.getAlias,
                    isMe: player.getId === this.myUserId
                });
            });
        }
        this.game.interface.initScoreBoard();
        this.game.interface.initTimeBefore();
        this.lastScoreSnapshot = {
            score1: this.game.logic.getScore1,
            score2: this.game.logic.getScore2
        };

        if (this.gameReady())
        {
            // Toujours ajouter les event listeners pour les touches (même en mode en ligne)
            this.keyDownHandler = this.keyDownHandler.bind(this);
            this.keyUpHandler = this.keyUpHandler.bind(this);
            window.addEventListener("keydown", this.keyDownHandler);
            window.addEventListener("keyup", this.keyUpHandler);
            
            // Si c'est un match en ligne, se connecter via websocket
            if (this.isOnline) {
                if (this.myUserId && this.myUserId > 0) {
                    console.log("🌐 Match en ligne détecté, connexion WebSocket...");
                    this.connectWebSocket();
                } else {
                    console.error("❌ Match en ligne mais myUserId invalide:", { isOnline: this.isOnline, myUserId: this.myUserId, participants: this.participants });
                }
            } else {
                console.log("ℹ️ Match local (pas de WebSocket nécessaire)");
            }
            // allumage des lumieres
            if (this.sceneManager) {
                this.sceneManager.getLights().turnOffLights();
            } else {
                console.error("sceneManager is undefined");
            }
        }
        else
        {
            console.error("Le match ne peut pas etre lance");
            return (false);
        } 

        return (true);
    }

    private monitorScoreChanges(): void {
        if (!this.game)
            return;

        const currentScore = {
            score1: this.game.logic.getScore1,
            score2: this.game.logic.getScore2
        };

        if (
            currentScore.score1 === this.lastScoreSnapshot.score1 &&
            currentScore.score2 === this.lastScoreSnapshot.score2
        )
            return;

        const previousScore = { ...this.lastScoreSnapshot };
        this.lastScoreSnapshot = currentScore;

        if (!this.isOnline)
            return;

        const scoringTeam = this.game.logic.getScored ||
            (currentScore.score1 > previousScore.score1 ? 1 :
                currentScore.score2 > previousScore.score2 ? 2 : 0);

        if (!scoringTeam)
            return;

        this.sendScoreSync(currentScore.score1, currentScore.score2, scoringTeam);
    }

    private sendScoreSync(
        score1: number,
        score2: number,
        scoringTeam: number
    ): void {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN || !this.myUserId)
            return;

        const maxScore = parseInt(this.rules.score, 10);
        const isMatchFinished = !isNaN(maxScore) && (score1 >= maxScore || score2 >= maxScore);
        const payload = {
            type: 'score_sync',
            gameId: this.id,
            score1,
            score2,
            scoringTeam,
            isMatchFinished,
            sourceUserId: this.myUserId,
            timestamp: Date.now(),
        };
        this.websocket.send(JSON.stringify(payload));
        console.log("📤 score_sync envoyé:", payload);
    }

    private handleRemoteScoreSync(message: any): void {
        if (!this.isOnline || !this.game)
            return;
        if (message.gameId !== this.id)
            return;
        if (message.sourceUserId && this.myUserId && message.sourceUserId === this.myUserId)
            return;

        const score1 = Number(message.score1);
        const score2 = Number(message.score2);
        if (Number.isNaN(score1) || Number.isNaN(score2))
            return;

        if (
            score1 === this.lastScoreSnapshot.score1 &&
            score2 === this.lastScoreSnapshot.score2
        )
            return;

        const scoringTeam = typeof message.scoringTeam === "number" ? message.scoringTeam : 0;
        this.lastScoreSnapshot = { score1, score2 };

        this.game.logic.syncScore(score1, score2, scoringTeam);
        this.game.interface.updateScoreBoard();

        console.log("🔄 score_sync reçu et appliqué:", {
            score1,
            score2,
            scoringTeam,
            from: message.sourceUserId,
        });
    }

    private handleOpponentDisconnected(message: any): void {
        if (!this.game) {
            console.warn("opponent_disconnected reçu alors que le match est déjà terminé:", message);
            return;
        }
        console.warn("⚠️ L'adversaire s'est déconnecté, abandon du match", message);
        const winnerUserId = typeof message.winnerUserId === "number"
            ? message.winnerUserId
            : this.myUserId;

        let winnerParticipant: MatchParticipant | null = null;
        if (winnerUserId) {
            winnerParticipant = this.participants.find((p) => p.id === winnerUserId) || null;
        }
        if (!winnerParticipant) {
            winnerParticipant = this.participants.find((p) => p.me) || null;
        }
        if (winnerParticipant) {
            this.winner = winnerParticipant;
        }

        // Forcer la fin de partie côté logique pour permettre l'affichage du vainqueur
        const winnerSlot = this.participants.findIndex((p) => p.id === winnerParticipant?.id);
        if (winnerSlot !== -1 && this.game?.logic) {
            this.game.logic.forceEndWithWinner(winnerSlot + 1);
        }

        const scoreSnapshot = {
            score1: this.game.logic.getScore1,
            score2: this.game.logic.getScore2,
        };
        this.status = MatchStatus.FINISHED;
        this.playersConnected.clear();
        this.dbIdToGameId.clear();
        this.matchStarted = false;
        this.isFirstConnector = null;
        this.myGamePlayerId = null;
        this.teardownMatchScene(true);
        this.sendForfeitResult(winnerParticipant?.id ?? null, scoreSnapshot.score1, scoreSnapshot.score2);
    }

    private teardownMatchScene(redirectToMenu: boolean = true): void {
        const currentGame = this.game;
        if (currentGame && currentGame.interface) {
            currentGame.interface.getPlayers.forEach((p) => {
                p.mesh.dispose();
            });
        }
        window.removeEventListener("keydown", this.keyDownHandler);
        window.removeEventListener("keyup", this.keyUpHandler);
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        this.sceneManager.getScene().onBeforeRenderObservable.remove(this.renderObserver);
        if (redirectToMenu && currentGame && currentGame.interface) {
            currentGame.interface.showWinner(true);
        }
        this.game = null;
    }

    private async sendForfeitResult(
        winnerId: number | null,
        score1: number,
        score2: number
    ): Promise<void> {
        if (!winnerId) {
            console.warn("Impossible d'enregistrer le forfait: winnerId manquant");
            return;
        }
        try {
            await fetch(`${API_URL}/api/friendly/${this.id}/finish`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    winnerId,
                    score1,
                    score2,
                }),
            });
            console.log("✅ Forfait enregistré côté serveur");
        } catch (error) {
            console.error("Erreur lors de l'enregistrement du forfait:", error);
        }
    }

    private connectWebSocket(): void {
        console.log("🔌 connectWebSocket() appelé", { 
            myUserId: this.myUserId, 
            myGamePlayerId: this.myGamePlayerId,
            myPlayerTeam: this.myPlayerTeam,
            gameId: this.id, 
            isOnline: this.isOnline,
            currentUser: this.currentUser
        });
        if (!this.myUserId) {
            console.error("❌ Impossible de se connecter: myUserId non défini");
            return;
        }

        // Déterminer l'URL du websocket
        // Si on est sur HTTP (port 3000), on doit se connecter à HTTPS (port 8443) en utilisant wss://
        // Si on est déjà sur HTTPS, utiliser le même port avec wss://
        const host = window.location.hostname;
        let wsProtocol: string;
        let wsPort: string;
        
        if (window.location.protocol === 'https:') {
            // Déjà en HTTPS, utiliser wss:// avec le même port
            wsProtocol = 'wss:';
            wsPort = window.location.port || '443';
        } else {
            // En HTTP (dev), se connecter à HTTPS (8443) avec wss://
            wsProtocol = 'wss:';
            wsPort = '8443';
        }
        
        const wsUrl = `${wsProtocol}//${host}:${wsPort}/ws`;
        console.log("------------------ wsurl -> ", wsUrl);
        
        console.log("🔌 Connexion WebSocket à:", wsUrl);
        console.log("🔌 Détails:", { 
            pageProtocol: window.location.protocol,
            wsProtocol, 
            hostname: window.location.hostname, 
            pagePort: window.location.port, 
            wsPort,
            fullUrl: window.location.href,
            wsUrl 
        });
        
        try {
            this.websocket = new WebSocket(wsUrl);
            
            this.websocket.onopen = () => {
                console.log("✅ WebSocket connecté");
                // Envoyer un message pour rejoindre le match
                if (this.websocket && this.myUserId) {
                    this.playersConnected.add(this.myUserId);
                    this.websocket.send(JSON.stringify({
                        type: 'join_game',
                        gameId: this.id,
                        userId: this.myUserId,
                    }));
                    console.log("📤 Message join_game envoyé:", { gameId: this.id, userId: this.myUserId });
                    console.log(`👥 Joueurs connectés: ${this.playersConnected.size}/2`);
                }
            };

            this.websocket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    console.error("❌ Erreur parsing message WebSocket:", error);
                }
            };

            this.websocket.onerror = (error) => {
                console.error("❌ Erreur WebSocket:", error);
                console.error("❌ Détails de l'erreur WebSocket:", {
                    readyState: this.websocket?.readyState,
                    url: wsUrl,
                    myUserId: this.myUserId,
                    gameId: this.id
                });
            };

            this.websocket.onclose = (event) => {
                console.log("🔌 WebSocket fermé", { code: event.code, reason: event.reason, wasClean: event.wasClean });
                this.websocket = null;
            };
        } catch (error) {
            console.error("❌ Erreur lors de la création de la connexion WebSocket:", error);
        }
    }

    private handleWebSocketMessage(message: any): void {
        console.log("📥 Message WebSocket reçu:", message);
        console.log("📊 État actuel:", {
            isOnline: this.isOnline,
            matchStarted: this.matchStarted,
            gameExists: !!this.game,
            gameLogicExists: !!this.game?.logic,
            gameId: this.id,
            messageGameId: message.gameId,
            myUserId: this.myUserId,
            remoteUserId: this.remoteUserId,
            playersConnected: Array.from(this.playersConnected)
        });
        
        switch (message.type) {
            case 'players_already_connected':
                // Message reçu quand on rejoint : liste des joueurs déjà connectés
                console.log(`📋 Joueurs déjà connectés reçus:`, message.userIds);
                if (this.isOnline && message.gameId === this.id && Array.isArray(message.userIds)) {
                    message.userIds.forEach((uid: number) => {
                        this.playersConnected.add(uid);
                        // Si remoteUserId n'est pas encore défini, le définir maintenant
                        if (this.remoteUserId === null && uid !== this.myUserId) {
                            this.remoteUserId = uid;
                            console.log(`✅ remoteUserId défini: ${this.remoteUserId}`);
                        }
                    });
                    // Déterminer si ce client est le premier connecteur: si aucun userId n'existait avant
                    // Le serveur renvoie les userIds déjà présents *avant* notre connexion.
                    this.isFirstConnector = (message.userIds.length === 0);
                    
                    // IMPORTANT: Ne pas écraser myGamePlayerId s'il a déjà été défini dans init()
                    // La position dans le jeu est déterminée par le serveur (player1/player2 dans la DB)
                    // pas par l'ordre de connexion WebSocket
                    console.log('📊 État avant mise à jour WebSocket:', {
                        isFirstConnector: this.isFirstConnector,
                        myGamePlayerId: this.myGamePlayerId,
                        myPlayerTeam: this.myPlayerTeam,
                        myUserId: this.myUserId
                    });
                    
                    // Garder myGamePlayerId tel que défini dans init() - c'est la position correcte
                    // basée sur player1Id/player2Id de la base de données
                    console.log(`👥 Joueurs connectés après réception: ${this.playersConnected.size}/2`);
                    console.log('✨ Position maintenue depuis init():', {
                        myUserId: this.myUserId,
                        myGamePlayerId: this.myGamePlayerId,
                        myPlayerTeam: this.myPlayerTeam
                    });
                    // Pour les matchs en ligne, attendre le message 'game_start' du serveur
                    // Ne pas démarrer le match ici, le serveur le fera quand les deux joueurs seront prêts
                }
                break;
            case 'player_joined':
                console.log(`✅ Joueur ${message.userId} a rejoint le match ${message.gameId}`);
                if (this.isOnline && message.gameId === this.id) {
                    this.playersConnected.add(message.userId);
                    // Si remoteUserId n'est pas encore défini, le définir maintenant
                    if (this.remoteUserId === null && message.userId !== this.myUserId) {
                        this.remoteUserId = message.userId;
                        console.log(`✅ remoteUserId défini: ${this.remoteUserId}`);
                    }
                    
                    // IMPORTANT: Ne pas écraser myGamePlayerId ici
                    // La position est déterminée dans init() basée sur player1Id/player2Id de la DB
                    console.log(`👥 Joueurs connectés: ${this.playersConnected.size}/2`, {
                        myUserId: this.myUserId,
                        myGamePlayerId: this.myGamePlayerId,
                        newUserId: message.userId
                    });
                    // Pour les matchs en ligne, attendre le message 'game_start' du serveur
                    // Ne pas démarrer le match ici, le serveur le fera quand les deux joueurs seront prêts
                }
                break;
            case 'game_start':
                // Message du serveur indiquant que le match peut démarrer
                console.log("🎮 Le serveur indique que le match peut démarrer");
                console.log("📊 État avant démarrage:", { 
                    matchStarted: this.matchStarted, 
                    isOnline: this.isOnline,
                    gameExists: !!this.game,
                    gameLogicExists: !!this.game?.logic,
                    gameState: this.game?.logic?.getState,
                    myUserId: this.myUserId,
                    remoteUserId: this.remoteUserId,
                    playersConnected: Array.from(this.playersConnected)
                });
                if (this.isOnline && !this.matchStarted && this.game && this.game.logic) {
                    console.log("✅ Conditions remplies pour démarrer le match");
                    this.matchStarted = true;
                    this.status = MatchStatus.ONGOING;
                    this.game.logic.start();
                    console.log("✅ Match démarré via game_start! État:", { 
                        matchStarted: this.matchStarted, 
                        gameState: this.game.logic.getState,
                        status: this.status
                    });
                } else {
                    console.warn("⚠️ Impossible de démarrer le match:", { 
                        isOnline: this.isOnline, 
                        matchStarted: this.matchStarted, 
                        gameExists: !!this.game,
                        gameLogicExists: !!this.game?.logic
                    });
                }
                break;
            case 'player_move':
                // Appliquer le mouvement du joueur distant
                // Ignorer les échos renvoyés par le serveur pour le client originel
                // Si le message concerne notre propre joueur de jeu (myGamePlayerId),
                // il s'agit probablement d'un echo envoyé par le serveur : l'update
                // a déjà été appliquée localement dans handleOnlineKeys -> on l'ignore.
                if (this.myGamePlayerId && message.playerId === this.myGamePlayerId) {
                    // Silencieux pour éviter trop de logs
                    break;
                }
                if (this.game) {
                    const players = this.game.logic.getPlayers;
                    // Trouver le joueur distant par ID (gamePlayerId: 1 ou 2)
                    const remotePlayer = players.find(p => p.getId === message.playerId);
                    if (remotePlayer) {
                        if (message.direction === 'up') {
                            remotePlayer.update(-1);
                        } else if (message.direction === 'down') {
                            remotePlayer.update(1);
                        }
                    } else {
                        console.warn("⚠️ Joueur distant non trouvé par gamePlayerId:", { 
                            messagePlayerId: message.playerId,
                            myGamePlayerId: this.myGamePlayerId,
                            myUserId: this.myUserId,
                            remoteUserId: this.remoteUserId,
                            availablePlayers: players.map(p => ({ id: p.getId, team: p.getTeam })) 
                        });
                    }
                }
                break;
            case 'opponent_disconnected':
                this.handleOpponentDisconnected(message);
                break;
            case 'score_sync':
                this.handleRemoteScoreSync(message);
                break;
            default:
                console.warn("⚠️ Type de message WebSocket inconnu:", message.type);
        }
    }

    private sendPlayerMove(direction: 'up' | 'down'): void {
        if (!this.websocket || !this.myGamePlayerId) {
            console.warn("⚠️ sendPlayerMove: websocket ou myGamePlayerId manquant", { websocket: !!this.websocket, myGamePlayerId: this.myGamePlayerId, myUserId: this.myUserId });
            return;
        }

        if (this.websocket.readyState === WebSocket.OPEN) {
            const message = {
                type: 'player_move',
                gameId: this.id,
                playerId: this.myGamePlayerId, // send game-local id (1 or 2)
                direction: direction,
            };
            this.websocket.send(JSON.stringify(message));
            console.log("📤 Message player_move envoyé:", message);
        } else {
            console.warn("⚠️ WebSocket n'est pas ouvert, readyState:", this.websocket.readyState);
        }
    }

    play() : boolean
    {
        console.log("▶️ MatchFriendlyOnline.play() appelé", { isOnline: this.isOnline, matchStarted: this.matchStarted, gameExists: !!this.game });
        if (!this.game)
            return (false);

        // Pour les matchs en ligne, ne pas démarrer immédiatement
        // Attendre que les deux joueurs soient connectés via websocket
        if (this.isOnline) {
            console.log("⏳ Match en ligne: en attente de la connexion des deux joueurs...");
            console.log("📊 État actuel:", { 
                myUserId: this.myUserId, 
                remoteUserId: this.remoteUserId,
                playersConnected: Array.from(this.playersConnected),
                websocketReady: this.websocket?.readyState,
                websocketExists: !!this.websocket
            });
            // Le match démarrera automatiquement quand les deux joueurs seront connectés
            // via le message 'player_joined' ou 'game_start' dans handleWebSocketMessage
        } else {
            // Pour les matchs locaux, démarrer immédiatement
            this.game.logic.start();
            this.status = MatchStatus.ONGOING;
        }

        this.renderObserver = this.sceneManager.getScene().onBeforeRenderObservable.add(() => {
            if (this.game && this.game.logic.getState !== 3) {
                if (this.isOnline) {
                    // Mode en ligne : gérer les touches et envoyer via websocket
                    // Mais seulement si le match a démarré
                    if (this.matchStarted) {
                        // Gérer les touches pour mon joueur local
                        this.handleOnlineKeys();
                        // Mettre à jour l'interface 3D (qui appelle aussi la logique du jeu)
                        // On passe un Set vide car les touches sont déjà gérées dans handleOnlineKeys()
                        this.game.interface.update(new Set());
                    } else {
                        // Même si le match n'a pas encore démarré, mettre à jour l'interface
                        // pour afficher les joueurs et la balle (en position initiale)
                        this.game.interface.update(new Set());
                    }
                } else {
                    // Mode local : utiliser les touches normalement
                    this.game.interface.update(this.keys);
                }
                this.monitorScoreChanges();
            } else if (this.game && this.game.logic.getState === 3) {
                this.onFinish().catch((error) => {
                    console.error("Erreur lors de la fin du match amical:", error);
                });
            }
        })
        return (true);
    }

    private handleOnlineKeys(): void {
        // Cette fonction n'est appelée que pour les matchs en ligne (vérification dans play())
        // On vérifie myGamePlayerId car c'est la position dans le jeu qui compte
        if (!this.game || !this.isOnline || !this.myGamePlayerId) {
            console.warn("⚠️ handleOnlineKeys: conditions non remplies", { 
                game: !!this.game, 
                isOnline: this.isOnline, 
                myUserId: this.myUserId,
                myGamePlayerId: this.myGamePlayerId
            });
            return;
        }

        // Pour les matchs EN LIGNE uniquement : utiliser myGamePlayerId (1/2) pour trouver MON joueur
        const players = this.game.logic.getPlayers;
        const myPlayer = players.find(p => p.getId === this.myGamePlayerId);
        
        if (!myPlayer) {
            console.warn("⚠️ Mon joueur non trouvé dans handleOnlineKeys par ID:", { 
                myUserId: this.myUserId,
                myGamePlayerId: this.myGamePlayerId,
                myPlayerTeam: this.myPlayerTeam,
                players: players.map(p => ({ id: p.getId, team: p.getTeam, position: p.getTeam === 1 ? "gauche" : "droite" })),
                participants: this.participants.map((p, idx) => ({ 
                    id: p.id, 
                    me: p.me, 
                    alias: p.alias,
                    team: idx === 0 ? 1 : 2,
                    position: idx === 0 ? "gauche" : "droite"
                }))
            });
            return;
        }

        // Pour les matchs en ligne, tous les joueurs utilisent les flèches haut/bas
        // Gérer les touches pour mon joueur uniquement
        if (this.keys.has("ArrowUp")) {
            myPlayer.update(-1);
            this.sendPlayerMove('up');
        } else if (this.keys.has("ArrowDown")) {
            myPlayer.update(1);
            this.sendPlayerMove('down');
        }
    }

    async onFinish() : Promise<void>
    {
        if (!this.game)
            return ;
        this.score[0] = this.game.logic.getScore1;
        this.score[1] = this.game.logic.getScore2;
        if (this.score[0] > this.score[1])
            this.winner = this.participants[0];
        else
            this.winner = this.participants[1];

        this.status = 2;
            
        console.log("Match amical terminé", this);

        // Enregistrer le résultat dans la base de données
        if (this.winner) {
            try {
                const response = await fetch(`${API_URL}/api/friendly/${this.id}/finish`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        winnerId: this.winner.id,
                        score1: this.score[0],
                        score2: this.score[1],
                    }),
                });

                if (response.ok) {
                    console.log("✅ Résultat du match amical enregistré dans la base de données");
                } else {
                    console.error("Erreur lors de l'enregistrement du résultat du match");
                }
            } catch (error) {
                console.error("Erreur lors de l'appel API pour enregistrer le résultat:", error);
            }
        }

        this.playersConnected.clear();
        this.dbIdToGameId.clear();
        this.matchStarted = false;
        this.isFirstConnector = null;
        this.myGamePlayerId = null;

        this.teardownMatchScene(true);
    }
};