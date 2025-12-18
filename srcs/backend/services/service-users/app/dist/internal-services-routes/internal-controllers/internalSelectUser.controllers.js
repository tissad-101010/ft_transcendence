"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   internalSelectUser.controllers.ts                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/22 01:25:24 by glions            #+#    #+#             */
/*   Updated: 2025/11/26 17:02:23 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalSelectUserController = internalSelectUserController;
const users_services_1 = require("../../modules/users/users.services");
const users_error_1 = require("../../errors/users.error");
async function byUsername(name, service, reply) {
    // CHECK TOKEN (à voir avec Tahar si nécessaire dans user aussi) //
    // CALL SERVICE //
    try {
        const response = await service.getUserByUsername(name);
        if (!response)
            return (reply.code(404).send({ success: false, message: "User not found" }));
        const data = {
            id: response.id,
            username: response.username,
            lastLogin: response.lastLogin,
            avatarUrl: response.avatarUrl,
            createdAt: response.createdAt
        };
        // SUCCESS //
        return (reply.code(200).send({ success: true, data: data }));
    }
    catch (error) {
        console.error('/!\\ INTERNAL SELECT USER USERNAME ERROR /!\\', error);
        // USER NOT FOUND //
        if (error instanceof users_error_1.UserNotFoundError)
            return (reply.code(404).send({ success: false, message: error.message }));
        // DATABASE ERROR //
        if (error instanceof users_error_1.DataBaseConnectionError)
            return (reply.code(503).send({ success: false, message: "Database temporarily unavailable" }));
        // OTHER ERROR //
        return reply.code(500).send({ success: false, message: 'Internal server error' });
    }
}
async function byId(id, service, reply) {
    // CHECK TOKEN (à voir avec Tahar si nécessaire dans user aussi) //
    // CALL SERVICE //
    try {
        const response = await service.getUserById(id);
        if (!response)
            return (reply.code(404).send({ success: false, message: "User not found" }));
        const data = {
            id: response.id,
            username: response.username,
            lastLogin: response.lastLogin,
            avatarUrl: response.avatarUrl,
            createdAt: response.createdAt
        };
        // SUCCESS
        return (reply.code(200).send({ success: true, data: data }));
    }
    catch (error) {
        console.error('/!\\ INTERNAL SELECT USER ID ERROR /!\\', error);
        // USER NOT FOUND
        if (error instanceof users_error_1.UserNotFoundError)
            return (reply.code(404).send({ success: false, message: error.message }));
        // DATABASE ERROR
        if (error instanceof users_error_1.DataBaseConnectionError)
            return (reply.code(503).send({ success: false, message: "Database temporarily unavailable" }));
        // OTHER ERROR //
        return reply.code(500).send({ success: false, message: 'Internal server error' });
    }
}
async function internalSelectUserController(req, reply) {
    // PARSING QUERY //
    const { username, id } = req.query;
    // CREATE SERVICE
    const service = new users_services_1.UsersService(req.server.prisma);
    // WICH CONTROLLER //
    if (username)
        return (byUsername(username, service, reply));
    if (id)
        return (byId(id, service, reply));
    // QUERY INVALID //
    return (reply.status(400).send("Paramètre manquant ou invalide"));
}
