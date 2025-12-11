/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/23 15:58:35 by tissad            #+#    #+#             */
/*   Updated: 2025/12/11 22:03:28 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';



// import routes
import { friendsRoutes } from './routes/friends.routes';

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
app.register(friendsRoutes);



// Start the Fastify server
const start = async () => {
  try {
    // Register CORS plugin to allow cross-origin requests  
    // need more testing/!\
    const originURL = `${process.env.ORIGIN_URL}`;
    await app.register(cors, {
      // reel origin is originURL
      origin: [originURL, 'http://localhost:3000',],
      methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Allow specific methods
      credentials: true, // Allow credentials
    });

    app.addHook('onRequest', async (req, reply) => {
      console.log('Origin reçue :', req.headers.origin);
      console.log('Méthode reçue :', req.method);
      console.log('URL de la requête :', req.url);
      console.log('Headers de la requête :', req.headers);
    });
    
    await app.listen({ port: 4003, host: '0.0.0.0' });
    console.log('🚀 Server is running');

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
