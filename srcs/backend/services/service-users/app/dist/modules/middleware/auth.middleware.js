"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.middleware.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/08 15:30:52 by tissad            #+#    #+#             */
/*   Updated: 2025/12/10 11:37:07 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtMiddleware = JwtMiddleware;
const jwt_utils_1 = require("../../utils/jwt.utils");
const users_services_1 = require("../users/users.services");
async function JwtMiddleware(request, reply) {
    try {
        const userService = new users_services_1.UsersService(request.server.prisma);
        const redisClient = request.server.redis;
        const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(request);
        // if no cookies found
        if (!cookies) {
            console.error('[Profile Controller] Unauthorized: No cookies found in request');
            return reply.code(403).send({ message: 'Forbidden no cookies❌' });
        }
        // extract access token from cookies
        const access_token = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'access_token');
        // if no access token found in cookies send 401 to refresh
        if (!access_token) {
            console.error('[Profile Controller] Unauthorized: No access token found in cookies');
            return reply.code(401).send({ message: 'Unauthorized no access token❌' });
        }
        // check if access token is valid in redis cache
        if (access_token) {
            const cachedToken = await redisClient.get(`access_token:${jwt_utils_1.JwtUtils.verifyAccessToken(access_token)?.id}`);
            // if cached token not found or mismatch, send 401
            if (!cachedToken) {
                console.error('[Profile Controller] Unauthorized: Access token not found or mismatch in cache');
                return reply.code(401).send({ message: 'Unauthorized ❌' });
            }
            else if (cachedToken !== access_token) {
                console.error('[Profile Controller] Unauthorized: Access token mismatch in cache');
                return reply.code(403).send({ message: 'Forbidden access token mismatch❌' });
            }
            else {
                console.log('Access token validated from cache');
            }
        }
        const user = jwt_utils_1.JwtUtils.extractUserFromAccessToken(access_token);
        if (!user) {
            console.error('[Profile Controller] Unauthorized: No valid user found in request');
            return reply.code(403).send({ message: 'Forbidden  access Token format❌' });
        }
        const foundUser = await userService.getUserById(user.userId);
        if (!foundUser) {
            console.error('[Profile Controller] Unauthorized: User not found');
            return reply.code(403).send({ message: 'Forbidden  user not found in DB❌' });
        }
        return user;
    }
    catch (error) {
        console.error('JWT Middleware error:', error);
        return reply.status(500).send({ message: 'Internal server error' });
    }
}
