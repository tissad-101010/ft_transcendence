/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.routes.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:38 by tissad            #+#    #+#             */
/*   Updated: 2025/12/01 11:53:32 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {  FastifyInstance } from 'fastify';
import {    signupController,
            signinController,
            getProfileController,
            refreshTokenController,
            changePasswordController,
            uploadAvatarController
        } from './auth.controllers';
import {    SignupUserDTO,
            LoginUserDTO,
        } from '../../types/user.types';

/***********************************/
/*        Auth Routes Setup        */
/***********************************/


export async function authRoutes(server: FastifyInstance)
{
    // Register the POST route for user signup
    server.post<{ Body: SignupUserDTO }>('/signup', signupController);
    server.post<{ Body: LoginUserDTO }>('/signin', signinController);
    server.post('/refresh', refreshTokenController);
}

// user routes
export async function userRoutes(server: FastifyInstance)
{
    // Define user-related routes here
    server.get('/profile', getProfileController);//pre-handler to verify token is valid aythentication middleware is called before the controller
    // change password
    server.post('/change-password', changePasswordController);
    server.post('/upload-avatar', uploadAvatarController);
}