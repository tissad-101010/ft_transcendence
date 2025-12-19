/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/23 15:58:35 by tissad            #+#    #+#             */
/*   Updated: 2025/12/17 20:47:01 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


// service game


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
import {tournamentRoutes} from './routes/tournament.route'; // rp import tournament routes
import {friendlyRoutes} from './routes/friendly.route'; // rp import friendly match routes


// register the Fastify framework
const app = Fastify({ logger: true });

// Register cookie plugin
app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || 'supersecret', // optionnel (pour signer les cookies)
});


// Register plugins (database, redis, etc.)
// app.register(secretsPlugin);
app.register(redisPlugin);
app.register(prismaPlugin);
app.register(websocket); // rp : register websocket plugin

// Start the Fastify server
const start = async () => {
  try {
    // Register CORS plugin to allow cross-origin requests  
    const originURL = `${process.env.ORIGIN_URL}`;
    await app.register(cors, {
      origin: [originURL, 'http://localhost:3000'],  // Allow specific origins
      methods: ['GET', 'POST','PUT', 'DELETE', 'OPTIONS'], // Allow specific methods
      credentials: true, // Allow credentials
    });

    // Register routes AFTER plugins are loaded
    await app.register(gameRoutes); // rp : register function with all REST game routes
    await app.register(tournamentRoutes); // rp : register function with all REST tournament routes
    await app.register(friendlyRoutes); // rp : register function with all REST friendly match routes

    // app.addHook('onRequest', async (req, reply) => {
    //   console.log('Origin reçue :', req.headers.origin);
    //   console.log('Méthode reçue :', req.method);
    //   console.log('URL de la requête :', req.url);
    //   console.log('Headers de la requête :', req.headers);
    // });
    
    setupWebSocketRoute(app);

    await app.listen({ port: 4001, host: '0.0.0.0' });
    console.log('🚀 Server is running');
    // console.log('websocket disponible sur ws://localhost:4001/ws');

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
