/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/23 15:58:35 by tissad            #+#    #+#             */
/*   Updated: 2025/07/24 14:53:49 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Fastify from 'fastify';
import cors from '@fastify/cors';

// Import the Fastify framework
const app = Fastify({ logger: true });

// Define the API endpoint for user signup
interface SignupBody {
  username: string;
  password: string;
}

// Register the POST route for user signup
app.post<{ Body: SignupBody }>('/api', async (request, reply) => {
  const { username, password } = request.body;


  request.log.info(`Signup for: ${username}, ${password}`);

  return reply.code(201).send({
    message: 'User signed up successfully',
    data: { username, password },
  });
});


// Register CORS plugin to allow cross-origin requests  
app.register(cors, {
  origin: 'http://0.0.0.0:3000', // Allow specific origins
  methods: ['GET', 'POST'], // Allow specific methods
  credentials: true, // Allow credentials
});


// Start the Fastify server
const start = async () => {
  try {
    await app.listen({ port: 4000, host: '0.0.0.0' });
    console.log('🚀 Server is running at http://localhost:4000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
