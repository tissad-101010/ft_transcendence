import {FastifyInstance} from 'fastify'
import { testGameController } from "../controllers/test"

declare const process: any;

export async function testGameRoutes(server: FastifyInstance)
{
    server.get('/test-route', testGameController)
}

// rp store active sockets by user id for quick lookups
const activeConnections = new Map<number, any>(); // rp keep a map of user id to websocket
const gameRooms = new Map<number, Set<any>>(); // rp keep a map of game id to set of sockets

function broadcastToGame(gameId: number, message: any) { // rp send a payload to every socket in a game room
  const room = gameRooms.get(gameId); // rp retrieve sockets list for the game
  if (room) { // rp only broadcast when the room exists
    const messageStr = JSON.stringify(message); // rp serialize once for all sockets
    let sentCount = 0; // rp track successful sends
    let failedCount = 0; // rp track failed sends
    room.forEach((ws: any) => { // rp iterate over each socket in the room
      try { // rp wrap send in try-catch to handle errors gracefully
        // rp check if socket is open - use WebSocket.OPEN constant or numeric value 1
        const isOpen = ws.readyState === 1 || (typeof WebSocket !== 'undefined' && ws.readyState === WebSocket.OPEN);
        if (isOpen) { // rp ensure the socket is still open
          ws.send(messageStr); // rp send the message as json string
          sentCount++; // rp increment success counter
        } else { // rp log if socket is not open
          console.log(`⚠️ Socket fermé, readyState: ${ws.readyState}`); // rp debug closed socket
          failedCount++; // rp increment failure counter
        } // rp end open guard
      } catch (error: any) { // rp catch send errors
        console.error(`❌ Erreur envoi message à socket:`, error); // rp log send failure
        failedCount++; // rp increment failure counter
      } // rp end error handling
    }); // rp finish broadcasting loop
    if (sentCount > 0 || failedCount > 0) { // rp log broadcast results
      console.log(`📤 Broadcast: ${sentCount} envoyé(s), ${failedCount} échec(s) sur ${room.size} socket(s)`); // rp log results
    } // rp end logging
  } else { // rp log if room doesn't exist
    console.log(`⚠️ Aucune room trouvée pour gameId: ${gameId}`); // rp debug missing room
  } // rp nothing to send if room absent
} // rp end broadcast helper

async function updateGameState( // rp persist paddle movement in database
  fastify: FastifyInstance, // rp access prisma via fastify instance
  gameId: number, // rp identify which game to update
  playerId: number, // rp identify which player moved
  direction: string, // rp direction of the movement
) { // rp start update function
  try { // rp wrap prisma call in try to catch errors
    const delta = direction === 'up' ? -0.1 : 0.1; // rp compute vertical delta for paddle
    const field = playerId === 1 ? 'player1Y' : 'player2Y'; // rp choose column name based on player

    await (fastify.prisma as any).gameState.update({ // rp perform prisma update to adjust paddle position
      where: { gameId }, // rp filter by game id primary key
      data: { // rp describe update payload
        [field]: { increment: delta }, // rp increment chosen paddle position by delta
      }, // rp end data payload
    }); // rp finish database call
  } catch (error: unknown) { // rp catch any prisma failure
    fastify.log.error(error, 'Erreur mise à jour état jeu'); // rp log failure for debugging
  } // rp end error handling
} // rp finish updateGameState

