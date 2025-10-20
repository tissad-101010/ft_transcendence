/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   github.controller.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/17 16:56:20 by tissad            #+#    #+#             */
/*   Updated: 2025/10/20 16:28:52 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyRequest, FastifyReply } from 'fastify';
import { GithubService } from '../services/github.service';

const clientId = process.env.GITHUB_CLIENT_ID!;
const redirectUri = process.env.GITHUB_REDIRECT_URI!;

export async function githubLogin(req: FastifyRequest, reply: FastifyReply) {
  // Redirige vers GitHub
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  return reply.redirect(githubAuthUrl);
}

export async function githubCallback(req: FastifyRequest, reply: FastifyReply) {
  const code = (req.query as any).code;
  const githubService = new GithubService(req.server.db);

  try {
    const token = await githubService.getAccessToken(code);
    const profile = await githubService.getGithubProfile(token);
    const user = await githubService.findOrCreateUser(profile);

// On convertit le user en chaîne JSON encodée
const userString = encodeURIComponent(JSON.stringify(user));

// Redirige vers le front
  return reply.redirect(`https://localhost:8443/2fa`);
  } catch (err: any) {
    req.log.error(err);
    return reply.status(500).send({ error: err.message });
  }
}

