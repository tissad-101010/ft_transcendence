/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   internalSelectUser.controllers.ts                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/22 01:25:24 by glions            #+#    #+#             */
/*   Updated: 2025/11/22 21:56:48 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { UsersService } from "../../modules/users/users.services";
import { DataBaseConnectionError, UserNotFoundError } from "../../errors/users.error";

type usernameBody = {
    username: string;
}

export type UserInfo = {
    id: number;
    username: string;
    lastLogin: Date;
    avatarUrl: string;
    createdAt: string;
}

async function byUsername(name: string, service: UsersService, reply: FastifyReply)
{
    // CHECK TOKEN (à voir avec Tahar si nécessaire dans user aussi) //
    // CALL SERVICE //
    try {
        const { id, username, lastLogin, avatarUrl, createdAt} = await service.getUserByUsername(name);
        const data : UserInfo = {
            id: id,
            username: username,
            lastLogin: lastLogin,
            avatarUrl: avatarUrl,
            createdAt: createdAt
        };  
        // SUCCESS
        reply.code(200).send({success: true, data: data});
    } catch (error: unknown)
    {
        console.error('/!\\ LIST INVITATION CONTROLLER USERNAME ERROR /!\\', error);
        // USER NOT FOUND
        if (error instanceof UserNotFoundError)
            return (reply.code(404).send({success: false, message: error.message}));
        // DATABASE ERROR
        if (error instanceof DataBaseConnectionError)
            return (reply.code(503).send({success: false, message: "Database temporarily unavailable"}));
        // OTHER ERROR //
        return reply.code(500).send({ success: false, message: 'Internal server error' });
    }
}

export async function internalSelectUserController(
    req: FastifyRequest<{Querystring: {username: string}}>,
    reply: FastifyReply
)   
{
    // PARSING QUERY //
    const { username } = req.query;
    // CREATE SERVICE
    const service = new UsersService(req.server);
    // WICH CONTROLLER //
    if (username) return (byUsername(username, service, reply));
    // QUERY INVALID //
    return (reply.status(400).send("Paramètre manquant ou invalide"));
}