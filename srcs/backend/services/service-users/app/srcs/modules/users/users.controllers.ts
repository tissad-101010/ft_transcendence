/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.controllers.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 15:29:01 by glions            #+#    #+#             */
/*   Updated: 2025/11/28 17:11:14 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyReply, FastifyRequest } from 'fastify';

import { UsersService } from '../users/users.services';
import { CredentialUtils } from '../../utils/credential.utils';
import { JwtUtils } from '../../utils/jwt.utils';

/***********************************/
/*     User Controllers            */
/***********************************/

export async function getInfoFriendController(
    request: FastifyRequest<{ Querystring: { username: string } }>,
    reply: FastifyReply
)
{
    try
    {
        // CHECK TOCKEN //
        const cookies = JwtUtils.esxtractCookiesFromRequest(request);
        const access_token = JwtUtils.extractTokenFromCookies(cookies, 'access_token');
        const user = JwtUtils.extractUserFromAccessToken(access_token);
        if (!user)
            return (reply.code(401).send({success: false, message: "User pas reconnu"}));
        
        const { username } = request.query;
        if (!username)
            return (reply.code(400).send({success: false, message: "Parametre username manquant"}));
        const service = new UsersService(request.server.prisma);
        const response = await service.getInfoFriendService(username);
        // SUCCESS //
        return (reply.code(200).send({success: true, data: response}));
    } catch (err: any)
    {
        // ERRORS //
        console.error("/!\\ GET INFO FRIEND ERROR /!\\", err);
        return (reply.code(400).send({success: false, message: err.message || "Server error"}));
    }
}