/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.routes.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:38 by tissad            #+#    #+#             */
/*   Updated: 2025/11/20 11:18:36 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {    signupController,
            signinController,
            getProfileController,
        } from './auth.controllers';
import {    fortyTwoProviderRedirect,
            githubProviderRedirect, 
            googleProviderRedirect,
            fortyTwoOAuthControllerCallback,
            githubOAuthControllerCallback,
            googleOAuthControllerCallback,
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
    // Google OAuth routes
    server.get('/google/provider', googleProviderRedirect);
    server.get('/google/callback', googleOAuthControllerCallback);
    
    // GitHub OAuth routes
    server.get('/github/provider', githubProviderRedirect);
    server.get('/github/callback', githubOAuthControllerCallback);
    
    // 42 OAuth routes
    server.get('/42/provider', fortyTwoProviderRedirect);
    server.get('/42/callback', fortyTwoOAuthControllerCallback);
}

// user routes
export async function userRoutes(server: FastifyInstance)
{
    // Define user-related routes here
    server.get('/profile', getProfileController);//pre-handler to verify token is valid aythentication middleware is called before the controller
}