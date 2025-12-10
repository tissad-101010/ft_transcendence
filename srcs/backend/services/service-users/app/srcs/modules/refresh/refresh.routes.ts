/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   refresh.routes.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/10 14:36:52 by tissad            #+#    #+#             */
/*   Updated: 2025/12/10 14:37:35 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyInstance } from 'fastify';
import { refreshTokenController } from './refresh.controllers';

// define refresh token route
export async function refreshRoutes(app: FastifyInstance) {
    app.post('/refresh', refreshTokenController);
}