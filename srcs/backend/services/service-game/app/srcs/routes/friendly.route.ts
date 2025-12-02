import { FastifyInstance } from 'fastify';

// =====================
// Friendly Match Routes
// =====================

export async function friendlyRoutes(fastify: FastifyInstance) {
  // Créer un match amical
  fastify.post('/api/friendly/create', async (request: any, reply: any) => {
    try {
      const body = request.body as {
        speed: string;
        scoreMax: string;
        timeBefore: string;
        player1_id: number;
        player1_login?: string; // Login de l'utilisateur authentifié
        isOnline?: boolean;
      };

      const { speed, scoreMax, timeBefore, isOnline = false, player1_login } = body;
      let player1_id = body.player1_id;

      // Validation des règles
      if (!speed || !['1', '2', '3'].includes(speed)) {
        return reply.code(400).send({
          success: false,
          message: 'Vitesse invalide (doit être 1, 2 ou 3)',
        });
      }

      if (!scoreMax || scoreMax === '') {
        return reply.code(400).send({
          success: false,
          message: 'Score maximum requis',
        });
      }

      if (!timeBefore || timeBefore === '') {
        return reply.code(400).send({
          success: false,
          message: 'Temps avant match requis',
        });
      }

      // Rechercher ou créer l'utilisateur en priorité par login (si fourni)
      // Cela permet de synchroniser avec le système d'authentification du service-users
      let user = null;
      
      if (player1_login) {
        // Rechercher par login d'abord (identifiant unique du système d'auth)
        user = await (fastify.prisma as any).user.findUnique({
          where: { login: player1_login },
        });
        
        if (!user) {
          // Créer l'utilisateur avec le vrai login
          user = await (fastify.prisma as any).user.create({
            data: {
              login: player1_login,
              email: `${player1_login}@transcendence.local`,
              password: 'oauth_user', // Marqueur pour utilisateur authentifié
            },
          });
          fastify.log.info(`Utilisateur authentifié créé: ID ${user.id}, login: ${user.login}`);
        } else {
          fastify.log.info(`Utilisateur authentifié trouvé: ID ${user.id}, login: ${user.login}`);
        }
        player1_id = user.id;
      } else {
        // Fallback: rechercher par ID (comportement legacy)
        user = await (fastify.prisma as any).user.findUnique({
          where: { id: player1_id },
        });

        if (!user) {
          // Créer un utilisateur de test si aucun login fourni
          fastify.log.info(`Utilisateur avec ID ${player1_id} non trouvé, création d'un utilisateur de test`);
          user = await (fastify.prisma as any).user.upsert({
            where: { login: `player${player1_id}` },
            update: {},
            create: {
              login: `player${player1_id}`,
              email: `player${player1_id}@test.com`,
              password: 'test123',
            },
          });
          fastify.log.info(`Utilisateur de test trouvé/créé: ID ${user.id}, login: ${user.login}`);
          player1_id = user.id;
        } else {
          fastify.log.info(`Utilisateur trouvé par ID: ID ${user.id}, login: ${user.login}`);
        }
      }

      // Créer le match amical
      const friendlyMatch = await (fastify.prisma as any).friendlyMatch.create({
        data: {
          player1Id: player1_id,
          player2Id: null,
          status: 'waiting',
          speed,
          scoreMax,
          timeBefore,
          isOnline: isOnline,
        },
        include: {
          player1: {
            select: {
              id: true,
              login: true,
            },
          },
        },
      });

      fastify.log.info(`Match amical créé: ID ${friendlyMatch.id} par utilisateur ${player1_id}`);
      fastify.log.info(`Match créé - Status: ${friendlyMatch.status}, Player1: ${friendlyMatch.player1?.login || 'N/A'}`);

      return reply.code(201).send({
        success: true,
        matchId: friendlyMatch.id,
        match: friendlyMatch,
      });
    } catch (error: unknown) {
      fastify.log.error(error, 'Erreur création match amical');
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      return reply.code(500).send({
        success: false,
        message: normalizedError.message || 'Erreur lors de la création du match amical',
      });
    }
  });

  // Récupérer la liste des matchs amicaux en attente
  fastify.get('/api/friendly/list', async (request: any, reply: any) => {
    try {
      // Récupérer uniquement les matchs en attente (status = 'waiting') et non terminés
      const matches = await (fastify.prisma as any).friendlyMatch.findMany({
        where: {
          status: 'waiting',
        },
        include: {
          player1: {
            select: {
              id: true,
              login: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Formater les matchs pour le frontend
      const formattedMatches = matches
        .filter((match: any) => match.player1 !== null) // Filtrer les matchs sans player1
        .map((match: any) => ({
          idMatch: match.id,
          idUser: match.player1.id,
          login: match.player1.login,
          speed: match.speed,
          time: match.timeBefore,
          score: match.scoreMax,
          isOnline: match.isOnline || false,
        }));

      fastify.log.info(`${formattedMatches.length} match(s) amical(aux) en attente trouvé(s)`);

      return reply.code(200).send({
        success: true,
        matches: formattedMatches,
      });
    } catch (error: unknown) {
      fastify.log.error(error, 'Erreur récupération liste matchs amicaux');
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      return reply.code(500).send({
        success: false,
        message: normalizedError.message || 'Erreur lors de la récupération des matchs amicaux',
      });
    }
  });

  // Rejoindre un match amical
  fastify.post('/api/friendly/:matchId/join', async (request: any, reply: any) => {
    try {
      const { matchId } = request.params as { matchId: string };
      const body = request.body as {
        player2_id: number;
        player2_login?: string; // Login de l'utilisateur authentifié
      };

      let player2_id = body.player2_id;
      const player2_login = body.player2_login;
      fastify.log.info(`Tentative de rejoindre le match ${matchId} par le joueur ${player2_login || player2_id}`);

      // Récupérer le match
      const match = await (fastify.prisma as any).friendlyMatch.findUnique({
        where: { id: parseInt(matchId, 10) },
        include: {
          player1: {
            select: {
              id: true,
              login: true,
            },
          },
        },
      });

      if (!match) {
        fastify.log.warn(`Match ${matchId} non trouvé`);
        return reply.code(404).send({
          success: false,
          message: 'Match non trouvé',
        });
      }

      fastify.log.info(`Match ${matchId} trouvé: player1Id=${match.player1Id}, player2Id=${match.player2Id}, isOnline=${match.isOnline}, status=${match.status}`);
      fastify.log.info(`Détails de la tentative de rejoindre: player2_id=${player2_id}, match.player1Id=${match.player1Id}, match.player2Id=${match.player2Id}`);
      fastify.log.info(`Vérifications: player2_id === player1Id? ${player2_id === match.player1Id}, player2Id === null? ${match.player2Id === null}, player2Id === player1Id? ${match.player2Id === match.player1Id}`);

      if (match.status !== 'waiting') {
        fastify.log.warn(`Match ${matchId} n'est plus disponible (status=${match.status})`);
        return reply.code(400).send({
          success: false,
          message: 'Le match n\'est plus disponible',
        });
      }

      // Pour les matchs en ligne, permettre au créateur de "rejoindre" son propre match
      // (pour se connecter via websocket, mais sans définir player2Id)
      // Pour les matchs locaux, permettre au créateur de rejoindre son propre match
      // (pour jouer en local avec deux joueurs sur le même clavier)
      if (match.player1Id === player2_id) {
        if (match.isOnline) {
          // Pour les matchs en ligne, le créateur peut se connecter via websocket
          // Retourner le match sans modifier player2Id
          fastify.log.info(`Créateur ${player2_id} rejoint son propre match en ligne ${matchId} (connexion websocket)`);
          const existingMatch = await (fastify.prisma as any).friendlyMatch.findUnique({
            where: { id: match.id },
            include: {
              player1: {
                select: {
                  id: true,
                  login: true,
                },
              },
              player2: {
                select: {
                  id: true,
                  login: true,
                },
              },
            },
          });
          return reply.code(200).send({
            success: true,
            match: {
              ...existingMatch,
              isOnline: match.isOnline || false,
            },
          });
        } else {
          // Pour les matchs locaux, le créateur peut rejoindre son propre match
          // (pour jouer en local avec deux joueurs sur le même clavier)
          // Si player2Id est déjà défini et différent de player1Id, un autre joueur a déjà rejoint
          if (match.player2Id !== null && match.player2Id !== match.player1Id) {
            fastify.log.warn(`Match ${matchId} local: un autre joueur a déjà rejoint (player2Id=${match.player2Id})`);
            return reply.code(400).send({
              success: false,
              message: 'Ce match est déjà complet',
            });
          }
          
          // Permettre au créateur de rejoindre son propre match local
          fastify.log.info(`Créateur ${player2_login || player2_id} rejoint son propre match local ${matchId} (joueur local)`);
          
          // Vérifier que l'utilisateur existe (par login si fourni, sinon par ID)
          let user = null;
          
          if (player2_login) {
            user = await (fastify.prisma as any).user.findUnique({
              where: { login: player2_login },
            });
            if (!user) {
              user = await (fastify.prisma as any).user.create({
                data: {
                  login: player2_login,
                  email: `${player2_login}@transcendence.local`,
                  password: 'oauth_user',
                },
              });
              fastify.log.info(`Utilisateur authentifié créé: ID ${user.id}, login: ${user.login}`);
            }
            player2_id = user.id;
          } else {
            user = await (fastify.prisma as any).user.findUnique({
              where: { id: player2_id },
            });
            if (!user) {
              user = await (fastify.prisma as any).user.upsert({
                where: { login: `player${player2_id}` },
                update: {},
                create: {
                  login: `player${player2_id}`,
                  email: `player${player2_id}@test.com`,
                  password: 'test123',
                },
              });
              fastify.log.info(`Utilisateur de test trouvé/créé: ID ${user.id}, login: ${user.login}`);
              player2_id = user.id;
            }
          }
          
          // Mettre à jour le match pour permettre deux joueurs locaux sur le même clavier
          // Si player2Id est null, le définir à player1Id pour permettre le match local
          const updatedMatch = await (fastify.prisma as any).friendlyMatch.update({
            where: { id: match.id },
            data: {
              player2Id: match.player2Id === null ? player2_id : match.player2Id,
              status: 'ongoing',
              startedAt: new Date(),
            },
            include: {
              player1: {
                select: {
                  id: true,
                  login: true,
                },
              },
              player2: {
                select: {
                  id: true,
                  login: true,
                },
              },
            },
          });

          fastify.log.info(`Match amical local ${matchId} rejoint par créateur ${player2_id} (match local)`);

          return reply.code(200).send({
            success: true,
            match: {
              ...updatedMatch,
              isOnline: match.isOnline || false,
            },
          });
        }
      }

      // Si le joueur a déjà rejoint ce match, retourner succès
      if (match.player2Id === player2_id) {
        fastify.log.info(`Joueur ${player2_id} a déjà rejoint le match ${matchId}`);
        const existingMatch = await (fastify.prisma as any).friendlyMatch.findUnique({
          where: { id: match.id },
          include: {
            player1: {
              select: {
                id: true,
                login: true,
              },
            },
            player2: {
              select: {
                id: true,
                login: true,
              },
            },
          },
        });
        return reply.code(200).send({
          success: true,
          match: {
            ...existingMatch,
            isOnline: match.isOnline || false,
          },
        });
      }

      // Pour les matchs en ligne, vérifier si un autre joueur a déjà rejoint
      // (même si le statut est encore 'waiting', on ne peut avoir qu'un seul player2)
      // Exception : si player2Id === player1Id, c'est que le créateur a rejoint son propre match
      // dans une version antérieure, on permet à un autre joueur de remplacer
      // Exception : si player2Id est null, le match est encore disponible
      fastify.log.info(`Vérification complétude match ${matchId}: isOnline=${match.isOnline}, player2Id=${match.player2Id}, player1Id=${match.player1Id}, player2_id=${player2_id}, status=${match.status}`);

      // Pour les matchs EN LIGNE :
      // - Tant que le statut est 'waiting', on considère que le match est encore joignable
      //   même si player2Id est déjà renseigné (cas où le créateur s'est connecté / déconnecté plusieurs fois).
      // - On ne bloque vraiment qu'une fois que le match n'est plus en attente (status !== 'waiting'),
      //   et qu'un player2 différent du créateur est déjà défini.
      if (
        match.isOnline &&
        match.status !== 'waiting' &&
        match.player2Id !== null &&
        match.player2Id !== match.player1Id
      ) {
        fastify.log.warn(`Match ${matchId} en ligne: tentative de rejoindre alors que le match n'est plus en attente`);
        fastify.log.warn(`Détails: match.player1Id=${match.player1Id}, match.player2Id=${match.player2Id}, player2_id=${player2_id}, status=${match.status}`);
        return reply.code(400).send({
          success: false,
          message: 'Ce match est déjà complet',
        });
      }
      fastify.log.info(`Match ${matchId} disponible pour rejoindre (player2Id=${match.player2Id}, player1Id=${match.player1Id}, isOnline=${match.isOnline})`);
      
      // Pour les matchs en ligne, si player2Id est null, le match est disponible
      if (match.isOnline && match.player2Id === null) {
        fastify.log.info(`Match ${matchId} en ligne disponible (player2Id est null), permettant à player2_id=${player2_id} de rejoindre`);
      }

      // Si player2Id === player1Id pour un match en ligne, on remplace par le nouveau joueur
      if (match.isOnline && match.player2Id === match.player1Id) {
        fastify.log.info(`Match ${matchId} en ligne: player2Id était égal à player1Id, remplacement par player2_id=${player2_id}`);
      }

      // Rechercher ou créer l'utilisateur en priorité par login (si fourni)
      let user = null;
      
      if (player2_login) {
        // Rechercher par login d'abord (identifiant unique du système d'auth)
        user = await (fastify.prisma as any).user.findUnique({
          where: { login: player2_login },
        });
        
        if (!user) {
          // Créer l'utilisateur avec le vrai login
          user = await (fastify.prisma as any).user.create({
            data: {
              login: player2_login,
              email: `${player2_login}@transcendence.local`,
              password: 'oauth_user',
            },
          });
          fastify.log.info(`Utilisateur authentifié créé: ID ${user.id}, login: ${user.login}`);
        } else {
          fastify.log.info(`Utilisateur authentifié trouvé: ID ${user.id}, login: ${user.login}`);
        }
        player2_id = user.id;
      } else {
        // Fallback: rechercher par ID (comportement legacy)
        user = await (fastify.prisma as any).user.findUnique({
          where: { id: player2_id },
        });

        if (!user) {
          // Créer un utilisateur de test si aucun login fourni
          user = await (fastify.prisma as any).user.upsert({
            where: { login: `player${player2_id}` },
            update: {},
            create: {
              login: `player${player2_id}`,
              email: `player${player2_id}@test.com`,
              password: 'test123',
            },
          });
          fastify.log.info(`Utilisateur de test trouvé/créé: ID ${user.id}, login: ${user.login}`);
          player2_id = user.id;
        }
      }

      // Mettre à jour le match
      // Pour les matchs en ligne, garder le statut 'waiting' jusqu'à ce que les deux joueurs soient connectés via websocket
      // Pour les matchs locaux, passer à 'ongoing' immédiatement
      const isOnline = match.isOnline || false;
      const newStatus = isOnline ? 'waiting' : 'ongoing';
      const startedAt = isOnline ? null : new Date();

      const updatedMatch = await (fastify.prisma as any).friendlyMatch.update({
        where: { id: match.id },
        data: {
          player2Id: player2_id,
          status: newStatus,
          startedAt: startedAt,
        },
        include: {
          player1: {
            select: {
              id: true,
              login: true,
            },
          },
          player2: {
            select: {
              id: true,
              login: true,
            },
          },
        },
      });

      fastify.log.info(`Match amical ${matchId} rejoint par utilisateur ${player2_id}`);

      return reply.code(200).send({
        success: true,
        match: {
          ...updatedMatch,
          isOnline: match.isOnline || false,
        },
      });
    } catch (error: unknown) {
      fastify.log.error(error, 'Erreur rejoindre match amical');
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      return reply.code(500).send({
        success: false,
        message: normalizedError.message || 'Erreur lors de la jonction au match amical',
      });
    }
  });

  // Terminer un match amical
  fastify.post('/api/friendly/:matchId/finish', async (request: any, reply: any) => {
    try {
      const { matchId } = request.params as { matchId: string };
      const body = request.body as {
        winnerId: number;
        score1: number;
        score2: number;
      };

      const { winnerId, score1, score2 } = body;

      // Récupérer le match
      const match = await (fastify.prisma as any).friendlyMatch.findUnique({
        where: { id: parseInt(matchId, 10) },
      });

      if (!match) {
        return reply.code(404).send({
          success: false,
          message: 'Match non trouvé',
        });
      }

      // Vérifier que le gagnant est bien un des joueurs
      if (winnerId !== match.player1Id && winnerId !== match.player2Id) {
        return reply.code(400).send({
          success: false,
          message: 'Le gagnant doit être un des joueurs du match',
        });
      }

      // Mettre à jour le match
      await (fastify.prisma as any).friendlyMatch.update({
        where: { id: match.id },
        data: {
          winnerId,
          score1,
          score2,
          status: 'finished',
          finishedAt: new Date(),
        },
      });

      fastify.log.info(`Match amical ${matchId} terminé, gagnant: ${winnerId}`);

      return reply.code(200).send({
        success: true,
        message: 'Match terminé avec succès',
      });
    } catch (error: unknown) {
      fastify.log.error(error, 'Erreur fin de match amical');
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      return reply.code(500).send({
        success: false,
        message: normalizedError.message || 'Erreur lors de la fin du match amical',
      });
    }
  });

  // Supprimer un match amical
  fastify.delete('/api/friendly/:matchId', async (request: any, reply: any) => {
    try {
      const { matchId } = request.params as { matchId: string };
      const matchIdInt = parseInt(matchId, 10);

      if (isNaN(matchIdInt)) {
        return reply.code(400).send({
          success: false,
          message: 'ID de match invalide',
        });
      }

      // Récupérer le match
      const match = await (fastify.prisma as any).friendlyMatch.findUnique({
        where: { id: matchIdInt },
      });

      if (!match) {
        return reply.code(404).send({
          success: false,
          message: 'Match non trouvé',
        });
      }

      // Supprimer le match
      await (fastify.prisma as any).friendlyMatch.delete({
        where: { id: matchIdInt },
      });

      fastify.log.info(`Match amical ${matchId} supprimé`);

      return reply.code(200).send({
        success: true,
        message: 'Match supprimé avec succès',
      });
    } catch (error: unknown) {
      fastify.log.error(error, 'Erreur suppression match amical');
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      return reply.code(500).send({
        success: false,
        message: normalizedError.message || 'Erreur lors de la suppression du match amical',
      });
    }
  });
}



