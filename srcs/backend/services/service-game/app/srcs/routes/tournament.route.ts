import { FastifyInstance } from 'fastify';

// =====================
// Tournament Routes
// =====================

export async function tournamentRoutes(fastify: FastifyInstance) {
  // Créer un tournoi
  fastify.post('/api/tournament/create', async (request: any, reply: any) => {
    try {
      const body = request.body as {
        name?: string;
        speed: string;
        scoreMax: string;
        timeBefore: string;
        player1_id: number;
      };

      const { name, speed, scoreMax, timeBefore, player1_id } = body;

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

      // Vérifier/créer l'utilisateur
      let user = await (fastify.prisma as any).user.findUnique({
        where: { id: player1_id },
      });

      if (!user) {
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
      }

      // Créer le tournoi
      const tournament = await (fastify.prisma as any).tournament.create({
        data: {
          name: name || null,
          speed,
          scoreMax,
          timeBefore,
          status: 'waiting',
        },
      });

      // Ajouter le créateur comme premier participant
      const participant = await (fastify.prisma as any).tournamentParticipant.create({
        data: {
          tournamentId: tournament.id,
          userId: user.id,
          alias: user.login,
          ready: true,
          eliminated: false,
        },
      });

      fastify.log.info(`✅ Tournoi créé: ID ${tournament.id}`);

      return reply.code(200).send({
        success: true,
        tournamentId: tournament.id,
        tournament: {
          ...tournament,
          participants: [participant],
        },
        message: 'Tournoi créé avec succès',
      });
    } catch (error: unknown) {
      fastify.log.error(error, 'Erreur création tournoi');
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      return reply.code(500).send({
        success: false,
        message: normalizedError.message || 'Erreur lors de la création du tournoi',
      });
    }
  });

  // Rejoindre un tournoi
  fastify.post('/api/tournament/:tournamentId/join', async (request: any, reply: any) => {
    try {
      const { tournamentId } = request.params as { tournamentId: string };
      const body = request.body as { userId: number; alias?: string };

      const { userId, alias } = body;

      if (!userId) {
        return reply.code(400).send({
          success: false,
          message: 'userId requis',
        });
      }

      // Vérifier que le tournoi existe et est en attente
      const tournament = await (fastify.prisma as any).tournament.findUnique({
        where: { id: parseInt(tournamentId, 10) },
        include: { participants: true },
      });

      if (!tournament) {
        return reply.code(404).send({
          success: false,
          message: 'Tournoi non trouvé',
        });
      }

      if (tournament.status !== 'waiting') {
        return reply.code(400).send({
          success: false,
          message: 'Le tournoi n\'est plus en attente de participants',
        });
      }

      // Vérifier/créer l'utilisateur
      let user = await (fastify.prisma as any).user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        user = await (fastify.prisma as any).user.upsert({
          where: { login: `player${userId}` },
          update: {},
          create: {
            login: `player${userId}`,
            email: `player${userId}@test.com`,
            password: 'test123',
          },
        });
      }

      // Vérifier que l'utilisateur n'est pas déjà dans le tournoi
      const existingParticipant = tournament.participants.find(
        (p: any) => p.userId === user.id
      );

      if (existingParticipant) {
        return reply.code(400).send({
          success: false,
          message: 'Vous êtes déjà dans ce tournoi',
        });
      }

      // Ajouter le participant
      const participant = await (fastify.prisma as any).tournamentParticipant.create({
        data: {
          tournamentId: tournament.id,
          userId: user.id,
          alias: alias || user.login,
          ready: false,
          eliminated: false,
        },
      });

      fastify.log.info(`✅ Joueur ${user.id} a rejoint le tournoi ${tournamentId}`);

      return reply.code(200).send({
        success: true,
        participant,
        message: 'Participant ajouté au tournoi',
      });
    } catch (error: unknown) {
      fastify.log.error(error, 'Erreur rejoindre tournoi');
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      return reply.code(500).send({
        success: false,
        message: normalizedError.message || 'Erreur lors de la participation au tournoi',
      });
    }
  });

  // Marquer un participant comme prêt
  fastify.post('/api/tournament/:tournamentId/participant/:participantId/ready', async (request: any, reply: any) => {
    try {
      const { tournamentId, participantId } = request.params as { tournamentId: string; participantId: string };

      const participant = await (fastify.prisma as any).tournamentParticipant.update({
        where: { id: parseInt(participantId, 10) },
        data: { ready: true },
      });

      return reply.code(200).send({
        success: true,
        participant,
        message: 'Participant marqué comme prêt',
      });
    } catch (error: unknown) {
      fastify.log.error(error, 'Erreur mise à jour statut participant');
      return reply.code(500).send({
        success: false,
        message: 'Erreur lors de la mise à jour du statut',
      });
    }
  });

  // Démarrer un tournoi (créer tous les matches)
  fastify.post('/api/tournament/:tournamentId/start', async (request: any, reply: any) => {
    try {
      const { tournamentId } = request.params as { tournamentId: string };

      const tournament = await (fastify.prisma as any).tournament.findUnique({
        where: { id: parseInt(tournamentId, 10) },
        include: {
          participants: {
            orderBy: { id: 'asc' },
          },
        },
      });

      if (!tournament) {
        return reply.code(404).send({
          success: false,
          message: 'Tournoi non trouvé',
        });
      }

      if (tournament.status !== 'waiting') {
        return reply.code(400).send({
          success: false,
          message: 'Le tournoi a déjà été démarré',
        });
      }

      const participants = tournament.participants;
      const participantCount = participants.length;

      // Validation: nombre de participants doit être une puissance de 2, minimum 4
      if (participantCount < 4) {
        return reply.code(400).send({
          success: false,
          message: 'Le tournoi nécessite au moins 4 participants',
        });
      }

      if (participantCount % 2 !== 0) {
        return reply.code(400).send({
          success: false,
          message: 'Le nombre de participants doit être pair',
        });
      }

      if ((participantCount & (participantCount - 1)) !== 0) {
        return reply.code(400).send({
          success: false,
          message: 'Le nombre de participants doit être une puissance de 2 (4, 8, 16, 32...)',
        });
      }

      // Vérifier que tous les participants sont prêts
      const unreadyParticipants = participants.filter((p: any) => !p.ready);
      if (unreadyParticipants.length > 0) {
        return reply.code(400).send({
          success: false,
          message: 'Tous les participants doivent être prêts',
        });
      }

      // Calculer le nombre de tours et de matches
      const nbTour = Math.log2(participantCount);
      let nbMatch = participantCount / 2;
      let targetSlot = 0;
      let targetMatch: number | undefined = nbMatch;
      let indexP = 0;
      let indexM = 0;
      const matches: any[] = [];

      // Créer les matches du premier tour
      for (let i = 0; i < nbMatch; i++) {
        if (i % 2 === 0 && i !== 0) {
          targetMatch! += 1;
        }

        const match = await (fastify.prisma as any).tournamentMatch.create({
          data: {
            tournamentId: tournament.id,
            round: 1,
            matchNumber: i + 1,
            player1Id: participants[indexP].id,
            player2Id: participants[indexP + 1].id,
            status: 'pending',
            nextMatchId: targetMatch,
            nextMatchSlot: targetSlot,
          },
        });

        matches.push(match);
        indexP += 2;
        indexM++;

        if (targetSlot === 1) {
          targetSlot = 0;
        } else {
          targetSlot = 1;
        }
      }

      // Créer les matches des tours suivants
      for (let i = 2; i <= nbTour; i++) {
        let mem = indexM;
        nbMatch /= 2;
        targetSlot = 0;
        if (nbMatch === 1) {
          targetMatch = undefined;
        } else {
          targetMatch = indexM + nbMatch;
        }

        for (let j = 0; j < nbMatch; j++) {
          if (targetMatch !== undefined && j % 2 === 0 && j !== 0) {
            targetMatch += 1;
          }

          if (targetSlot === 1) {
            targetSlot = 0;
          } else {
            targetSlot = 1;
          }

          const match = await (fastify.prisma as any).tournamentMatch.create({
            data: {
              tournamentId: tournament.id,
              round: i,
              matchNumber: j + 1,
              player1Id: null,
              player2Id: null,
              status: 'pending',
              nextMatchId: targetMatch || null,
              nextMatchSlot: targetSlot,
            },
          });

          matches.push(match);
          indexM++;
        }
      }

      // Mettre à jour le statut du tournoi
      await (fastify.prisma as any).tournament.update({
        where: { id: tournament.id },
        data: {
          status: 'in_progress',
          startedAt: new Date(),
        },
      });

      fastify.log.info(`✅ Tournoi ${tournamentId} démarré avec ${matches.length} matches`);

      return reply.code(200).send({
        success: true,
        tournamentId: tournament.id,
        matches,
        message: 'Tournoi démarré avec succès',
      });
    } catch (error: unknown) {
      fastify.log.error(error, 'Erreur démarrage tournoi');
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      return reply.code(500).send({
        success: false,
        message: normalizedError.message || 'Erreur lors du démarrage du tournoi',
      });
    }
  });

  // Obtenir l'état d'un tournoi
  fastify.get('/api/tournament/:tournamentId', async (request: any, reply: any) => {
    try {
      const { tournamentId } = request.params as { tournamentId: string };

      const tournament = await (fastify.prisma as any).tournament.findUnique({
        where: { id: parseInt(tournamentId, 10) },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, login: true },
              },
            },
            orderBy: { id: 'asc' },
          },
          matches: {
            include: {
              player1: {
                include: {
                  user: {
                    select: { id: true, login: true },
                  },
                },
              },
              player2: {
                include: {
                  user: {
                    select: { id: true, login: true },
                  },
                },
              },
              winner: {
                include: {
                  user: {
                    select: { id: true, login: true },
                  },
                },
              },
            },
            orderBy: [
              { round: 'asc' },
              { matchNumber: 'asc' },
            ],
          },
        },
      });

      if (!tournament) {
        return reply.code(404).send({
          success: false,
          message: 'Tournoi non trouvé',
        });
      }

      return reply.code(200).send({
        success: true,
        tournament,
      });
    } catch (error: unknown) {
      fastify.log.error(error, 'Erreur récupération tournoi');
      return reply.code(500).send({
        success: false,
        message: 'Erreur lors de la récupération du tournoi',
      });
    }
  });

  // Terminer un match et mettre à jour le match suivant
  fastify.post('/api/tournament/:tournamentId/match/:matchId/finish', async (request: any, reply: any) => {
    try {
      const { tournamentId, matchId } = request.params as { tournamentId: string; matchId: string };
      const body = request.body as {
        winnerId: number;
        score1: number;
        score2: number;
      };

      const { winnerId, score1, score2 } = body;

      // Récupérer le match
      const match = await (fastify.prisma as any).tournamentMatch.findUnique({
        where: { id: parseInt(matchId, 10) },
        include: {
          player1: true,
          player2: true,
        },
      });

      if (!match) {
        return reply.code(404).send({
          success: false,
          message: 'Match non trouvé',
        });
      }

      if (match.tournamentId !== parseInt(tournamentId, 10)) {
        return reply.code(400).send({
          success: false,
          message: 'Le match n\'appartient pas à ce tournoi',
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
      await (fastify.prisma as any).tournamentMatch.update({
        where: { id: match.id },
        data: {
          winnerId,
          score1,
          score2,
          status: 'finished',
          finishedAt: new Date(),
        },
      });

      // Marquer le perdant comme éliminé
      const loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;
      if (loserId) {
        await (fastify.prisma as any).tournamentParticipant.update({
          where: { id: loserId },
          data: { eliminated: true },
        });
      }

      // Mettre à jour le match suivant si il existe
      if (match.nextMatchId) {
        const nextMatch = await (fastify.prisma as any).tournamentMatch.findUnique({
          where: { id: match.nextMatchId },
        });

        if (nextMatch) {
          const updateData: any = {};
          if (match.nextMatchSlot === 0) {
            updateData.player1Id = winnerId;
          } else {
            updateData.player2Id = winnerId;
          }

          await (fastify.prisma as any).tournamentMatch.update({
            where: { id: nextMatch.id },
            data: updateData,
          });

          // Si les deux joueurs sont maintenant définis, le match peut commencer
          if (updateData.player1Id && nextMatch.player2Id) {
            await (fastify.prisma as any).tournamentMatch.update({
              where: { id: nextMatch.id },
              data: { status: 'pending' },
            });
          } else if (updateData.player2Id && nextMatch.player1Id) {
            await (fastify.prisma as any).tournamentMatch.update({
              where: { id: nextMatch.id },
              data: { status: 'pending' },
            });
          }
        }
      } else {
        // C'est la finale, le tournoi est terminé
        await (fastify.prisma as any).tournament.update({
          where: { id: parseInt(tournamentId, 10) },
          data: {
            status: 'finished',
            finishedAt: new Date(),
          },
        });
      }

      fastify.log.info(`✅ Match ${matchId} terminé, gagnant: ${winnerId}`);

      return reply.code(200).send({
        success: true,
        message: 'Match terminé avec succès',
      });
    } catch (error: unknown) {
      fastify.log.error(error, 'Erreur fin de match');
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      return reply.code(500).send({
        success: false,
        message: normalizedError.message || 'Erreur lors de la fin du match',
      });
    }
  });

  // Lister les tournois en attente
  fastify.get('/api/tournaments/waiting', async (request: any, reply: any) => {
    try {
      const tournaments = await (fastify.prisma as any).tournament.findMany({
        where: { status: 'waiting' },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, login: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reply.code(200).send({
        success: true,
        tournaments,
      });
    } catch (error: unknown) {
      fastify.log.error(error, 'Erreur récupération tournois');
      return reply.code(500).send({
        success: false,
        message: 'Erreur lors de la récupération des tournois',
      });
    }
  });
}







