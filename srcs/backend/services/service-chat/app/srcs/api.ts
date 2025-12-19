/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/15 17:38:00 by tissad            #+#    #+#             */
/*   Updated: 2025/12/15 17:41:23 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */



// Chat service

import Fastify from 'fastify';
import cors from '@fastify/cors';



import websocketPlugin from "@fastify/websocket";


// Import the Fastify framework
const app = Fastify({ logger: true });
app.register(websocketPlugin);
// import plugins
import redisPlugin from './plugins/redis.plugin';
import { prismaPlugin } from './plugins/prisma.plugin';

// Enable WebSocket support
// app.register(fastifyWebsocket);


// Register plugins
app.register(redisPlugin);
app.register(prismaPlugin);


// Import and register routes
import { chatRoutes } from './routes/chat.routes';
import { wsRoutes } from './ws/wsRoute.route';

// Register WebSocket routes
app.register(wsRoutes);

// Register chat routes
app.register(chatRoutes);


// Start the Fastify server
const start = async () => {
  try {
    const originURL = `${process.env.ORIGIN_URL}`;
    // Register CORS plugin to allow cross-origin requests  
    // need more testing/!\
    await app.register(cors, {
      origin: [originURL, 'http://localhost:3000'],  // Allow specific origins
      methods: ['GET', 'POST'], // Allow specific methods
      credentials: true, // Allow credentials
    });

    // app.addHook('onRequest', async (req, reply) => {
    //   console.log('Origin reçue :', req.headers.origin);
    //   console.log('Méthode reçue :', req.method);
    //   console.log('URL de la requête :', req.url);
    //   console.log('Headers de la requête :', req.headers);
    // });
    
    await app.listen({ port: 4002, host: '0.0.0.0' });
    console.log('🚀 Chat  server is running at http://localhost:4002');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