async function handleJoinGame(fastify: FastifyInstance, ws: any, message: any) { // rp add a player websocket to a game room
  console.log('🔍 handleJoinGame appelé avec:', message); // rp debug
  const { gameId, userId } = message; // rp extract identifiers from payload
  if (!gameRooms.has(gameId)) { // rp create room if it does not exist yet
    gameRooms.set(gameId, new Set()); // rp initialize a new set for the room
    console.log(`📦 Nouvelle room créée pour gameId: ${gameId}`); // rp log room creation
  } // rp end room creation

  gameRooms.get(gameId)!.add(ws); // rp place player socket inside room set
  activeConnections.set(userId, ws); // rp map the user id to this websocket

  const roomSize = gameRooms.get(gameId)!.size; // rp get current room size
  console.log(`✅ Joueur ${userId} a rejoint la partie ${gameId} (room size: ${roomSize})`); // rp keep server log for monitoring

  // Envoyer au nouveau joueur la liste des joueurs déjà connectés
  const room = gameRooms.get(gameId)!;
  const connectedUserIds: number[] = [];
  room.forEach((socket: any) => {
    // Trouver l'userId associé à ce socket
    for (const [uid, socketRef] of activeConnections.entries()) {
      if (socketRef === socket) {
        if (uid !== userId) { // Ne pas inclure le joueur qui vient de rejoindre
          connectedUserIds.push(uid);
        }
        break;
      }
    }
  });
  
  // Envoyer au nouveau joueur les informations sur les joueurs déjà connectés
  if (connectedUserIds.length > 0) {
    try {
      const messageStr = JSON.stringify({
        type: 'players_already_connected',
        gameId: gameId,
        userIds: connectedUserIds,
      });
      if (ws.readyState === 1 || (typeof WebSocket !== 'undefined' && ws.readyState === WebSocket.OPEN)) {
        ws.send(messageStr);
        console.log(`📤 Envoyé players_already_connected à ${userId}:`, connectedUserIds);
      }
    } catch (error) {
      console.error(`❌ Erreur envoi players_already_connected:`, error);
    }
  }

  // Pour les matchs amicaux en ligne, vérifier si les deux joueurs sont connectés
  // Si oui, mettre à jour le statut du match à 'ongoing' et envoyer un message de démarrage
  if (roomSize === 2) {
    try {
      // Vérifier si c'est un match amical en ligne
      const friendlyMatch = await (fastify.prisma as any).friendlyMatch.findUnique({
        where: { id: gameId },
      });

      console.log(`🔍 Vérification match amical ${gameId}:`, {
        exists: !!friendlyMatch,
        isOnline: friendlyMatch?.isOnline,
        status: friendlyMatch?.status,
        player1Id: friendlyMatch?.player1Id,
        player2Id: friendlyMatch?.player2Id,
      });

      if (friendlyMatch && friendlyMatch.isOnline && friendlyMatch.status === 'waiting') {
        // Les deux joueurs sont connectés, mettre à jour le statut
        await (fastify.prisma as any).friendlyMatch.update({
          where: { id: gameId },
          data: {
            status: 'ongoing',
            startedAt: new Date(),
          },
        });
        console.log(`🎮 Match amical ${gameId} démarré (deux joueurs connectés)`);
        
        // Envoyer un message à tous les joueurs pour démarrer le match
        console.log(`📤 Envoi message game_start pour match ${gameId}`);
        broadcastToGame(gameId, {
          type: 'game_start',
          gameId: gameId,
        });
        console.log(`✅ Message game_start envoyé pour match ${gameId}`);
      } else {
        console.log(`⚠️ Match ${gameId} ne correspond pas aux critères:`, {
          friendlyMatch: !!friendlyMatch,
          isOnline: friendlyMatch?.isOnline,
          status: friendlyMatch?.status,
        });
      }
    } catch (error) {
      // Si ce n'est pas un match amical, ignorer l'erreur
      console.error(`❌ Erreur lors de la vérification du match amical ${gameId}:`, error);
      fastify.log.debug('Match non trouvé ou erreur lors de la mise à jour du statut (peut être un match de tournoi)');
    }
  } else {
    console.log(`ℹ️ Room size pour match ${gameId}: ${roomSize} (attendu: 2)`);
  }

  broadcastToGame(gameId, { // rp notify other players about the join
    type: 'player_joined', // rp message type for clients
    userId, // rp include joining player id
    gameId, // rp include affected game id
  }); // rp complete broadcast
} // rp end handleJoinGame

