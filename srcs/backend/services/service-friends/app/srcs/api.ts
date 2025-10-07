/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/23 15:58:35 by tissad            #+#    #+#             */
/*   Updated: 2025/10/07 18:05:20 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Friend service

import Fastify from 'fastify';
import cors from '@fastify/cors';



/* ************************************************************************** */

// Import the Fastify framework
const app = Fastify({ logger: true });



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
    
    await app.listen({ port: 4003, host: '0.0.0.0' });
    console.log('🚀 Game  server is running at http://localhost:4003');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
