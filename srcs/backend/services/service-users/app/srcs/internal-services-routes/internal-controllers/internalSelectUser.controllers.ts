/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   internalSelectUser.controllers.ts                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/22 01:25:24 by glions            #+#    #+#             */
/*   Updated: 2025/11/24 17:33:46 by glions           ###   ########.fr       */
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
        const response = await service.getUserByUsername(name);
        if (!response)
            return (reply.code(404).send({success: false, message: "User not found"}));
        const data : UserInfo = {
            id: response.id,
            username: response.username,
            lastLogin: response.lastLogin,
            avatarUrl: response.avatarUrl,
            createdAt: response.createdAt
        };  
        // SUCCESS
        return (reply.code(200).send({success: true, data: data}));
    } catch (error: unknown)
    {
        console.error('/!\\ INTERNAL SELECT USER USERNAME ERROR /!\\', error);
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

async function byId(id: string, service: UsersService, reply: FastifyReply)
{
    // CHECK TOKEN (à voir avec Tahar si nécessaire dans user aussi) //
    // CALL SERVICE //
    try {
        const response = await service.getUserById(id);
        if (!response)
            return (reply.code(404).send({success: false, message: "User not found"}));
        const data : UserInfo = {
            id: response.id,
            username: response.username,
            lastLogin: response.lastLogin,
            avatarUrl: response.avatarUrl,
            createdAt: response.createdAt
        };
        // SUCCESS
        return (reply.code(200).send({success: true, data: data}));
    } catch (error: unknown)
    {
        console.error('/!\\ INTERNAL SELECT USER ID ERROR /!\\', error);
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
    req: FastifyRequest<{Querystring: {username: string, id: string}}>,
    reply: FastifyReply
)   
{
    // PARSING QUERY //
    const { username, id } = req.query;
    // CREATE SERVICE
    const service = new UsersService(req.server.prisma);
    // WICH CONTROLLER //
    if (username) return (byUsername(username, service, reply));
    if (id) return (byId(id, service, reply));
    // QUERY INVALID //
    return (reply.status(400).send("Paramètre manquant ou invalide"));
}