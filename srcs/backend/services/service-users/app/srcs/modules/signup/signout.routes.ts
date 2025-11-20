/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   signout.routes.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 13:02:38 by tissad            #+#    #+#             */
/*   Updated: 2025/11/20 14:20:18 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyInstance } from 'fastify';
import { signoutController } from './signout.controllers';



/***********************************/
/*        Signout Routes           */
/***********************************/

export async function signoutRoutes(server: FastifyInstance): Promise<void> {
    server.post('/logout', signoutController);
}
    