/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/23 15:58:35 by tissad            #+#    #+#             */
/*   Updated: 2025/12/12 13:39:47 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Fastify from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import path from "path";
import fastifyStatic from "@fastify/static";

// import routes
import {  authRoutes,
          userRoutes
        } from './modules/auth/auth.routes';
import { oauthRoutes } from './modules/oauth/routes/oauth.routes';
import { signoutRoutes } from './modules/signout/signout.routes';
import { TwoFactorAuth } from './modules/twoFactor/twoFactor.routes';
import { refreshRoutes } from './modules/refresh/refresh.routes';

// internal services routes responsible for internal communications between services
import { internalVerifyTokenRoutes } from "./internal-services-routes/internal-routes/internalVerifyToken.routes";
import { internalSelectUserRoutes } from './internal-services-routes/internal-routes/internalSelectUser.routes';
import { infoFriendRoute } from './modules/users/users.routes';
 
// import plugins
import redisPlugin from './plugins/redis.plugin';
import { prismaPlugin } from './plugins/prisma.plugin';
import requestLoggerPlugin from "./plugins/requestLogger.plugin";
import vaultPlugin from  './plugins/vault.plugin';
/* ************************************************************************** */



// register the Fastify framework



const app = Fastify({ logger: true });

// // Register cookie plugin
app.register(fastifyCookie, {
  secret: process.env.COOKIE_SECRET || 'supersecret', // optionnel (pour signer les cookies)
});



// Register plugins (database, redis, etc.)
app.register(redisPlugin);
app.register(prismaPlugin);
app.register(vaultPlugin);
app.register(requestLoggerPlugin);

app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1, // Maximum number of files
  },
  attachFieldsToBody: true,
});

// Serve static files from the "uploads" directory
app.register(fastifyStatic, {
  root: path.join(process.cwd(), 'uploads'),
  prefix: '/uploads/',
});





console.log('🚀 Loading secrets from Vault...', process.env.TOTO);
// Register routes
app.register(authRoutes, { prefix: '/user/auth' });
app.register(oauthRoutes, { prefix: '/user/oauth' });
app.register(refreshRoutes, { prefix: '/user/auth' });
app.register(userRoutes, { prefix: '/user' });
app.register(signoutRoutes, { prefix: '/user/auth' });
app.register(TwoFactorAuth, { prefix: '/user/2fa' });
// app.register(internalServicesRoutes, { prefix: '/internal' }); warnning mergre conflict

// Register internals routes
app.register(internalVerifyTokenRoutes, { prefix: '/internal' });
app.register(internalSelectUserRoutes, { prefix: '/internalUser'});

app.register(infoFriendRoute);
// Start the Fastify server
const start = async () => {
  try {
    // Register CORS plugin to allow cross-origin requests  
    // need more testing/!\
    const originURL = `${process.env.ORIGIN_URL}`;
    await app.register(cors, {
      // reel origin is originURL
      origin: [originURL, 'http://localhost:3000'], // Allow specific origins
      methods: ['GET', 'POST'], // Allow specific methods
      credentials: true, // Allow credentials
    });
    
    await app.listen({ port: 4000, host: '0.0.0.0' });
    console.log('🚀 Server is running');

  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();