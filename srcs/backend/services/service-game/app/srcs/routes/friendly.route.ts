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
      };

      const { speed, scoreMax, timeBefore } = body;
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

      // Vérifier que l'utilisateur existe, sinon le créer
      // D'abord essayer de trouver par ID
      let user = await (fastify.prisma as any).user.findUnique({
        where: { id: player1_id },
      });

      if (!user) {
        // Si l'utilisateur n'existe pas par ID, créer un utilisateur avec un login basé sur l'ID
        // En production, on devrait synchroniser avec service-users ou utiliser le login réel
        fastify.log.info(`⚠️ Utilisateur avec ID ${player1_id} non trouvé, création d'un utilisateur de test`);
        user = await (fastify.prisma as any).user.upsert({
          where: { login: `player${player1_id}` },
          update: {},
          create: {
            login: `player${player1_id}`,
            email: `player${player1_id}@test.com`,
            password: 'test123',
          },
        });
        fastify.log.info(`✅ Utilisateur de test trouvé/créé: ID ${user.id}, login: ${user.login}`);
        player1_id = user.id; // Utiliser l'ID réel de la base de données
      } else {
        fastify.log.info(`✅ Utilisateur trouvé: ID ${user.id}, login: ${user.login}`);
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

      fastify.log.info(`✅ Match amical créé: ID ${friendlyMatch.id} par utilisateur ${player1_id}`);
      fastify.log.info(`📋 Match créé - Status: ${friendlyMatch.status}, Player1: ${friendlyMatch.player1?.login || 'N/A'}`);

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
        }));

      fastify.log.info(`📋 ${formattedMatches.length} match(s) amical(aux) en attente trouvé(s)`);

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
      };

      let player2_id = body.player2_id;

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
        return reply.code(404).send({
          success: false,
          message: 'Match non trouvé',
        });
      }

      if (match.status !== 'waiting') {
        return reply.code(400).send({
          success: false,
          message: 'Le match n\'est plus disponible',
        });
      }

      if (match.player1Id === player2_id) {
        return reply.code(400).send({
          success: false,
          message: 'Vous ne pouvez pas rejoindre votre propre match',
        });
      }

      // Vérifier que l'utilisateur existe, sinon le créer
      let user = await (fastify.prisma as any).user.findUnique({
        where: { id: player2_id },
      });

      if (!user) {
        // Créer automatiquement l'utilisateur s'il n'existe pas (pour les tests locaux)
        user = await (fastify.prisma as any).user.upsert({
          where: { login: `player${player2_id}` },
          update: {},
          create: {
            login: `player${player2_id}`,
            email: `player${player2_id}@test.com`,
            password: 'test123',
          },
        });
        fastify.log.info(`✅ Utilisateur de test trouvé/créé: ID ${user.id}, login: ${user.login}`);
        player2_id = user.id; // Utiliser l'ID réel de la base de données
      }

      // Mettre à jour le match
      const updatedMatch = await (fastify.prisma as any).friendlyMatch.update({
        where: { id: match.id },
        data: {
          player2Id: player2_id,
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

      fastify.log.info(`✅ Match amical ${matchId} rejoint par utilisateur ${player2_id}`);

      return reply.code(200).send({
        success: true,
        match: updatedMatch,
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

      fastify.log.info(`✅ Match amical ${matchId} terminé, gagnant: ${winnerId}`);

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
}



