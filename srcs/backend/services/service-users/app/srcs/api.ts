/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/23 15:58:35 by tissad            #+#    #+#             */
/*   Updated: 2025/10/31 15:22:02 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';



// import routes
import { authRoutes,
          oauthRoutes,
          userRoutes
 } from './modules/auth/auth.routes';
// import { TwoFactorAuth } from './routes/TwoFactorAuth.routes';
// import { githubRoutes } from './routes/OauthGithub.routes';
// // import { googleRoutes } from './routes/OauthGoogle.routes';
// import { oauth42Routes } from './routes/Oauth42.routes';

// import plugins
import redisPlugin from './plugins/redis.plugin';
import { prismaPlugin } from './plugins/prisma.plugin';




/* ************************************************************************** */

// register the Fastify framework
const app = Fastify({ logger: true });

// Register cookie plugin
app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || 'supersecret', // optionnel (pour signer les cookies)
});


// Register plugins (database, redis, etc.)
// app.register(dbPlugin);
app.register(redisPlugin);
app.register(prismaPlugin);



// Register routes
app.register(authRoutes, { prefix: '/user/auth' });
app.register(oauthRoutes, { prefix: '/user/oauth' });
app.register(userRoutes, { prefix: '/user' });

// app.register(TwoFactorAuth, { prefix: '/two-factor' });
// app.register(githubRoutes, { prefix: '/auth' });
// app.register(googleRoutes, { prefix: '/auth' });
// app.register(oauth42Routes, { prefix: '/auth' });





// Start the Fastify server
const start = async () => {
  try {
    // Register CORS plugin to allow cross-origin requests  
    // need more testing/!\
    await app.register(cors, {
      // reel origin is 'https://localhost:8443'
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'], // Allow specific methods
      credentials: true, // Allow credentials
    });

    app.addHook('onRequest', async (req, reply) => {
      console.log('Origin reçue :', req.headers.origin);
      console.log('Méthode reçue :', req.method);
      console.log('URL de la requête :', req.url);
      console.log('Headers de la requête :', req.headers);
    });
    
    await app.listen({ port: 4000, host: '0.0.0.0' });
    console.log('🚀 Server is running');

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
