/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Oauth42.routes.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/21 13:57:27 by tissad            #+#    #+#             */
/*   Updated: 2025/10/21 14:18:58 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyInstance } from 'fastify';
import { fortyTwoProviderRedirect, fortyTwoCallback } from '../controllers/Oauth42.controller';

export async function oauth42Routes(fastify: FastifyInstance) {
    fastify.get('/42', fortyTwoProviderRedirect);
    fastify.get('/42/callback', fortyTwoCallback);
}
