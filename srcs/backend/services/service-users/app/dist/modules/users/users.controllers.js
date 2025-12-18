"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.controllers.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 15:29:01 by glions            #+#    #+#             */
/*   Updated: 2025/12/01 12:14:15 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInfoFriendController = getInfoFriendController;
const users_services_1 = require("../users/users.services");
const jwt_utils_1 = require("../../utils/jwt.utils");
/***********************************/
/*     User Controllers            */
/***********************************/
async function getInfoFriendController(request, reply) {
    try {
        // CHECK TOCKEN //
        const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(request);
        const access_token = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'access_token');
        const user = jwt_utils_1.JwtUtils.extractUserFromAccessToken(access_token);
        if (!user)
            return (reply.code(401).send({ success: false, message: "User pas reconnu" }));
        const { username } = request.query;
        if (!username)
            return (reply.code(400).send({ success: false, message: "Parametre username manquant" }));
        const service = new users_services_1.UsersService(request.server.prisma);
        const response = await service.getInfoFriendService(username);
        // SUCCESS //
        return (reply.code(200).send({ success: true, data: response }));
    }
    catch (err) {
        // ERRORS //
        console.error("/!\\ GET INFO FRIEND ERROR /!\\", err);
        return (reply.code(400).send({ success: false, message: err.message || "Server error" }));
    }
}
