/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   google.routes.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/20 17:58:25 by tissad            #+#    #+#             */
/*   Updated: 2025/10/20 19:26:39 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyInstance } from 'fastify';
import { googleLogin, googleCallback } from '../controllers/google.controller';

export async function googleRoutes(fastify: FastifyInstance) {
    // Étape 1 : redirection vers Google
    fastify.get('/google', googleLogin);
    // Étape 2 : callback reçu depuis Google
    fastify.get('/google/callback', googleCallback);
}