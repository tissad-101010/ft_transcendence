"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   refresh.controllers.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/10 11:39:49 by tissad            #+#    #+#             */
/*   Updated: 2025/12/10 14:41:02 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenController = refreshTokenController;
const users_services_1 = require("../users/users.services");
const jwt_utils_1 = require("../../utils/jwt.utils");
// refresh token controller to handle refresh token requests
async function refreshTokenController(request, reply) {
    // redis client and user service instances
    const redisClient = request.server.redis;
    // access to the database via user service
    const userService = new users_services_1.UsersService(request.server.prisma);
    // get incoming refresh token from cookies
    const incomingCookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(request);
    if (!incomingCookies) {
        console.error('[Refresh Token Controller] No cookies found in request');
        return reply.code(401).send({ message: 'Unauthorized ❌', refreshComplete: false });
    }
    const incomingRefreshToken = jwt_utils_1.JwtUtils.extractTokenFromCookies(incomingCookies, 'refresh_token');
    // validate incoming refresh token and extract user info
    if (!incomingRefreshToken) {
        console.error('[Refresh Token Controller] No refresh token found in cookies');
        return reply.code(401).send({ message: 'Unauthorized ❌', refreshComplete: false });
    }
    const incomingUserId = jwt_utils_1.JwtUtils.extractUserFromRefreshToken(incomingRefreshToken)?.userId;
    if (!incomingUserId) {
        console.error('[Refresh Token Controller] No refresh token found in request cookies');
        return reply.code(401).send({ message: 'Unauthorized ❌', refreshComplete: false });
    }
    try {
        // check if refresh token is valid in redis cache
        const userId = await redisClient.get(`refresh_token:${incomingRefreshToken}`);
        if (!userId) {
            console.error('[Refresh Token Controller] Unauthorized: Refresh token not found or mismatch in cache');
            return reply.code(401).send({ message: 'Unauthorized ❌', refreshComplete: false });
        }
        if (userId !== incomingUserId) {
            console.error('[Refresh Token Controller] Unauthorized: User ID mismatch');
            return reply.code(401).send({ message: 'Unauthorized ❌', refreshComplete: false });
        }
        // fetch user from database
        const user = await userService.getUserById(incomingUserId);
        if (!user) {
            console.error('[Refresh Token Controller] User not found in database');
            return reply.code(404).send({ message: 'User not found ❌', refreshComplete: false });
        }
        // refresh the tokens
        const newAccessToken = jwt_utils_1.JwtUtils.generateAccessToken({ id: user.id, email: user.email });
        const newRefreshToken = jwt_utils_1.JwtUtils.generateRefreshToken({ id: user.id, email: user.email });
        if (!newAccessToken || !newRefreshToken) {
            console.error('[Refresh Token Controller] Failed to generate new tokens');
            return reply.code(500).send({ message: 'Failed to generate new tokens ❌', refreshComplete: false });
        }
        // store refresh token in redis cache
        await redisClient.set(`refresh_token:${newRefreshToken}`, user.id, 'EX', process.env.REFRESH_TOKEN_EXPIRY_SECONDS || 60 * 60 * 24 * 7 // 7 days
        );
        await redisClient.set(`access_token:${user.id}`, newAccessToken, 'EX', process.env.ACCESS_TOKEN_EXPIRY_SECONDS || 15 * 60 // 15 minutes
        );
        // set new JWT cookies
        jwt_utils_1.JwtUtils.setRefreshTokenCookie(reply, newRefreshToken);
        jwt_utils_1.JwtUtils.setAccessTokenCookie(reply, newAccessToken);
        return reply.code(200).send({
            message: 'Token refresh successful',
            refreshComplete: true,
        });
    }
    catch (error) {
        console.error('[Refresh Token Controller] Error during token refresh:', error);
        return reply.code(500).send({
            message: 'Internal server error during token refresh',
            refreshComplete: false,
        });
    }
}
