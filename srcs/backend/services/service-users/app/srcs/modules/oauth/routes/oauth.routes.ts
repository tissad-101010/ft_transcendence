/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauth.routes.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/18 15:26:33 by tissad            #+#    #+#             */
/*   Updated: 2025/12/10 18:55:54 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyInstance } from 'fastify';
import {    fortyTwoProviderRedirect,
            githubProviderRedirect, 
            googleProviderRedirect,
        } from '../controllers/oauthProvidersRedirections.controllers';
import {    fortyTwoOAuthControllerCallback,
            githubOAuthControllerCallback,
            googleOAuthControllerCallback,
        } from '../controllers/oauthProvidersCallback.controllers';

import { oauthCallbackRedirectionController } 
        from '../controllers/oauthCallbackRedirections.controllers';

/****************************************************************************/
/*                      OAuth Routes Setup                                  */
/****************************************************************************/
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

        // OAuth callback redirection route
        server.get('/callback', oauthCallbackRedirectionController);
}
