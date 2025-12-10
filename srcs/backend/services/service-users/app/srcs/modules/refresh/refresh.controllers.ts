/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   refresh.controllers.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/10 11:39:49 by tissad            #+#    #+#             */
/*   Updated: 2025/12/10 11:39:51 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */




// refresh token controller to handle refresh token requests
export async function refreshTokenController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const redisClient = request.server.redis;
    console.log('[Refresh Token Controller] Received refresh token request');
    const authService = new AuthService(request.server);
    const incomingCookies = JwtUtils.extractCookiesFromRequest(request);
    // const incomingTempToken = JwtUtils.extractTokenFromCookies(incomingCookies, 'temp_token');
    // if (incomingTempToken) {
    //     const user = JwtUtils.extractUserFromTempToken(incomingTempToken);
    //     if (user) {
    //         console.error(`[Refresh Token Controller] Temp token belongs to user ID: ${user.userId}`);
    //         //test for refreshing tokens using temp token when user connect with oauth and 2fa is enabled
    //         return reply.send( { signinComplete: true,
    //           message?: "Tokens refreshed successfully",
    //           twoFactorRequired: true
    //           methodsEnabled?:
    //           accessToken?: string;
    //           refreshToken?: string;
    //           tempToken?: string;);
    //     } else {
    //         console.error('[Refresh Token Controller] Invalid temp token provided');
    //     }
    //     return reply.code(401).send({ message: 'Unauthorized ❌' }); 
    // }
    const incomingRefreshToken = JwtUtils.extractTokenFromCookies(incomingCookies, 'refresh_token');
    const incomingUserId = JwtUtils.extractUserFromRefreshToken(incomingRefreshToken)?.userId;
    if (!incomingRefreshToken || !incomingUserId) {
        console.error('[Refresh Token Controller] No refresh token found in request cookies');
        return reply.code(401).send({ message: 'Unauthorized ❌' });
    }
    try {
        // check if refresh token is valid in redis cache
        const userId = await redisClient.get(`refresh_token:${incomingRefreshToken}`);

        // const cachedToken = await redisClient.get(`refresh_token:${JwtUtils.verifyRefreshToken(refresh_token)?.id}`);
        
        if (!userId) {
            console.error('[Refresh Token Controller] Unauthorized: Refresh token not found or mismatch in cache');
            return reply.code(401).send({ message: 'Unauthorized ❌' });
        }else {
            console.log('======================✅ [Refresh Token Controller] Refresh token validated from cache');
        }
        
        // refresh the tokens
        const tokenResponse = await authService.refreshTokens(incomingUserId);
        if (!tokenResponse.refreshComplete) {
            console.error('[Refresh Token Controller] Refresh token invalid or expired');
            return reply.code(401).send(tokenResponse);
        }
        console.log('[Refresh Token Controller] Tokens refreshed successfully, setting new cookies');
        // set new JWT cookies
        JwtUtils.setRefreshTokenCookie(reply, tokenResponse.refreshToken!);
        JwtUtils.setAccessTokenCookie(reply, tokenResponse.accessToken!);  
        console.log('[Refresh Token Controller] New JWT cookies set successfully');
        return reply.code(200).send({
            message: tokenResponse.message,
            refreshComplete: tokenResponse.refreshComplete,
        });
    } catch (error) {
        console.error('[Refresh Token Controller] Error during token refresh:', error);
        return reply.code(500).send({
            message: 'Internal server error during token refresh',
            refreshComplete: false,
        });
    }
}