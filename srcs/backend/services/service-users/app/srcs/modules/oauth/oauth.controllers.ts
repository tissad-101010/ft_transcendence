/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauth.controllers.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:03 by tissad            #+#    #+#             */
/*   Updated: 2025/10/28 16:16:14 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


/***********************************/
/*    OAuth Controllers           */
/***********************************/
import { FastifyReply, FastifyRequest } from "fastify";
import { OauthService } from "./oauth.services";

export async function googleOAuthController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const code = (request.query as any).code;
    const oauthService = new OauthService(request.server.prisma);
    try {
        const profile = await oauthService.handleGoogleOAuth(code);
        return reply.code(200).send(profile);
    }
    catch (error) {
        console.log("[OAuth Controller] Google OAuth error:", error);
        return reply.code(500).send({ message: "Google OAuth failed" });
    }
}