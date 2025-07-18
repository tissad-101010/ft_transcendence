import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

interface SignupBody {
  username: string;
  password: string;
}

// Déclaration de la route POST /api/signup
fastify.post<{ Body: SignupBody }>('/api', async (request, reply) => {
  const { username, password } = request.body;

  // Log des données reçues
  request.log.info(`Signup reçu: ${username}, ${password}`);

  // Réponse JSON
  return reply.code(201).send({
    message: 'Utilisateur reçu avec succès',
    data: { username, password },
  });
});

// Démarrage du serveur
const start = async () => {
  try {
    // await fastify.listen({ port: 4000 });
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
    console.log('🚀 Serveur Fastify démarré sur http://localhost:4000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
