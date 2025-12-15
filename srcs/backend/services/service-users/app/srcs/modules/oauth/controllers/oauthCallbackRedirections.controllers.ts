/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauthCallbackRedirections.controllers.ts           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/10 17:57:40 by tissad            #+#    #+#             */
/*   Updated: 2025/12/15 16:48:35 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyReply, FastifyRequest } from "fastify";
import { JwtUtils } from "../../../utils/jwt.utils";
import { UsersService } from "../../users/users.services";
import {LoginResponseDTO} from "../../../types/user.types";

const originUrl = `${process.env.ORIGIN_URL}`;
// OAuth callback redirection handler
export async function oauthCallbackRedirectionController(   
    request: FastifyRequest,
    reply: FastifyReply
) {
    const redisClient = request.server.redis;
    const userService = new UsersService(request.server.prisma);
    const cookies = JwtUtils.extractCookiesFromRequest(request);
    console.log("[COLLBACK.controller.ts] Cookies extracted from request:", cookies);
    const tempToken = JwtUtils.extractTokenFromCookies(cookies, 'temp_token');
    console.log("[COLLBACK.controller.ts] Temp token extracted from cookies:", tempToken);
    const user = JwtUtils.extractUserFromTempToken(tempToken);
    if (tempToken === null || user === null) {
      console.error("❌ [CALLBACK.ts] User not found");
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
    reply.redirect(originUrl);
}