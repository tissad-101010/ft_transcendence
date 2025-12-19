/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauthProvidersRedirections.controllers.ts          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:03 by tissad            #+#    #+#             */
/*   Updated: 2025/11/18 15:31:52 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


/***********************************/
/*    OAuth Controllers           */
/***********************************/
import { FastifyReply, FastifyRequest } from "fastify";

/******************************************************************************/
/*                       google OAuth Provider Redirects                      */
/******************************************************************************/
export async function googleProviderRedirect(req: FastifyRequest, 
    reply: FastifyReply) {
    const googleClientId = process.env.GOOGLE_CLIENT_ID; 
    const googleredirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!googleClientId || !googleredirectUri) {
        throw new Error("Missing Google OAuth configuration");
    }
    // Redirect user to Google's OAuth 2.0 consent screen
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?`+
        `client_id=${googleClientId}&redirect_uri=${googleredirectUri}&`+
        `response_type=code&scope=openid%20email%20profile`;
    // console.log("[OauthGoogle.controller] Redirecting to:", googleAuthUrl);
    reply.clearCookie('access_token', {
  path: '/',
  secure: true,
  sameSite: 'none',
});
    
    return reply.redirect(googleAuthUrl);
}

/******************************************************************************/
/*                       GitHub OAuth Provider Redirects                      */
/******************************************************************************/
export async function githubProviderRedirect(req: FastifyRequest,
    reply: FastifyReply) {
    const githubClientId = process.env.GITHUB_CLIENT_ID;
    const githubredirectUri = process.env.GITHUB_REDIRECT_URI;
    if (!githubClientId || !githubredirectUri) {
        throw new Error("Missing GitHub OAuth configuration");
    }
    // Redirect user to GitHub's OAuth 2.0 consent screen
    const githubAuthUrl = `https://github.com/login/oauth/authorize?`+
        `client_id=${githubClientId}&redirect_uri=${githubredirectUri}&`+
        `scope=user:email`;
    // console.log("[OauthGitHub.controller] Redirecting to:", githubAuthUrl);
    return reply.redirect(githubAuthUrl);
}

/******************************************************************************/
/*                       42 OAuth Provider Redirects                          */
/******************************************************************************/  
export async function fortyTwoProviderRedirect(req: FastifyRequest,
    reply: FastifyReply) {
    const fortyTwoClientId = process.env.FORTYTWO_CLIENT_ID;
    const fortyTworedirectUri = process.env.FORTYTWO_REDIRECT_URI;
    if (!fortyTwoClientId || !fortyTworedirectUri) {
        throw new Error("Missing 42 OAuth configuration");
    }
    // Redirect user to 42's OAuth 2.0 consent screen
    const fortyTwoAuthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=`+
        `${fortyTwoClientId}&redirect_uri=`+
        `${encodeURIComponent(fortyTworedirectUri)}&response_type=code&scope=public`;
    // console.log("[Oauth42.controller] Redirecting to:", fortyTwoAuthUrl);
    return reply.redirect(fortyTwoAuthUrl);
}
/**************************************************************************************/
