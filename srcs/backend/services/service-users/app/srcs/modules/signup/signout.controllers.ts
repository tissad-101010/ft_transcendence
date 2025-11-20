/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   signout.controllers.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 12:59:59 by tissad            #+#    #+#             */
/*   Updated: 2025/11/20 14:22:45 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyRequest, FastifyReply } from 'fastify';
import { SignoutService } from './signout.services';
import { JwtUtils } from '../../utils/jwt.utils';

/***********************************/
/*   Signout Controller Class      */
/***********************************/



export async function signoutController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    console.log('[Signout Controller] Received logout request');
    const signoutService = new SignoutService(request.server);
    const cookies = JwtUtils.esxtractCookiesFromRequest(request);
    const access_token = JwtUtils.extractTokenFromCookies(cookies, 'access_token');
    const user = JwtUtils.extractUserFromAccessToken(access_token);
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
        return reply.code(200).redirect('https://localhost:8443').send({ message: 'Logged out successfully ✅' });
    } catch (error) {
        console.error('[Signout Controller] Error processing logout request:', error);
        return reply.code(500).send({ message: 'Internal server error ❌' });
    }
}
