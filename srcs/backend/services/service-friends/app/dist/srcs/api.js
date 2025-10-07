"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/23 15:58:35 by tissad            #+#    #+#             */
/*   Updated: 2025/07/25 09:27:46 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
// Import the Fastify framework
const app = (0, fastify_1.default)({ logger: true });
// Register the POST route for user signup
app.post('/api', async (request, reply) => {
    const { username, password } = request.body;
    request.log.info(`Signup for: ${username}, ${password}`);
    return reply.code(201).send({
        message: 'User signed up successfully',
        data: { username, password },
    });
});
// Start the Fastify server
const start = async () => {
    try {
        // Register CORS plugin to allow cross-origin requests  
        // need more testing/!\
        await app.register(cors_1.default, {
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
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
