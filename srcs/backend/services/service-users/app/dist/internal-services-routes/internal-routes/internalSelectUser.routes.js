"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   internalSelectUser.routes.ts                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/22 01:44:54 by glions            #+#    #+#             */
/*   Updated: 2025/12/01 11:52:14 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalSelectUserRoutes = internalSelectUserRoutes;
const internalSelectUser_controllers_1 = require("../internal-controllers/internalSelectUser.controllers");
async function internalSelectUserRoutes(app) {
    app.get('/user', internalSelectUser_controllers_1.internalSelectUserController);
}
;