async function handlePlayerMove( // rp process movement events from clients
  fastify: FastifyInstance, // rp need prisma access
  ws: any, // rp include sender socket for completeness
  message: any, // rp incoming payload with move info
) { // rp start move handler
  const { gameId, playerId, direction } = message; // rp destructure required fields

  console.log(`🎮 Mouvement reçu: joueur ${playerId}, direction ${direction}, gameId ${gameId}`); // rp log received move

  await updateGameState(fastify, gameId, playerId, direction); // rp persist movement in database

  const room = gameRooms.get(gameId); // rp get room for logging
  const roomSize = room ? room.size : 0; // rp get room size
  console.log(`📢 Diffusion mouvement à ${roomSize} socket(s) dans la room ${gameId}`); // rp log broadcast info

  broadcastToGame(gameId, { // rp notify all players about the move
    type: 'player_move', // rp message label for clients
    playerId, // rp specify who moved
    direction, // rp specify move direction
    timestamp: Date.now(), // rp attach timestamp for client synchronization
  }); // rp broadcast complete
} // rp end handlePlayerMove

async function handleWebSocketMessage( // rp route websocket messages by type
  fastify: FastifyInstance, // rp context for prisma and logging
  ws: any, // rp socket sending the message
  message: any, // rp parsed message body
) { // rp start router
  switch (message.type) { // rp inspect message type
    case 'join_game': // rp join command
      await handleJoinGame(fastify, ws, message); // rp process join logic
      break; // rp exit switch branch
    case 'player_move': // rp move command
      await handlePlayerMove(fastify, ws, message); // rp process movement
      break; // rp exit switch branch
    default: // rp unknown command branch
      fastify.log.warn('Type de message inconnu:', message.type); // rp log unsupported message type
  } // rp end switch statement
} // rp end message router

export function setupWebSocketRoute(fastify: FastifyInstance) { // rp register websocket endpoint
  fastify.get('/ws', { websocket: true } as any, (connection: any) => { // rp expose websocket route on /ws
    console.log('✅ Nouvelle connexion WebSocket reçue'); // rp log new websocket connection
    fastify.log.info('✅ Nouvelle connexion WebSocket'); // rp log new websocket connection

    let socket: any = null; // rp placeholder to hold actual websocket object

    if (connection && connection.socket) { // rp support fastify websocket structure
      socket = connection.socket; // rp use nested socket reference
    } else if (connection && typeof connection.on === 'function') { // rp handle plain websocket instance
      socket = connection; // rp assign connection directly
    } else { // rp unknown structure
      fastify.log.error('❌ Structure de connection inconnue'); // rp log unsupported connection shape
      return; // rp abort handler
    } // rp end structure evaluation

    if (!socket || typeof socket.on !== 'function') { // rp validate websocket api
      fastify.log.error('❌ Socket invalide'); // rp log invalid socket
      return; // rp stop processing for this connection
    } // rp end validation

    socket.on('message', async (data: unknown) => { // rp listen for incoming websocket messages
      try { // rp parse guard
        const payload =
          typeof data === 'string'
            ? data
            : (data as { toString: () => string }).toString(); // rp normalise payload to string
        const message = JSON.parse(payload); // rp parse buffer to object
        await handleWebSocketMessage(fastify, socket, message); // rp route parsed message
      } catch (error: unknown) { // rp handle parse issues
        fastify.log.error(error, '❌ Erreur parsing message WebSocket'); // rp log parsing error
      } // rp end catch
    }); // rp finish message listener

    socket.on('close', () => { // rp react when socket closes
      fastify.log.info('🔌 Connexion WebSocket fermée'); // rp log disconnection

      for (const [userId, wsConnection] of activeConnections.entries()) { // rp iterate active connections
        if (wsConnection === socket) { // rp find entry for closing socket
          activeConnections.delete(userId); // rp remove mapping so user is marked offline
          break; // rp stop loop once removed
        } // rp end comparison
      } // rp end active connections loop

      for (const [gameId, room] of gameRooms.entries()) { // rp iterate each game room
        room.delete(socket); // rp remove socket from the room set
        if (room.size === 0) { // rp clean up empty rooms
          gameRooms.delete(gameId); // rp delete room when nobody left
        } // rp end emptiness check
      } // rp end rooms loop
    }); // rp finish close listener

    socket.on('error', (error: any) => { // rp handle websocket level errors
      fastify.log.error(error, '❌ Erreur WebSocket'); // rp log socket error
    }); // rp end error listener
  }); // rp finish websocket route registration
} // rp end setupWebSocketRoute

