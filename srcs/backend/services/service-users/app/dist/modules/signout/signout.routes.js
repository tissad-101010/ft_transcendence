"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   signout.routes.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 13:02:38 by tissad            #+#    #+#             */
/*   Updated: 2025/11/20 14:20:18 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.signoutRoutes = signoutRoutes;
const signout_controllers_1 = require("./signout.controllers");
/***********************************/
/*        Signout Routes           */
/***********************************/
async function signoutRoutes(server) {
    server.post('/logout', signout_controllers_1.signoutController);
}
