"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   internalVerifyToken.routes.ts                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 14:40:28 by tissad            #+#    #+#             */
/*   Updated: 2025/12/01 11:52:32 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalVerifyTokenRoutes = internalVerifyTokenRoutes;
const verifyToken_controllers_1 = require("../internal-controllers/verifyToken.controllers");
async function internalVerifyTokenRoutes(app) {
    app.post("/verify-token", verifyToken_controllers_1.verifyTokenController);
}
