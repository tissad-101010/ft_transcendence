/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauth.controllers.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:03 by tissad            #+#    #+#             */
/*   Updated: 2025/10/30 10:09:29 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


/***********************************/
/*    OAuth Controllers           */
/***********************************/
import { FastifyReply, FastifyRequest } from "fastify";
import { OauthService } from "./oauth.services";

const clientId = process.env.GOOGLE_CLIENT_ID!; 
const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

export async function googleProviderRedirect(req: FastifyRequest, reply: FastifyReply) {
    // Redirect user to Google's OAuth 2.0 consent screen
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
    return reply.redirect(googleAuthUrl);
}

export async function googleOAuthControllerCallback(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const code = (request.query as any).code;
    const oauthService = new OauthService(request.server.prisma);
    try {
        const user = await oauthService.handleGoogleOAuth(code);
        return reply.code(200).send(user);
    }
    catch (error) {
        console.log("[OAuth Controller] Google OAuth error:", error);
        return reply.code(500).send({ message: "Google OAuth failed" });
    }
}