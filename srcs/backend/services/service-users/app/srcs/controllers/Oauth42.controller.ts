/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Oauth42.controller.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/21 13:55:16 by tissad            #+#    #+#             */
/*   Updated: 2025/10/21 14:31:45 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyRequest, FastifyReply } from 'fastify';
import { Oauth42Service } from '../services/Oauth42.service';
const clientId = process.env.FORTYTWO_CLIENT_ID!;
const redirectUri = process.env.FORTYTWO_REDIRECT_URI!;

export async function fortyTwoProviderRedirect(req: FastifyRequest, reply: FastifyReply) {
    if (!clientId || !redirectUri) {
        throw new Error("Missing 42 OAuth configuration");
    }
    // Redirige vers 42
const fortyTwoAuthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}` +
                        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                        `&response_type=code&scope=public`;

    console.log("[Oauth42.controller] Redirecting to:", fortyTwoAuthUrl);
    return reply.redirect(fortyTwoAuthUrl);
}

export async function fortyTwoCallback(req: FastifyRequest, reply: FastifyReply) {
    const code = (req.query as any).code;
    const fortyTwoService = new Oauth42Service(req.server.db);
    try {
        
        const token = await fortyTwoService.getAccessToken(code);
        const profile = await fortyTwoService.get42Profile(token);
        const user = await fortyTwoService.findOrCreateUser(profile);

        // On convertit le user en chaîne JSON encodée
        const userString = encodeURIComponent(JSON.stringify(user));
        console.log("[Oauth42.controller] User authenticated:", user);
        // Redirige vers le front
        return reply.redirect(`https://localhost:8443/2fa`);
    } catch (err: any) {
        req.log.error(err);
        return reply.status(500).send({ error: err.message });
    }       
}