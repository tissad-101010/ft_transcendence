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


import { FastifyReply, FastifyRequest } from 'fastify';
import { UsersService } from '../users/users.services';
import { JwtUtils } from '../../utils/jwt.utils';


// refresh token controller to handle refresh token requests
export async function refreshTokenController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    // redis client and user service instances
    const redisClient = request.server.redis;
    // access to the database via user service
    const userService = new UsersService(request.server.prisma);

    // get incoming refresh token from cookies
    const incomingCookies = JwtUtils.extractCookiesFromRequest(request);
    if (!incomingCookies) {
        console.error('[Refresh Token Controller] No cookies found in request');
        return reply.code(401).send({ message: 'Unauthorized ❌', refreshComplete: false });
    }
    const incomingRefreshToken = JwtUtils.extractTokenFromCookies(incomingCookies, 'refresh_token');
    // validate incoming refresh token and extract user info
    if (!incomingRefreshToken) {
        console.error('[Refresh Token Controller] No refresh token found in cookies');
        return reply.code(401).send({ message: 'Unauthorized ❌', refreshComplete: false });
    }
    const incomingUserId = JwtUtils.extractUserFromRefreshToken(incomingRefreshToken)?.userId;
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
        const newAccessToken = JwtUtils.generateAccessToken({ id: user.id, email: user.email });    
        const newRefreshToken = JwtUtils.generateRefreshToken({ id: user.id, email: user.email });
        if (!newAccessToken || !newRefreshToken) {
            console.error('[Refresh Token Controller] Failed to generate new tokens');
            return reply.code(500).send({ message: 'Failed to generate new tokens ❌', refreshComplete: false });
        }
        // store refresh token in redis cache
        await redisClient.set(
            `refresh_token:${newRefreshToken}`,
            user.id,
            'EX',
            process.env.REFRESH_TOKEN_EXPIRY_SECONDS || 60 * 60 * 24 * 7// 7 days
        );
        await redisClient.set(
            `access_token:${user.id}`,
            newAccessToken,
            'EX',
            process.env.ACCESS_TOKEN_EXPIRY_SECONDS || 15 * 60 // 15 minutes
        );
        // set new JWT cookies
        JwtUtils.setRefreshTokenCookie(reply, newRefreshToken);
        JwtUtils.setAccessTokenCookie(reply, newAccessToken)
        return reply.code(200).send({
            message: 'Token refresh successful',
            refreshComplete: true,
        });
    } catch (error) {
        console.error('[Refresh Token Controller] Error during token refresh:', error);
        return reply.code(500).send({
            message: 'Internal server error during token refresh',
            refreshComplete: false,
        });
    }
}