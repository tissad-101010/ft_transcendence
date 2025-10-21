/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   OauthGithub.routes.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/17 16:56:01 by tissad            #+#    #+#             */
/*   Updated: 2025/10/21 13:50:34 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from 'fastify';
import { githubLogin, githubCallback } from '../controllers/OauthGithub.controller';

export async function githubRoutes(fastify: FastifyInstance) {
  // Étape 1 : redirection vers GitHub
  fastify.get('/github', githubLogin);

  // Étape 2 : callback reçu depuis GitHub
  fastify.get('/github/callback', githubCallback);
}

