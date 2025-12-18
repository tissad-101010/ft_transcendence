"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   refresh.routes.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/10 14:36:52 by tissad            #+#    #+#             */
/*   Updated: 2025/12/10 14:37:35 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshRoutes = refreshRoutes;
const refresh_controllers_1 = require("./refresh.controllers");
// define refresh token route
async function refreshRoutes(app) {
    app.post('/refresh', refresh_controllers_1.refreshTokenController);
}
