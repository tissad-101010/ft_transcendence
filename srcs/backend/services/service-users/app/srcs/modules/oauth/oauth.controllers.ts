/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauth.controllers.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:03 by tissad            #+#    #+#             */
/*   Updated: 2025/10/30 15:53:07 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


/***********************************/
/*    OAuth Controllers           */
/***********************************/
import { FastifyReply, FastifyRequest } from "fastify";
import { OauthService } from "./oauth.services";
import { JwtUtils } from "../../utils/jwt.utils";

//================================//
// Google OAuth Controllers       //
//================================//




//================================//
//  Oauth Providers Redirects     //
//================================//

// Redirect to Google OAuth consent screen
export async function googleProviderRedirect(req: FastifyRequest, reply: FastifyReply) {
    const googleClientId = process.env.GOOGLE_CLIENT_ID; 
    const googleredirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!googleClientId || !googleredirectUri) {
        throw new Error("Missing Google OAuth configuration");
    }
    // Redirect user to Google's OAuth 2.0 consent screen
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&` +
        `redirect_uri=${googleredirectUri}&response_type=code&scope=openid%20email%20profile`;
    console.log("[OauthGoogle.controller] Redirecting to:", googleAuthUrl);
    return reply.redirect(googleAuthUrl);
}
// Redirect to GitHub OAuth consent screen
export async function githubProviderRedirect(req: FastifyRequest, reply: FastifyReply) {
    const githubClientId = process.env.GITHUB_CLIENT_ID;
    const githubredirectUri = process.env.GITHUB_REDIRECT_URI;
    if (!githubClientId || !githubredirectUri) {
        throw new Error("Missing GitHub OAuth configuration");
    }
    // Redirect user to GitHub's OAuth 2.0 consent screen
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&` +
        `redirect_uri=${githubredirectUri}&scope=user:email`;
    console.log("[OauthGitHub.controller] Redirecting to:", githubAuthUrl);
    return reply.redirect(githubAuthUrl);
}

// Redirect to 42 OAuth consent screen
export async function fortyTwoProviderRedirect(req: FastifyRequest, reply: FastifyReply) {
    const fortyTwoClientId = process.env.FORTYTWO_CLIENT_ID;
    const fortyTworedirectUri = process.env.FORTYTWO_REDIRECT_URI;
    if (!fortyTwoClientId || !fortyTworedirectUri) {
        throw new Error("Missing 42 OAuth configuration");
    }
    // Redirect user to 42's OAuth 2.0 consent screen
    const fortyTwoAuthUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${fortyTwoClientId}` +
                        `&redirect_uri=${encodeURIComponent(fortyTworedirectUri)}` +
                        `&response_type=code&scope=public`;
    console.log("[Oauth42.controller] Redirecting to:", fortyTwoAuthUrl);
    return reply.redirect(fortyTwoAuthUrl);
}
/**************************************************************************************/

// Google OAuth callback handler
export async function googleOAuthControllerCallback(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const code = (request.query as any).code;
    const oauthService = new OauthService(request.server.prisma);
    try {
        const user = await oauthService.handleGoogleOAuth(code);
        if (!user) {
            // Authentication failed
        }
        else {
            // Successful authentication
            // generate JWT tokens
            const accessToken = JwtUtils.generateAccessToken({ id: user.id, email: user.email });
            const refreshToken = JwtUtils.generateRefreshToken({ id: user.id, email: user.email });
            // set cookies
            JwtUtils.setAccessTockenCookie(reply, accessToken);
            JwtUtils.setRefreshTockenCookie(reply, refreshToken);
            if ( user.isTwoFactorEnabled ) {
                // redirect to 2FA page
                return reply.redirect(`${process.env.FRONTEND_URL || '/'}2fa`);
            }
            return reply.redirect(`${process.env.FRONTEND_URL || '/'}2fa`);
            // return reply.redirect(process.env.FRONTEND_URL || '/');
        }
    }
    catch (error) {
        console.log("[OAuth Controller] Google OAuth error:", error);
        return reply.code(500).send({ message: "Google OAuth failed" });
    }
}

// GitHub OAuth callback handler
export async function githubOAuthControllerCallback(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const code = (request.query as any).code;
    const oauthService = new OauthService(request.server.prisma);
    try {
        const user = await oauthService.handleGitHubOAuth(code);
        if (!user) {
            // Authentication failed    
        }   
        else {
            // Successful authentication
            // generate JWT tokens
            const accessToken = JwtUtils.generateAccessToken({ id: user.id, email: user.email });
            const refreshToken = JwtUtils.generateRefreshToken({ id: user.id, email: user.email });
            // set cookies
            JwtUtils.setAccessTockenCookie(reply, accessToken);
            JwtUtils.setRefreshTockenCookie(reply, refreshToken);
            if ( user.isTwoFactorEnabled ) {
                // redirect to 2FA page
                return reply.redirect(`${process.env.FRONTEND_URL || '/'}2fa`);
            }
            return reply.redirect(process.env.FRONTEND_URL || '/');
        }
    }
    catch (error) {
        console.log("[OAuth Controller] GitHub OAuth error:", error);
        return reply.code(500).send({ message: "GitHub OAuth failed" });
    }
}

// 42 OAuth callback handler
export async function fortyTwoOAuthControllerCallback(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const code = (request.query as any).code;
    const oauthService = new OauthService(request.server.prisma);
    try {
        const user = await oauthService.handle42OAuth(code);    
        if (!user) {
            // Authentication failed    
        }   
        else {
            // Successful authentication
            // generate JWT tokens
            const accessToken = JwtUtils.generateAccessToken({ id: user.id, email: user.email });
            const refreshToken = JwtUtils.generateRefreshToken({ id: user.id, email: user.email });
            // set cookies
            JwtUtils.setAccessTockenCookie(reply, accessToken);
            JwtUtils.setRefreshTockenCookie(reply, refreshToken);
            if ( user.isTwoFactorEnabled ) {
                // redirect to 2FA page
                return reply.redirect(`${process.env.FRONTEND_URL || '/'}2fa`);
            }
            return reply.redirect(process.env.FRONTEND_URL || '/');
        }   
    }
    catch (error) {
        console.log("[OAuth Controller] 42 OAuth error:", error);
        return reply.code(500).send({ message: "42 OAuth failed" });
    }
} 
/* ************************************************************************** */