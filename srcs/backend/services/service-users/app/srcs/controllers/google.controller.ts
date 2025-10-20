/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   google.controller.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/20 17:57:18 by tissad            #+#    #+#             */
/*   Updated: 2025/10/20 19:35:56 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyRequest, FastifyReply } from 'fastify';
import { GoogleService } from '../services/google.service';

const clientId = process.env.GOOGLE_CLIENT_ID!; 
const redirectUri = process.env.GOOGLE_REDIRECT_URI!;

export async function googleLogin(req: FastifyRequest, reply: FastifyReply) {
    // Redirige vers Google
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
    return reply.redirect(googleAuthUrl);
}

export async function googleCallback(req: FastifyRequest, reply: FastifyReply) {
    const code = (req.query as any).code;
    const googleService = new GoogleService(req.server.db); 
    try {
        const token = await googleService.getAccessToken(code);
        const profile = await googleService.getGoogleProfile(token);
        const user = await googleService.findOrCreateUser(profile);

        // On convertit le user en chaîne JSON encodée
        const userString = encodeURIComponent(JSON.stringify(user));
        // Redirige vers le front
        return reply.redirect(`https://localhost:8443/2fa`);
    } catch (err: any) {
        req.log.error(err);
        return reply.status(500).send({ error: err.message });
    }
}