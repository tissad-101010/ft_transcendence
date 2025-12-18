"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.routes.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:38 by tissad            #+#    #+#             */
/*   Updated: 2025/12/10 11:39:54 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
exports.userRoutes = userRoutes;
const auth_controllers_1 = require("./auth.controllers");
/***********************************/
/*        Auth Routes Setup        */
/***********************************/
async function authRoutes(server) {
    // Register the POST route for user signup
    server.post('/signup', auth_controllers_1.signupController);
    server.post('/signin', auth_controllers_1.signinController);
}
// user routes
async function userRoutes(server) {
    // Define user-related routes here
    server.get('/profile', {}, auth_controllers_1.getProfileController);
    //pre-handler to verify token is valid aythentication middleware is called before the controller
    // change password
    server.post('/change-password', auth_controllers_1.changePasswordController);
    server.post('/upload-avatar', auth_controllers_1.uploadAvatarController);
}
