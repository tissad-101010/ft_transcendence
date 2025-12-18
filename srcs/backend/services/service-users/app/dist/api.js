"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/23 15:58:35 by tissad            #+#    #+#             */
/*   Updated: 2025/12/18 09:28:51 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const cors_1 = __importDefault(require("@fastify/cors"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const path_1 = __importDefault(require("path"));
const static_1 = __importDefault(require("@fastify/static"));
// import routes
const auth_routes_1 = require("./modules/auth/auth.routes");
const oauth_routes_1 = require("./modules/oauth/routes/oauth.routes");
const signout_routes_1 = require("./modules/signout/signout.routes");
const twoFactor_routes_1 = require("./modules/twoFactor/twoFactor.routes");
const refresh_routes_1 = require("./modules/refresh/refresh.routes");
// internal services routes responsible for internal communications between services
const internalVerifyToken_routes_1 = require("./internal-services-routes/internal-routes/internalVerifyToken.routes");
const internalSelectUser_routes_1 = require("./internal-services-routes/internal-routes/internalSelectUser.routes");
const users_routes_1 = require("./modules/users/users.routes");
const redis_plugin_1 = __importDefault(require("./plugins/redis.plugin"));
const prisma_plugin_1 = require("./plugins/prisma.plugin");
const requestLogger_plugin_1 = __importDefault(require("./plugins/requestLogger.plugin"));
/* ************************************************************************** */
// register the Fastify framework
const app = (0, fastify_1.default)({ logger: true });
// // Register cookie plugin
app.register(cookie_1.default, {
    secret: process.env.COOKIE_SECRET || 'supersecret', // optionnel (pour signer les cookies)
});
// Register plugins (database, redis, etc.)
// app.register(vaultPlugin);
app.register(prisma_plugin_1.prismaPlugin);
app.register(redis_plugin_1.default);
app.register(requestLogger_plugin_1.default);
app.register(multipart_1.default, {
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
        files: 1, // Maximum number of files
    },
    attachFieldsToBody: true,
});
// Serve static files from the "uploads" directory
app.register(static_1.default, {
    root: path_1.default.join(process.cwd(), 'uploads'),
    prefix: '/uploads/',
});
console.log("===============================================", process.env);
// console.log('🚀 Loading secrets from Vault...', process.env.TOTO);
// Register routes
app.register(auth_routes_1.authRoutes, { prefix: '/user/auth' });
app.register(oauth_routes_1.oauthRoutes, { prefix: '/user/oauth' });
app.register(refresh_routes_1.refreshRoutes, { prefix: '/user/auth' });
app.register(auth_routes_1.userRoutes, { prefix: '/user' });
app.register(signout_routes_1.signoutRoutes, { prefix: '/user/auth' });
app.register(twoFactor_routes_1.TwoFactorAuth, { prefix: '/user/2fa' });
// app.register(internalServicesRoutes, { prefix: '/internal' }); warnning mergre conflict
// Register internals routes
app.register(internalVerifyToken_routes_1.internalVerifyTokenRoutes, { prefix: '/internal' });
app.register(internalSelectUser_routes_1.internalSelectUserRoutes, { prefix: '/internalUser' });
app.register(users_routes_1.infoFriendRoute);
// Start the Fastify server
const start = async () => {
    try {
        // Register CORS plugin to allow cross-origin requests  
        // need more testing/!\
        const originURL = `${process.env.ORIGIN_URL}`;
        await app.register(cors_1.default, {
            // reel origin is originURL
            origin: [originURL, 'http://localhost:3000'], // Allow specific origins
            methods: ['GET', 'POST', 'OPTIONS'], // Allow specific methods
            credentials: true, // Allow credentials
        });
        await app.listen({ port: 4000, host: '0.0.0.0' });
        console.log('🚀 Server is running');
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
