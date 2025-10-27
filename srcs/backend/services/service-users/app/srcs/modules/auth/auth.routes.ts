/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.routes.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:38 by tissad            #+#    #+#             */
/*   Updated: 2025/10/27 16:52:25 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {    signupController,
            signinController,
            getProfileController,
        } from './auth.controllers';

/***********************************/
/*        Auth Routes Setup        */
/***********************************/
import { FastifyInstance } from 'fastify';
import { SignupUserDTO,
         LoginUserDTO,
    } from '../../types/user.types';


export async function authRoutes(server: FastifyInstance)
{
    // Register the POST route for user signup
    server.post<{ Body: SignupUserDTO }>('/signup', signupController);
    server.post<{ Body:  LoginUserDTO}>('/signin', signinController);
    server.get('/me', getProfileController);//pre-handler to verify token is valid aythentication middleware is called before the controller
}
