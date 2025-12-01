/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/23 15:58:35 by tissad            #+#    #+#             */
/*   Updated: 2025/11/27 19:11:08 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import websocket from '@fastify/websocket'; //rp: enable wesocket plugin

type FastifyRequest = any; // ts
type FastifyReply = any; //ts 

declare const process : any; //ts
// import plugins
import redisPlugin from './plugins/redis.plugin';
import { prismaPlugin } from './plugins/prisma.plugin';

// import route
import {gameRoutes, setupWebSocketRoute} from './routes/game.route'; // rp import game routes and websocket setup

/* ************************************************************************** */

// register the Fastify framework
const app = Fastify({ logger: true });

// Register cookie plugin
app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || 'supersecret', // optionnel (pour signer les cookies)
});


// Register plugins (database, redis, etc.)
app.register(redisPlugin);
app.register(prismaPlugin);
app.register(websocket); // rp : register websocket plugin



// Register routes
app.register(gameRoutes); // rp : register function with all REST game routes


// Start the Fastify server
const start = async () => {
  try {
    // Register CORS plugin to allow cross-origin requests  
    // need more testing/!\
    await app.register(cors, {
      origin: 'https://localhost:8443', // Allow specific origins
      methods: ['GET', 'POST','PUT', 'DELETE', 'OPTIONS'], // Allow specific methods
      credentials: true, // Allow credentials
    });

    app.addHook('onRequest', async (req, reply) => {
      console.log('Origin reçue :', req.headers.origin);
      console.log('Méthode reçue :', req.method);
      console.log('URL de la requête :', req.url);
      console.log('Headers de la requête :', req.headers);
    });
    
    setupWebSocketRoute(app);

    await app.listen({ port: 4001, host: '0.0.0.0' });
    console.log('🚀 Server is running');
    console.log('websocket disponible sur ws://localhost:4001/ws');

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
