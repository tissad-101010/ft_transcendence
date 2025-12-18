"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthRoutes = oauthRoutes;
const oauthProvidersRedirections_controllers_1 = require("../controllers/oauthProvidersRedirections.controllers");
const oauthProvidersCallback_controllers_1 = require("../controllers/oauthProvidersCallback.controllers");
const oauthCallbackRedirections_controllers_1 = require("../controllers/oauthCallbackRedirections.controllers");
/****************************************************************************/
/*                      OAuth Routes Setup                                  */
/****************************************************************************/
async function oauthRoutes(server) {
    // Google OAuth routes
    server.get('/google/provider', oauthProvidersRedirections_controllers_1.googleProviderRedirect);
    server.get('/google/callback', oauthProvidersCallback_controllers_1.googleOAuthControllerCallback);
    // GitHub OAuth routes
    server.get('/github/provider', oauthProvidersRedirections_controllers_1.githubProviderRedirect);
    server.get('/github/callback', oauthProvidersCallback_controllers_1.githubOAuthControllerCallback);
    // 42 OAuth routes
    server.get('/42/provider', oauthProvidersRedirections_controllers_1.fortyTwoProviderRedirect);
    server.get('/42/callback', oauthProvidersCallback_controllers_1.fortyTwoOAuthControllerCallback);
    // OAuth callback redirection route
    server.get('/callback', oauthCallbackRedirections_controllers_1.oauthCallbackRedirectionController);
}
