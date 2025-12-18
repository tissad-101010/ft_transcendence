"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   signout.controllers.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 12:59:59 by tissad            #+#    #+#             */
/*   Updated: 2025/11/24 17:49:43 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.signoutController = signoutController;
const signout_services_1 = require("./signout.services");
const jwt_utils_1 = require("../../utils/jwt.utils");
/***********************************/
/*   Signout Controller Class      */
/***********************************/
async function signoutController(request, reply) {
    console.log('[Signout Controller] Received logout request');
    const signoutService = new signout_services_1.SignoutService(request.server);
    const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(request);
    const refresh_Token = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'refresh_token');
    const user = jwt_utils_1.JwtUtils.extractUserFromRefreshToken(refresh_Token);
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
        reply.clearCookie('temp_token', { path: '/' });
        return reply.code(200).send({ message: 'Logout successful ✅' });
        // reply.code(200).send({ message: 'Logout successful ✅' });
    }
    catch (error) {
        console.error('[Signout Controller] Error processing logout request:', error);
        return reply.code(500).send({ message: 'Internal server error ❌' });
    }
}
