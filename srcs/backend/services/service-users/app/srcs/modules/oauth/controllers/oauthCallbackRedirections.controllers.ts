/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauthCallbackRedirections.controllers.ts           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/10 17:57:40 by tissad            #+#    #+#             */
/*   Updated: 2025/12/10 18:15:29 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyReply, FastifyRequest } from "fastify";
import { JwtUtils } from "../../../utils/jwt.utils";
import { UsersService } from "../../users/users.services";
import {LoginResponseDTO} from "../../../types/user.types";

// OAuth callback redirection handler
export async function oauthCallbackRedirectionController(   
    request: FastifyRequest,
    reply: FastifyReply
) {
    const redisClient = request.server.redis;
    const userService = new UsersService(request.server.prisma);
    const cookies = JwtUtils.extractCookiesFromRequest(request);
    console.log("[2fa.controller.ts] Cookies extracted from request:", cookies);
    const tempToken = JwtUtils.extractTokenFromCookies(cookies, 'temp_token');
    console.log("[2fa.controller.ts] Temp token extracted from cookies:", tempToken);
    const user = JwtUtils.extractUserFromTempToken(tempToken);
    if (tempToken === null || user === null) {
      console.error("❌ [2fa.controller.ts] User not found");
      return reply.status(401).send({ message: "Unauthorized ❌" });
    }
    const userId  = user.userId;
    const email   = user.email;
    const twoFactorMethods = await userService.getUserTwoFactorMethods(userId);
    const isTwoFactorEnabled = twoFactorMethods.length > 0;
    if ( isTwoFactorEnabled ) {
        console.log("User has 2FA enabled, redirecting to 2FA page");
        const temp_token = JwtUtils.generateTwoFactorTempToken({ id: userId, email: email });

        JwtUtils.setTempTokenCookie(reply, temp_token);
        // add playload to temp token
        const responseData: LoginResponseDTO = {
            message: "Google OAuth successful t2fa required",
            signinComplete: true,
            twoFactorRequired: isTwoFactorEnabled,
            methodsEnabled: twoFactorMethods|| [],
        }; 
        return reply.code(200).send(responseData);
    }
    // Successful authentication
    // generate JWT tokens
    // 2FA not enabled, proceed with normal authentication
    // generate JWT tokens
    const accessToken = JwtUtils.generateAccessToken({ id: userId, email: email });
    const refreshToken = JwtUtils.generateRefreshToken({ id: userId, email: email });
    
    // store refresh token in redis cache
    await redisClient.set(
        `refresh_token:${refreshToken}`,
        userId,
        'EX',
        60 * 60 * 24 * 7
    );

    // store access token in redis cache (optional)
    await redisClient.set(
        `access_token:${userId}`,
        accessToken,
        'EX',
        60 * 15
    );
    // set cookies
    JwtUtils.setAccessTokenCookie(reply, accessToken);
    JwtUtils.setRefreshTokenCookie(reply, refreshToken);

    console.log("OAuth successful for user ID:", userId);
    return reply.code(200).send({
        message: "OAuth successful",
        signinComplete: true,
        twoFactorRequired: isTwoFactorEnabled,
        methodsEnabled: twoFactorMethods || [],
    });
}