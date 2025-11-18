
import { MatchParticipant, MatchRules } from "../Match.ts";
import { SceneManager } from "../scene/SceneManager.ts";
import { MatchBase, MatchStatus } from "./MatchBase.ts";

import Game3D from "../gameplay/Game3D.ts";
import GameLogic from "../gameplay/GameLogic.ts";
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
    private myPlayerId: number | null = null;
    private remotePlayerId: number | null = null;
    private playersConnected: Set<number> = new Set();
    private matchStarted: boolean = false;

    constructor(id : number, rules : MatchRules, sceneManager: SceneManager)
    {
        super(id, rules, sceneManager);
    }

    init(players: MatchParticipant[], isOnline: boolean = false): boolean
    {
        console.log("🎮 MatchFriendlyOnline.init() appelé avec:", { players, isOnline });
        if (players.length != 2)
            return (false);
        this.participants = players;
        this.isOnline = isOnline;

        // Déterminer quel joueur est moi et quel est l'adversaire
        const me = players.find(p => p.me);
        const opponent = players.find(p => !p.me);
        if (me) {
            this.myPlayerId = me.id;
            console.log("👤 Joueur 'me' trouvé:", { id: me.id, alias: me.alias, me: me.me });
        } else {
            console.error("❌ Aucun joueur avec me=true trouvé dans:", players);
        }
        if (opponent) {
            this.remotePlayerId = opponent.id;
            console.log("👤 Joueur 'opponent' trouvé:", { id: opponent.id, alias: opponent.alias, me: opponent.me });
        } else {
            console.error("❌ Aucun joueur avec me=false trouvé dans:", players);
        }
        console.log("👤 Joueurs identifiés:", { myPlayerId: this.myPlayerId, remotePlayerId: this.remotePlayerId, isOnline });

        // Mode 0 = local (même clavier), Mode 1 = remote (websockets)
        const gameMode = isOnline ? 1 : 0;

        this.game = {
            logic: new GameLogic(
                {
                    scoreMax: parseInt(this.rules.score),
                    ballSpeed: 0.3 * parseInt(this.rules.speed),
                    playerSpeed: 1.25 * parseInt(this.rules.speed),
                    countDownGoalTime: parseInt(this.rules.timeBefore),
                    allowPause: false
                },
                [this.participants[0], this.participants[1]],
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
            });
        }
        this.game.interface.initScoreBoard();
        this.game.interface.initTimeBefore();

        if (this.gameReady())
        {
            // Toujours ajouter les event listeners pour les touches (même en mode en ligne)
            this.keyDownHandler = this.keyDownHandler.bind(this);
            this.keyUpHandler = this.keyUpHandler.bind(this);
            window.addEventListener("keydown", this.keyDownHandler);
            window.addEventListener("keyup", this.keyUpHandler);
            
            // Si c'est un match en ligne, se connecter via websocket
            if (this.isOnline) {
                if (this.myPlayerId && this.myPlayerId > 0) {
                    console.log("🌐 Match en ligne détecté, connexion WebSocket...");
                    this.connectWebSocket();
                } else {
                    console.error("❌ Match en ligne mais myPlayerId invalide:", { isOnline: this.isOnline, myPlayerId: this.myPlayerId, participants: this.participants });
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

    private connectWebSocket(): void {
        console.log("🔌 connectWebSocket() appelé", { myPlayerId: this.myPlayerId, gameId: this.id, isOnline: this.isOnline });
        if (!this.myPlayerId) {
            console.error("❌ Impossible de se connecter: myPlayerId non défini");
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
                if (this.websocket && this.myPlayerId) {
                    this.playersConnected.add(this.myPlayerId);
                    this.websocket.send(JSON.stringify({
                        type: 'join_game',
                        gameId: this.id,
                        userId: this.myPlayerId,
                    }));
                    console.log("📤 Message join_game envoyé:", { gameId: this.id, userId: this.myPlayerId });
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
                    myPlayerId: this.myPlayerId,
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
            myPlayerId: this.myPlayerId,
            remotePlayerId: this.remotePlayerId,
            playersConnected: Array.from(this.playersConnected)
        });
        
        switch (message.type) {
            case 'players_already_connected':
                // Message reçu quand on rejoint : liste des joueurs déjà connectés
                console.log(`📋 Joueurs déjà connectés reçus:`, message.userIds);
                if (this.isOnline && message.gameId === this.id && Array.isArray(message.userIds)) {
                    message.userIds.forEach((uid: number) => {
                        this.playersConnected.add(uid);
                    });
                    console.log(`👥 Joueurs connectés après réception: ${this.playersConnected.size}/2`);
                    // Pour les matchs en ligne, attendre le message 'game_start' du serveur
                    // Ne pas démarrer le match ici, le serveur le fera quand les deux joueurs seront prêts
                }
                break;
            case 'player_joined':
                console.log(`✅ Joueur ${message.userId} a rejoint le match ${message.gameId}`);
                if (this.isOnline && message.gameId === this.id) {
                    this.playersConnected.add(message.userId);
                    console.log(`👥 Joueurs connectés: ${this.playersConnected.size}/2`);
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
                    myPlayerId: this.myPlayerId,
                    remotePlayerId: this.remotePlayerId,
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
                console.log("📥 Mouvement reçu du joueur distant:", { playerId: message.playerId, remotePlayerId: this.remotePlayerId, direction: message.direction });
                if (message.playerId === this.remotePlayerId && this.game) {
                    const players = this.game.logic.getPlayers;
                    // Trouver le joueur distant par son ID (player.id correspond à l'ID utilisateur)
                    const remotePlayer = players.find(p => p.getId === this.remotePlayerId);
                    if (remotePlayer) {
                        console.log("✅ Joueur distant trouvé, application du mouvement:", { direction: message.direction });
                        if (message.direction === 'up') {
                            remotePlayer.update(-1);
                        } else if (message.direction === 'down') {
                            remotePlayer.update(1);
                        }
                    } else {
                        console.warn("⚠️ Joueur distant non trouvé:", { remotePlayerId: this.remotePlayerId, players: players.map(p => ({ id: p.getId, team: p.getTeam })) });
                    }
                } else {
                    console.log("ℹ️ Mouvement ignoré (pas pour ce joueur ou game non défini):", { 
                        messagePlayerId: message.playerId, 
                        remotePlayerId: this.remotePlayerId, 
                        gameExists: !!this.game 
                    });
                }
                break;
            default:
                console.warn("⚠️ Type de message WebSocket inconnu:", message.type);
        }
    }

    private sendPlayerMove(direction: 'up' | 'down'): void {
        if (!this.websocket || !this.myPlayerId) {
            console.warn("⚠️ sendPlayerMove: websocket ou myPlayerId manquant", { websocket: !!this.websocket, myPlayerId: this.myPlayerId });
            return;
        }

        if (this.websocket.readyState === WebSocket.OPEN) {
            const message = {
                type: 'player_move',
                gameId: this.id,
                playerId: this.myPlayerId,
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
                myPlayerId: this.myPlayerId, 
                remotePlayerId: this.remotePlayerId,
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
            } else if (this.game && this.game.logic.getState === 3) {
                this.onFinish().catch((error) => {
                    console.error("Erreur lors de la fin du match amical:", error);
                });
            }
        })
        return (true);
    }

    private handleOnlineKeys(): void {
        if (!this.game || !this.myPlayerId) {
            console.warn("⚠️ handleOnlineKeys: game ou myPlayerId manquant", { game: !!this.game, myPlayerId: this.myPlayerId });
            return;
        }

        // Trouver mon joueur dans la liste
        const players = this.game.logic.getPlayers;
        const myPlayer = players.find(p => p.getId === this.myPlayerId);
        if (!myPlayer) {
            console.warn("⚠️ Mon joueur non trouvé dans handleOnlineKeys:", { myPlayerId: this.myPlayerId, players: players.map(p => ({ id: p.getId, team: p.getTeam })) });
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
        
        // Log pour déboguer (seulement si des touches sont pressées)
        if (this.keys.size > 0 && (this.keys.has("ArrowUp") || this.keys.has("ArrowDown"))) {
            console.log("🎮 Touches détectées:", { 
                keys: Array.from(this.keys), 
                hasArrowUp: this.keys.has("ArrowUp"),
                hasArrowDown: this.keys.has("ArrowDown")
            });
        }
    }

    async onFinish() : Promise<void>
    {
        if (!this.game)
            return ;
        this.game.interface.getPlayers.forEach((p) => {
            p.mesh.dispose();
        });
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
                const response = await fetch(`https://localhost:8443/api/friendly/${this.id}/finish`, {
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

        // Nettoyer les event listeners et websocket
        if (!this.isOnline) {
            window.removeEventListener("keydown", this.keyDownHandler);
            window.removeEventListener("keyup", this.keyUpHandler);
        }
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        this.sceneManager.getScene().onBeforeRenderObservable.remove(this.renderObserver);

        // Passer l'information à showWinner pour redirection vers le menu principal (avant de mettre game à null)
        if (this.game && this.game.interface) {
            this.game.interface.showWinner(true); // true = rediriger vers le menu principal
        }
        
        // Nettoyer le game après avoir appelé showWinner
        this.game = null;
    }
};