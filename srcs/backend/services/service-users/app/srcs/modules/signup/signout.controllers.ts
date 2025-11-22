/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   signout.controllers.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: issad <issad@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 12:59:59 by tissad            #+#    #+#             */
/*   Updated: 2025/11/22 11:50:16 by issad            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyRequest, FastifyReply } from 'fastify';
import { SignoutService } from './signout.services';
import { JwtUtils } from '../../utils/jwt.utils';
import { FastifyCookie } from '@fastify/cookie/types/plugin';

/***********************************/
/*   Signout Controller Class      */
/***********************************/



export async function signoutController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    console.log('[Signout Controller] Received logout request');
    const signoutService = new SignoutService(request.server);
    const cookies = JwtUtils.extractCookiesFromRequest(request);
    const refresh_Token = JwtUtils.extractTokenFromCookies(cookies, 'refresh_token');
    const user = JwtUtils.extractUserFromRefreshToken(refresh_Token);
    if (!user) {
        console.error('[Signout Controller] Unauthorized: No valid user found in request');
        return reply.code(401).send({ message: 'Unauthorized ❌' });
    }
    try {
        const logoutSuccess = await signoutService.logoutUser(user.userId);
        if (!logoutSuccess) {
            console.error('[Signout Controller] Error during logout process for user ID:', user.userId);
            return reply.code(500).send({ message: 'Error during logout ❌' });
        }
        console.log('[Signout Controller] User logged out successfully, clearing cookies for user ID:', user.userId);
        // Clear cookies
        reply.clearCookie('access_token', { path: '/' });
        reply.clearCookie('refresh_token', { path: '/' });
        return reply.code(200).send({ message: 'Logout successful ✅' });
        // reply.code(200).send({ message: 'Logout successful ✅' });
    } catch (error) {
        console.error('[Signout Controller] Error processing logout request:', error);
        return reply.code(500).send({ message: 'Internal server error ❌' });
    }
}
