"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauthCallbackRedirections.controllers.ts           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/10 17:57:40 by tissad            #+#    #+#             */
/*   Updated: 2025/12/17 17:18:33 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthCallbackRedirectionController = oauthCallbackRedirectionController;
const jwt_utils_1 = require("../../../utils/jwt.utils");
const users_services_1 = require("../../users/users.services");
const originUrl = `${process.env.ORIGIN_URL}`;
// OAuth callback redirection handler
async function oauthCallbackRedirectionController(request, reply) {
    const redisClient = request.server.redis;
    const userService = new users_services_1.UsersService(request.server.prisma);
    const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(request);
    console.log("[COLLBACK.controller.ts] Cookies extracted from request:", cookies);
    const tempToken = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'temp_token');
    console.log("[COLLBACK.controller.ts] Temp token extracted from cookies:", tempToken);
    const user = jwt_utils_1.JwtUtils.extractUserFromTempToken(tempToken);
    if (tempToken === null || user === null) {
        console.error("❌ [CALLBACK.ts] User not found");
        return reply.status(401).send({ message: "Unauthorized ❌" });
    }
    const userId = user.userId;
    const email = user.email;
    const twoFactorMethods = await userService.getUserTwoFactorMethods(userId);
    const isTwoFactorEnabled = twoFactorMethods.length > 0;
    if (isTwoFactorEnabled) {
        console.log("User has 2FA enabled, redirecting to 2FA page");
        const temp_token = jwt_utils_1.JwtUtils.generateTwoFactorTempToken({ id: userId, email: email });
        jwt_utils_1.JwtUtils.setTempTokenCookie(reply, temp_token);
        // add playload to temp token
        const responseData = {
            message: "Google OAuth successful t2fa required",
            signinComplete: true,
            twoFactorRequired: isTwoFactorEnabled,
            methodsEnabled: twoFactorMethods || [],
        };
        return reply.code(200).send(responseData);
    }
    reply.redirect(originUrl);
}
