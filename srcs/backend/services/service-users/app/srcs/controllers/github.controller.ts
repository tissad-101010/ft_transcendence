/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   github.controller.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/17 16:56:20 by tissad            #+#    #+#             */
/*   Updated: 2025/10/17 18:34:43 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyRequest, FastifyReply } from 'fastify';
import { getGithubAccessToken, getGithubUser } from '../services/github.service';

const clientId = process.env.GITHUB_CLIENT_ID!;
const redirectUri = process.env.GITHUB_REDIRECT_URI!;

export async function githubLogin(req: FastifyRequest, reply: FastifyReply) {
  // Redirige vers GitHub
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  return reply.redirect(githubAuthUrl);
}

export async function githubCallback(req: FastifyRequest, reply: FastifyReply) {
  const { code } = req.query as { code?: string };

  if (!code) {
    return reply.status(400).send({ error: 'Missing "code" in callback URL' });
  }

  try {
    // Échange du code contre un access_token
    const tokenData = await getGithubAccessToken(code);

    if (!tokenData.access_token) {
      return reply.status(400).send({ error: 'Failed to get access token', details: tokenData });
    }

    // Récupération du profil utilisateur GitHub
    const githubUser = await getGithubUser(tokenData.access_token);

    console.log('✅ GitHub user:', githubUser);

    // 👉 Ici tu peux soit créer, soit connecter l’utilisateur dans ta DB
    // Exemple :
    // const user = await userService.findOrCreateByGithubId(githubUser);

    // Pour tester, on renvoie le profil brut
    return reply.send({ githubUser });
  } catch (err) {
    console.error('❌ Error in GitHub callback:', err);
    return reply.status(500).send({ error: 'Internal error during GitHub auth' });
  }
}
