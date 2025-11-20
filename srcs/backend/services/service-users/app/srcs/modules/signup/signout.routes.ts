/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   signout.routes.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 13:02:38 by tissad            #+#    #+#             */
/*   Updated: 2025/11/20 13:08:14 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyInstance } from 'fastify';
import { SignoutController } from './signout.controllers';



/***********************************/
/*        Signout Routes           */
/***********************************/

export async function signoutRoutes(server: FastifyInstance): Promise<void> {
    const signoutController = new SignoutController(server);
    server.post('/logout', signoutController.logoutHandler(server));
}
    