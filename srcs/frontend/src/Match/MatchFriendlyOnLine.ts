
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
    private myPlayerTeam: number | null = null; // Team de mon joueur (1 = gauche/score gauche, 2 = droite/score droit)
    private playersConnected: Set<number> = new Set();
    private matchStarted: boolean = false;
    private isFirstConnector: boolean | null = null; // true si ce navigateur est le premier à se connecter au match
    private dbIdToGameId: Map<number, number> = new Map(); // mapping DB user id -> game-local id (1/2)
    private myGamePlayerId: number | null = null; // 1 or 2 used when sending player_move
    private hasSentSyncThisServe: boolean = false; // true si on a déjà envoyé une synchro pour l'engagement en cours
    private lastSyncedScore1: number = 0;
    private lastSyncedScore2: number = 0;

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
        
        // Pour les matchs en ligne, permettre l'initialisation même si l'opponent n'est pas encore défini
        // (le deuxième joueur peut ne pas avoir encore rejoint)
        if (!opponent) {
            if (isOnline) {
                console.warn("⚠️ Avertissement: Aucun joueur avec me=false trouvé (le deuxième joueur n'a peut-être pas encore rejoint)");
                // Pour les matchs en ligne, on peut initialiser avec seulement le joueur local
                // Le remotePlayerId sera défini quand le deuxième joueur rejoindra
                this.myPlayerId = me.id;
                this.remotePlayerId = null; // Sera défini quand le deuxième joueur rejoindra
                const meIndex = players.indexOf(me);
                this.myPlayerTeam = meIndex === 0 ? 1 : 2;
                console.log("✅ Joueur 'me' trouvé (match en ligne, opponent pas encore défini):", { 
                    id: me.id, 
                    alias: me.alias, 
                    me: me.me, 
                    indexInArray: meIndex,
                    team: this.myPlayerTeam,
                    position: this.myPlayerTeam === 1 ? "gauche (score gauche)" : "droite (score droit)"
                });
            } else {
                // Pour les matchs locaux, l'opponent doit être défini
                console.error("❌ ERREUR: Aucun joueur avec me=false trouvé (match local nécessite deux joueurs)");
                return false;
            }
        } else {
            // Pour les matchs locaux, les IDs peuvent être identiques (un seul utilisateur contrôle les deux paddles)
            // Pour les matchs en ligne, les IDs doivent normalement être différents
            if (me.id === opponent.id) {
                if (isOnline) {
                    // Pour les matchs en ligne, les IDs identiques ne devraient pas arriver normalement
                    // (peut arriver temporairement si le deuxième joueur n'a pas encore rejoint)
                    console.warn("⚠️ Avertissement: IDs identiques pour match en ligne (peut être temporaire)", {
                        myId: me.id,
                        remoteId: opponent.id,
                        players: players.map(p => ({ id: p.id, alias: p.alias, me: p.me }))
                    });
                    this.myPlayerId = me.id;
                    this.remotePlayerId = null; // Sera défini quand le deuxième joueur rejoindra
                    const meIndex = players.indexOf(me);
                    this.myPlayerTeam = meIndex === 0 ? 1 : 2;
                } else {
                    // Match LOCAL : IDs identiques sont normaux (un seul utilisateur contrôle les deux paddles)
                    console.log("ℹ️ Match LOCAL: IDs identiques (comportement attendu, un seul utilisateur contrôle les deux paddles)", {
                        myId: me.id,
                        remoteId: opponent.id,
                        players: players.map(p => ({ id: p.id, alias: p.alias, me: p.me }))
                    });
                    this.myPlayerId = me.id;
                    this.remotePlayerId = opponent.id; // Même ID, c'est normal pour le mode local
                }
            } else {
                // IDs différents : comportement normal
                this.myPlayerId = me.id;
                this.remotePlayerId = opponent.id;
            }
            
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
                position: this.myPlayerTeam === 1 ? "gauche (score gauche)" : "droite (score droit)"
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
        }
        
        console.log("👤 Joueurs identifiés:", { 
            myPlayerId: this.myPlayerId, 
            remotePlayerId: this.remotePlayerId,
            myPlayerTeam: this.myPlayerTeam,
            areDifferent: this.myPlayerId !== this.remotePlayerId,
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
            // register mapping from DB id -> game id
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

        // Determine myGamePlayerId from DB myPlayerId if available
        if (this.myPlayerId && this.dbIdToGameId.has(this.myPlayerId)) {
            this.myGamePlayerId = this.dbIdToGameId.get(this.myPlayerId) || null;
        } else if (this.myPlayerTeam) {
            // fallback: infer from team
            this.myGamePlayerId = this.myPlayerTeam === 1 ? 1 : 2;
        }

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
                    isMe: player.getId === this.myPlayerId
                });
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
                        // Si remotePlayerId n'est pas encore défini, le définir maintenant
                        if (this.remotePlayerId === null && uid !== this.myPlayerId) {
                            this.remotePlayerId = uid;
                            console.log(`✅ remotePlayerId défini: ${this.remotePlayerId}`);
                        }
                    });
                    // Déterminer si ce client est le premier connecteur: si aucun userId n'existait avant
                    // Le serveur renvoie les userIds déjà présents *avant* notre connexion.
                    this.isFirstConnector = (message.userIds.length === 0);
                    if (this.isFirstConnector) {
                        // Premier connecteur -> côté GAUCHE (player 1)
                        this.myPlayerId = 1;
                        this.myPlayerTeam = 1;
                        this.remotePlayerId = 2;
                        // mettre à jour participants.me pour refléter la position
                        if (this.participants && this.participants.length === 2) {
                            this.participants[0].me = true;
                            this.participants[1].me = false;
                        }
                        console.log('✨ Ce navigateur est le PREMIER connecteur -> affecté à GAUCHE (player 1)');
                    } else {
                        // Pas le premier -> côté DROITE (player 2)
                        this.myPlayerId = 2;
                        this.myPlayerTeam = 2;
                        this.remotePlayerId = 1;
                        if (this.participants && this.participants.length === 2) {
                            this.participants[0].me = false;
                            this.participants[1].me = true;
                        }
                        console.log('✨ Ce navigateur est le SECOND connecteur -> affecté à DROITE (player 2)');
                    }
                    console.log(`👥 Joueurs connectés après réception: ${this.playersConnected.size}/2`);
                    // Pour les matchs en ligne, attendre le message 'game_start' du serveur
                    // Ne pas démarrer le match ici, le serveur le fera quand les deux joueurs seront prêts
                }
                break;
            case 'player_joined':
                console.log(`✅ Joueur ${message.userId} a rejoint le match ${message.gameId}`);
                if (this.isOnline && message.gameId === this.id) {
                    this.playersConnected.add(message.userId);
                    // Si remotePlayerId n'est pas encore défini, le définir maintenant
                    if (this.remotePlayerId === null && message.userId !== this.myPlayerId) {
                        this.remotePlayerId = message.userId;
                        console.log(`✅ remotePlayerId défini: ${this.remotePlayerId}`);
                    }
                    // Si on n'avait pas déterminé si on était le premier (par exemple connexion rapide),
                    // utiliser la taille actuelle pour décider: si avant de recevoir ce join nous avions 0, alors
                    // le premier était l'autre et nous sommes second; sinon si nous étions seuls, nous sommes premier.
                    if (this.isFirstConnector === null) {
                        // Si playersConnected.size === 2 après l'ajout, on est le second (car l'autre est déjà connecté)
                        if (this.playersConnected.size === 2) {
                            // si playersConnected contenait l'autre avant, we are second
                            this.isFirstConnector = false;
                            this.myPlayerId = 2;
                            this.myPlayerTeam = 2;
                            this.remotePlayerId = 1;
                            if (this.participants && this.participants.length === 2) {
                                this.participants[0].me = false;
                                this.participants[1].me = true;
                            }
                            console.log('✨ Détection tardive: assigné SECOND connecteur -> DROITE (player 2)');
                        } else {
                            // Sinon, on reste premier
                            this.isFirstConnector = true;
                            this.myPlayerId = 1;
                            this.myPlayerTeam = 1;
                            this.remotePlayerId = 2;
                            if (this.participants && this.participants.length === 2) {
                                this.participants[0].me = true;
                                this.participants[1].me = false;
                            }
                            console.log('✨ Détection tardive: assigné PREMIER connecteur -> GAUCHE (player 1)');
                        }
                    }
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
                // Ignorer les échos renvoyés par le serveur pour le client originel
                console.log("📥 Mouvement reçu du joueur distant:", { playerId: message.playerId, remotePlayerId: this.remotePlayerId, myPlayerId: this.myPlayerId, direction: message.direction });
                // Si le message concerne notre propre joueur de jeu (myGamePlayerId),
                // il s'agit probablement d'un echo envoyé par le serveur : l'update
                // a déjà été appliquée localement dans handleOnlineKeys -> on l'ignore.
                if (this.myGamePlayerId && message.playerId === this.myGamePlayerId) {
                    console.log('ℹ️ Ignoré: message player_move echo pour le joueur local', message.playerId);
                    break;
                }
                if (this.game) {
                    const players = this.game.logic.getPlayers;
                    // Trouver le joueur distant par ID plutôt que par team
                    // Cela garantit que le mouvement est appliqué au bon joueur même si myPlayerTeam est incorrect
                    const remotePlayer = players.find(p => p.getId === message.playerId);
                    if (remotePlayer) {
                        const remotePlayerTeam = remotePlayer.getTeam;
                        console.log("✅ Joueur distant trouvé par ID, application du mouvement:", { 
                            remotePlayerId: message.playerId,
                            remotePlayerTeam,
                            playerId: remotePlayer.getId,
                            direction: message.direction,
                            position: remotePlayerTeam === 1 ? "gauche (score gauche)" : "droite (score droit)"
                        });
                        if (message.direction === 'up') {
                            remotePlayer.update(-1);
                        } else if (message.direction === 'down') {
                            remotePlayer.update(1);
                        }
                    } else {
                        console.warn("⚠️ Joueur distant non trouvé par ID:", { 
                            messagePlayerId: message.playerId,
                            myPlayerId: this.myPlayerId,
                            remotePlayerId: this.remotePlayerId,
                            players: players.map(p => ({ id: p.getId, team: p.getTeam, position: p.getTeam === 1 ? "gauche" : "droite" })) 
                        });
                    }
                } else {
                    console.log("ℹ️ Mouvement ignoré (game non défini):", { 
                        messagePlayerId: message.playerId, 
                        myPlayerId: this.myPlayerId,
                        gameExists: !!this.game 
                    });
                }
                break;
            case 'state_sync':
                // Synchronisation d'état envoyée par le client "référence"
                console.log("📥 Message de synchronisation d'état reçu:", message);
                if (!this.isOnline || !this.game || !this.game.logic) {
                    console.warn("⚠️ state_sync ignoré (match hors ligne ou game manquant)");
                    break;
                }
                if (message.gameId !== this.id) {
                    console.warn("⚠️ state_sync pour un autre match, ignoré:", { expectedGameId: this.id, receivedGameId: message.gameId });
                    break;
                }
                // Ne pas traiter notre propre message (echo éventuel du serveur)
                if (this.myPlayerId && message.senderId === this.myPlayerId) {
                    console.log("ℹ️ state_sync echo pour ce client, ignoré");
                    break;
                }

                try {
                    const payload = {
                        score1: message.score1,
                        score2: message.score2,
                        time: message.time,
                        players: message.players || [],
                    };

                    // Mettre à jour notre référence locale de score pour éviter
                    // de considérer cet état comme un "nouveau" score à resynchroniser.
                    this.lastSyncedScore1 = payload.score1;
                    this.lastSyncedScore2 = payload.score2;

                    this.game.logic.syncStateFromRemote(payload);

                    // Recalage immédiat de l'affichage score / timer pour éviter tout décalage visuel
                    if (this.game.interface) {
                        this.game.interface.syncScoreFromLogic();
                        this.game.interface.syncTimeFromLogic();
                    }

                    console.log("✅ État du jeu resynchronisé depuis le client distant");
                } catch (e) {
                    console.error("❌ Erreur lors de l'application de state_sync:", e);
                }
                break;
            default:
                console.warn("⚠️ Type de message WebSocket inconnu:", message.type);
        }
    }

    private sendPlayerMove(direction: 'up' | 'down'): void {
        if (!this.websocket || !this.myGamePlayerId) {
            console.warn("⚠️ sendPlayerMove: websocket ou myGamePlayerId manquant", { websocket: !!this.websocket, myGamePlayerId: this.myGamePlayerId, myPlayerId: this.myPlayerId });
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

    /**
     * Envoie une photographie de l'état du jeu au début d'un engagement
     * afin de recaler le second joueur (score, positions verticales, timer).
     * Seul le client "référence" (premier connecteur) doit appeler cette méthode.
     */
    private sendStateSync(): void {
        if (!this.websocket || !this.game || !this.game.logic || !this.myPlayerId) {
            console.warn("⚠️ sendStateSync: conditions non remplies", {
                websocket: !!this.websocket,
                game: !!this.game,
                logic: !!this.game?.logic,
                myPlayerId: this.myPlayerId,
            });
            return;
        }

        if (this.websocket.readyState !== WebSocket.OPEN) {
            console.warn("⚠️ sendStateSync: WebSocket non ouvert, readyState:", this.websocket.readyState);
            return;
        }

        const players = this.game.logic.getPlayers.map((p) => ({
            id: p.getId,
            posY: p.getPosY,
        }));

        const payload = {
            type: 'state_sync',
            gameId: this.id,
            senderId: this.myPlayerId,
            score1: this.game.logic.getScore1,
            score2: this.game.logic.getScore2,
            time: this.game.logic.getTime,
            players,
        };

        this.websocket.send(JSON.stringify(payload));
        console.log("📤 Message state_sync envoyé:", payload);
    }

    /**
     * Vérifie si le score a changé localement depuis la dernière synchro
     * et envoie un state_sync pour forcer l'autre navigateur à se recaler.
     * Seul le PREMIER connecteur (client de référence) doit déclencher cette synchro.
     */
    private checkAndSyncScoreChange(): void {
        // Si ce client n'est pas le premier connecteur, il ne doit JAMAIS
        // envoyer de state_sync, pour éviter les boucles et divergences.
        if (!this.isFirstConnector) {
            return;
        }

        if (!this.websocket || !this.game || !this.game.logic) {
            return;
        }

        if (this.websocket.readyState !== WebSocket.OPEN) {
            return;
        }

        const currentScore1 = this.game.logic.getScore1;
        const currentScore2 = this.game.logic.getScore2;

        // Si aucun changement de score, ne rien faire
        if (currentScore1 === this.lastSyncedScore1 && currentScore2 === this.lastSyncedScore2) {
            return;
        }

        // Mettre à jour la référence locale
        this.lastSyncedScore1 = currentScore1;
        this.lastSyncedScore2 = currentScore2;

        // Envoyer une synchro d'état complète (scores, timer, positions des joueurs)
        this.sendStateSync();
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

                        // Si ce client est le premier connecteur, il sert de référence
                        // pour la synchro au moment de l'engagement (balle au milieu).
                        if (this.isFirstConnector && this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                            if (this.game.logic.getState === 2 && !this.hasSentSyncThisServe) {
                                this.sendStateSync();
                                this.hasSentSyncThisServe = true;
                            }
                        }

                        // Mettre à jour l'interface 3D (qui appelle aussi la logique du jeu)
                        // On passe un Set vide car les touches sont déjà gérées dans handleOnlineKeys()
                        this.game.interface.update(new Set());

                        // Après la mise à jour, si un but vient d'être marqué, autoriser
                        // une nouvelle synchro d'engagement ET synchroniser immédiatement
                        // le score de l'autre navigateur sur celui de ce client.
                        if (this.game.logic.getScored !== 0) {
                            // Prépare l'engagement suivant (nouvelle synchro au centre)
                            this.hasSentSyncThisServe = false;
                            // Synchronise les scores / positions / timer sur l'autre navigateur
                            this.checkAndSyncScoreChange();
                        }
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
        // Cette fonction n'est appelée que pour les matchs en ligne (vérification dans play())
        if (!this.game || !this.isOnline || !this.myPlayerId) {
            console.warn("⚠️ handleOnlineKeys: conditions non remplies", { 
                game: !!this.game, 
                isOnline: this.isOnline, 
                myPlayerId: this.myPlayerId 
            });
            return;
        }

        // Pour les matchs EN LIGNE uniquement : utiliser myGamePlayerId (1/2) pour trouver MON joueur
        const players = this.game.logic.getPlayers;
        const myPlayer = players.find(p => p.getId === this.myGamePlayerId);
        
        if (!myPlayer) {
            console.warn("⚠️ Mon joueur non trouvé dans handleOnlineKeys par ID:", { 
                myPlayerId: this.myPlayerId,
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
        
        const myPlayerTeamFromGame = myPlayer.getTeam;
        
            console.log("🎮 Contrôle du joueur par ID (match EN LIGNE uniquement):", {
                myPlayerId: this.myPlayerId,
                myGamePlayerId: this.myGamePlayerId,
                myPlayerTeam: this.myPlayerTeam,
                myPlayerTeamFromGame,
                playerId: myPlayer.getId,
                position: myPlayerTeamFromGame === 1 ? "gauche (score gauche)" : "droite (score droit)"
            });

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
        if (this.keys.has("ArrowUp") || this.keys.has("ArrowDown")) {
            console.log("⌨️ Touche pressée (match EN LIGNE):", {
                key: this.keys.has("ArrowUp") ? "ArrowUp" : "ArrowDown",
                myPlayerId: this.myPlayerId,
                myPlayerTeam: myPlayerTeamFromGame,
                position: myPlayerTeamFromGame === 1 ? "gauche" : "droite"
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