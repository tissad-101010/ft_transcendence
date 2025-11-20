/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   signout.controllers.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 12:59:59 by tissad            #+#    #+#             */
/*   Updated: 2025/11/20 13:08:49 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyRequest, FastifyReply } from 'fastify';
import { SignoutService } from './signout.services';
import { AuthenticatedUserDTO } from '../../types/user.types';

/***********************************/
/*   Signout Controller Class      */
/***********************************/

export class SignoutController {
    private signoutService: SignoutService;
    
    constructor(app: FastifyRequest) {
        this.signoutService = new SignoutService(app.server);
    }

    async logoutHandler(): Promise<void> {
        
        const user = request.user as AuthenticatedUserDTO;
        if (!user || !user.id) {
            reply.status(401).send({ message: 'Utilisateur non authentifié' });
            return;
        }   
        const result = await this.signoutService.logoutUser(user.id);
        if (result) {
            // clear cookies
            reply.clearCookie('access_Token');
            reply.clearCookie('refresh_Token'); 
            reply.status(200).send({ message: 'Déconnexion réussie' });
        }
        else {
            reply.status(500).send({ message: 'Erreur lors de la déconnexion' });
        }
    }
}