export async function gameRoutes(fastify: FastifyInstance) // Function to declare REST routes for the game
{
    fastify.post('/api/game/create', async (request: any, reply: any) => {
        try {
            const body = request.body as { player1_id: number };
            let player1_id = body.player1_id;

            let user = await (fastify.prisma as any).user.findUnique({
                where: {
                    id: player1_id
                }
            });

            if (!user) {
                //return reply.status(404).send({ error: 'User not found' });
                // TO SUPPRESS, FOR TESTING ONLY
                user = await (fastify.prisma as any).user.upsert({ // rp create or fetch user by login
                    where: { login: `player${player1_id}` }, // rp use login pattern for lookup
                    update: {}, // rp do nothing on update path
                    create: { // rp describe new user fields
                      login: `player${player1_id}`, // rp set login when creating
                      email: `player${player1_id}@test.com`, // rp set email when creating
                      password: 'test123', // rp set simple password for testing
                    }, // rp end create payload
                  }); // rp finish upsert
                  fastify.log.info( // rp log creation to help debugging
                    `✅ Utilisateur de test trouvé/créé: ID ${user.id}, login: ${user.login}`, // rp message describing user creation
                  ); // rp end info log
                  player1_id = user.id; // rp use actual stored id from database
            }

            const game = await (fastify.prisma as any).game.create({ // (fastify.prisma as any).game.create enregistre une nouvelle ligne ds la table games et renvoie l'objet correspondant
                data : {
                    player1_id: player1_id,
                    status: 'waiting',
                    // Equivalent a faire cela mais prisma permet de le faire en nested
                    // const game = await (fastify.prisma as any).game.create({
                    //     data: {
                    //       player1_id: player1_id,
                    //       status: 'waiting',
                    //     },
                    //   });
                    
                    //   // 2) créer l’état initial lié à cette partie
                    //   await (fastify.prisma as any).gameState.create({
                    //     data: {
                    //       gameId: game.id,
                    //       // les autres champs prennent leurs valeurs par défaut,
                    //       // donc on peut laisser l’objet vide si le schema les définit
                    //     },
                    //   });
                    gameState: { // cree une table gameState avec les valeurs pas défaut avec le gameID
                        create: {},
                    },
                },
            });

            return reply.status(200).send({ 
                success: true,
                gameId: game.id,
                message: 'Game created successfully'
            });
        } catch (error: unknown) {
            fastify.log.error(error, 'Erreur création partie'); // rp log unexpected failure
      const normalizedError = error instanceof Error ? error : new Error(String(error)); // rp normalize unknown errors
      const errorMessage = // rp choose final error message
        normalizedError.message || 'Erreur inconnue lors de la création de la partie'; // rp fallback message when error empty
      reply.code(500).send({ // rp inform client about failure
        success: false, // rp mark request as unsuccessful
        message: errorMessage, // rp share error summary
        details: // rp optionally expose raw details when in dev
          process.env.NODE_ENV === 'development' ? String(normalizedError.stack ?? normalizedError) : undefined, // rp only leak stack traces in dev
      }); // rp end failure response
    } // rp end try-catch
  }); // rp end create route handler
  fastify.post('/api/game/join', async (request: any, reply: any) => { // rp endpoint for joining a game
    try { // rp guard main logic
      let { gameId, player2_id } = request.body as { // rp destructure required fields from body
        gameId: number; // rp targeted game id
        player2_id: number; // rp id of joining player
      }; // rp end destructuring

      let user = await (fastify.prisma as any).user.findUnique({ // rp check if player2 already exists
        where: { id: player2_id }, // rp search by numeric id
      }); // rp end findUnique

      if (!user) { // rp create placeholder user if missing
        user = await (fastify.prisma as any).user.upsert({ // rp create or fetch using login pattern
          where: { login: `player${player2_id}` }, // rp use login string for lookup
          update: {}, // rp nothing to update when present
          create: { // rp fields for creation
            login: `player${player2_id}`, // rp populate login
            email: `player${player2_id}@test.com`, // rp populate email
            password: 'test123', // rp simple password for testing
          }, // rp end create block
        }); // rp finish upsert
        fastify.log.info( // rp log automatic user creation
          `✅ Utilisateur de test trouvé/créé: ID ${user.id}, login: ${user.login}`, // rp describe new user
        ); // rp end log
        player2_id = user.id; // rp update to actual database id
      } // rp end user check

      const existingGame = await (fastify.prisma as any).game.findFirst({ // rp verify a waiting game exists
        where: { // rp query filters
          id: gameId, // rp match requested game id
          status: 'waiting', // rp ensure game is waiting
          player2_id: null, // rp ensure slot for player2 is free
        }, // rp end filters
      }); // rp finish search

      if (!existingGame) { // rp handle invalid join requests
        reply.code(404).send({ // rp notify client nothing to join
          success: false, // rp mark failure
          message: 'Partie non trouvée ou déjà complète', // rp explain reason
        }); // rp end response
        return; // rp stop execution for this request
      } // rp end guard

      const game = await (fastify.prisma as any).game.update({ // rp attach second player and update status
        where: { id: gameId }, // rp select game row
        data: { // rp update payload
          player2_id, // rp set second player id
          status: 'playing', // rp update status to playing
        }, // rp end data
      }); // rp finish update

      reply.code(200).send({ // rp confirm join success
        success: true, // rp mark success
        message: 'Partie rejointe avec succès', // rp user friendly message
        gameId: game.id, // rp include game identifier in response
      }); // rp end success
    } catch (error) { // rp catch unexpected join errors
      fastify.log.error(error, 'Erreur rejoindre partie'); // rp log failure for observability
      reply.code(500).send({ // rp respond with server error
        success: false, // rp flag failure
        message: 'Erreur lors de la connexion à la partie', // rp share fallback message
      }); // rp end reply
    } // rp end try catch
  }); // rp end join route handler

  fastify.get('/api/game/:gameId/status', async (request: any, reply: any) => { // rp endpoint to fetch full game status
    try { // rp guard database access
      const { gameId } = request.params as { gameId: string }; // rp retrieve path parameter

      const game = await (fastify.prisma as any).game.findUnique({ // rp load game with relations
        where: { id: parseInt(gameId, 10) }, // rp convert id to number and filter
        include: { // rp eager load related entities
          gameState: true, // rp include game state snapshot
          player1: { select: { id: true, login: true } }, // rp include player1 basics
          player2: { select: { id: true, login: true } }, // rp include player2 basics
        }, // rp end include configuration
      }); // rp finish query

      if (!game) { // rp respond 404 if nothing found
        reply.code(404).send({ // rp send not found response
          success: false, // rp failure flag
          message: 'Partie non trouvée', // rp explain absence
        }); // rp end reply
        return; // rp stop handler
      } // rp end guard

      reply.code(200).send({ // rp send successful status response
        success: true, // rp mark success
        game, // rp include full game payload
      }); // rp end success reply
    } catch (error) { // rp catch unexpected errors
      fastify.log.error(error, 'Erreur récupération état partie'); // rp log failure
      reply.code(500).send({ // rp reply with server error
        success: false, // rp failure flag
        message: "Erreur lors de la récupération de l'état", // rp describe problem
      }); // rp end response
    } // rp end try catch
  }); // rp end status route

  fastify.get('/api/games/waiting', async (request: any, reply: any) => { // rp endpoint listing waiting games
    try { // rp guard query
      const games = await (fastify.prisma as any).game.findMany({ // rp fetch games filtered by waiting status
        where: { // rp filter configuration
          status: 'waiting', // rp only waiting games
        }, // rp end filter block
        select: { // rp choose fields we need
          id: true, // rp include id for identification
          player1_id: true, // rp include host id
          createdAt: true, // rp include creation timestamp
        }, // rp end select block
        orderBy: { // rp apply sort order
          createdAt: 'desc', // rp newest games first
        }, // rp end orderBy block
      }); // rp finish query

      reply.code(200).send({ // rp return list to caller
        success: true, // rp mark success
        games, // rp include games array
      }); // rp finish response
    } catch (error) { // rp catch unexpected errors
      fastify.log.error(error, 'Erreur récupération parties'); // rp log failure for investigation
      reply.code(500).send({ // rp respond with server error
        success: false, // rp failure flag
        message: 'Erreur lors de la récupération des parties', // rp describe issue
      }); // rp end failure response
    } // rp end try catch
  }); // rp end waiting games route
} // r