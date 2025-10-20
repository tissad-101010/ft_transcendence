/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/23 15:58:35 by tissad            #+#    #+#             */
/*   Updated: 2025/10/20 19:26:26 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Fastify from 'fastify';
import cors from '@fastify/cors';

// import routes
import { userRoutes } from './routes/users.routes';
import { otpRoutes } from './routes/otp.routes';
import { githubRoutes } from './routes/github.routes';
import { googleRoutes } from './routes/google.routes';

// import plugins
import dbPlugin from './plugins/db';
import redisPlugin from './plugins/redis';




/* ************************************************************************** */

// Import the Fastify framework
const app = Fastify({ logger: true });

// Register plugins (database, redis, etc.)
app.register(dbPlugin);
app.register(redisPlugin);


// Register routes
app.register(userRoutes, { prefix: '/users' });
app.register(otpRoutes, { prefix: '/2fa' });
app.register(githubRoutes, { prefix: '/auth' });
app.register(googleRoutes, { prefix: '/auth' });


// Start the Fastify server
const start = async () => {
  try {
    // Register CORS plugin to allow cross-origin requests  
    // need more testing/!\
    await app.register(cors, {
      origin: 'https://localhost:8443', // Allow specific origins
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
    console.log('🚀 Server is running at http://localhost:4000');

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
