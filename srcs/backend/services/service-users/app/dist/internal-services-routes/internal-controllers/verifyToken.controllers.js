"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   verifyToken.controllers.ts                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 14:29:49 by tissad            #+#    #+#             */
/*   Updated: 2025/12/16 14:03:50 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenController = verifyTokenController;
const internalVerifyToken_service_1 = require("../internal-services/internalVerifyToken.service");
async function verifyTokenController(req, reply) {
    console.log("--------------------- VERIFIY TOKEN APPELEE");
    const { token } = req.body;
    try {
        const result = await (0, internalVerifyToken_service_1.internalVerifyTokenService)(token);
        if (!result) {
            console.log("JE SORS ICI 1");
            return reply.status(401).send({ success: false, data: null });
        }
        console.log("JE SORS ICI 2");
        return reply.send({ success: true, data: result });
    }
    catch (err) {
        console.log("JE SORS ICI 3");
        return reply.status(401).send({ error: "Invalid token" });
    }
}
