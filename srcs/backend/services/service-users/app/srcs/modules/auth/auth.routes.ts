/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.routes.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:38 by tissad            #+#    #+#             */
/*   Updated: 2025/10/30 12:28:16 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {    signupController,
            signinController,
            getProfileController,
        } from './auth.controllers';
import {    googleOAuthControllerCallback,
            googleProviderRedirect
        } from '../oauth/oauth.controllers';

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
    
}

// OAuth routes
export async function oauthRoutes(server: FastifyInstance)
{
    server.get('/google/provider', googleProviderRedirect);
    server.get('/google/callback', googleOAuthControllerCallback);
    server.get('/github/provider', googleProviderRedirect);
    server.get('/github/callback', googleOAuthControllerCallback);
    server.get('/42/provider', googleProviderRedirect);
    server.get('/42/callback', googleOAuthControllerCallback);
}

// user routes
export async function userRoutes(server: FastifyInstance)
{
    // Define user-related routes here
    server.get('/me', getProfileController);//pre-handler to verify token is valid aythentication middleware is called before the controller
}