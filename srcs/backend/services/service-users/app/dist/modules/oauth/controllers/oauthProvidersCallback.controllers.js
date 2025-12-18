"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauthProvidersCallback.controllers.ts              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/18 15:31:26 by tissad            #+#    #+#             */
/*   Updated: 2025/12/17 17:18:29 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOAuthControllerCallback = googleOAuthControllerCallback;
exports.githubOAuthControllerCallback = githubOAuthControllerCallback;
exports.fortyTwoOAuthControllerCallback = fortyTwoOAuthControllerCallback;
const oauth_services_1 = require("../services/oauth.services");
const jwt_utils_1 = require("../../../utils/jwt.utils");
const originUrl = `${process.env.ORIGIN_URL}`;
// Google OAuth callback handler
async function googleOAuthControllerCallback(request, reply) {
    const redisClient = request.server.redis;
    const code = request.query.code;
    const oauthService = new oauth_services_1.OauthService(request.server.prisma);
    try {
        const user = await oauthService.handleGoogleOAuth(code);
        // Authentication failed
        if (!user) {
            return reply.code(401).send({ message: "Google OAuth authentication failed" });
        }
        else {
            const temp_token = jwt_utils_1.JwtUtils.generateTwoFactorTempToken({ id: user.id, email: user.email });
            jwt_utils_1.JwtUtils.setTempTokenCookie(reply, temp_token);
            // handle 2FA if enabled
            if (user.isTwoFactorEnabled) {
                console.log("User has 2FA enabled, redirecting to 2FA page");
                // add playload to temp token
                // redirect to 2FA page
                return reply.redirect(`${originUrl}/oauth/callback`);
            }
            // Successful authentication
            // generate JWT tokens
            console.log("Google OAuth successful for user ID:", user.id);
            const accessToken = jwt_utils_1.JwtUtils.generateAccessToken({ id: user.id, email: user.email });
            const refreshToken = jwt_utils_1.JwtUtils.generateRefreshToken({ id: user.id, email: user.email });
            // store tokens in redis cache
            // store refresh token in redis cache
            await redisClient.set(`refresh_token:${refreshToken}`, user.id, 'EX', 60 * 60 * 24 * 7 // 7 days
            );
            // store access token in redis cache (optional)
            await redisClient.set(`access_token:${user.id}`, accessToken, 'EX', 60 * 15 // 15 minutes
            );
            // set cookies
            jwt_utils_1.JwtUtils.setAccessTokenCookie(reply, accessToken);
            jwt_utils_1.JwtUtils.setRefreshTokenCookie(reply, refreshToken);
            return reply.redirect(originUrl);
            // return reply.redirect(process.env.FRONTEND_URL || '/');
        }
    }
    catch (error) {
        console.log("[OAuth Controller] Google OAuth error:", error);
        return reply.code(500).send({ message: "Google OAuth failed" });
    }
}
// GitHub OAuth callback handler
async function githubOAuthControllerCallback(request, reply) {
    const redisClient = request.server.redis;
    const code = request.query.code;
    const oauthService = new oauth_services_1.OauthService(request.server.prisma);
    try {
        const user = await oauthService.handleGitHubOAuth(code);
        if (!user) {
            // Authentication failed    
            return reply.code(401).send({ message: "GitHub OAuth authentication failed" });
        }
        else {
            if (user.isTwoFactorEnabled) {
                // redirect to 2FA page
                console.log("User has 2FA enabled, redirecting to 2FA page");
                const temp_token = jwt_utils_1.JwtUtils.generateTwoFactorTempToken({ id: user.id, email: user.email });
                jwt_utils_1.JwtUtils.setTempTokenCookie(reply, temp_token);
                return reply.redirect(`${originUrl}/oauth/callback`);
            }
            // Successful authentication
            console.log("GitHub OAuth successful for user ID:", user.id);
            // generate JWT tokens
            const accessToken = jwt_utils_1.JwtUtils.generateAccessToken({ id: user.id, email: user.email });
            const refreshToken = jwt_utils_1.JwtUtils.generateRefreshToken({ id: user.id, email: user.email });
            // store tokens in redis cache 
            // set cookies
            jwt_utils_1.JwtUtils.setAccessTokenCookie(reply, accessToken);
            jwt_utils_1.JwtUtils.setRefreshTokenCookie(reply, refreshToken);
            await redisClient.set(`refresh_token:${refreshToken}`, user.id, 'EX', 60 * 60 * 24 * 7 // 7 days
            );
            // store access token in redis cache (optional)
            await redisClient.set(`access_token:${user.id}`, accessToken, 'EX', 60 * 15 // 15 minutes
            );
            return reply.redirect(originUrl);
        }
    }
    catch (error) {
        console.log("[OAuth Controller] GitHub OAuth error:", error);
        return reply.code(500).send({ message: "GitHub OAuth failed" });
    }
}
// 42 OAuth callback handler
async function fortyTwoOAuthControllerCallback(request, reply) {
    const redisClient = request.server.redis;
    const code = request.query.code;
    const oauthService = new oauth_services_1.OauthService(request.server.prisma);
    try {
        const user = await oauthService.handle42OAuth(code);
        if (!user) {
            // Authentication failed
            console.log("42 OAuth authentication failed");
            return reply.code(401).send({ message: "42 OAuth authentication failed" });
        }
        else {
            if (user.isTwoFactorEnabled) {
                // redirect to 2FA page
                console.log("User has 2FA enabled, redirecting to 2FA page");
                const temp_token = jwt_utils_1.JwtUtils.generateTwoFactorTempToken({ id: user.id, email: user.email });
                jwt_utils_1.JwtUtils.setTempTokenCookie(reply, temp_token);
                return reply.redirect(`${originUrl}/oauth/callback`);
            }
            // Successful authentication
            console.log("42 OAuth successful for user ID:", user.id);
            // generate JWT tokens
            const accessToken = jwt_utils_1.JwtUtils.generateAccessToken({ id: user.id, email: user.email });
            const refreshToken = jwt_utils_1.JwtUtils.generateRefreshToken({ id: user.id, email: user.email });
            // set cookies
            jwt_utils_1.JwtUtils.setAccessTokenCookie(reply, accessToken);
            jwt_utils_1.JwtUtils.setRefreshTokenCookie(reply, refreshToken);
            await redisClient.set(`refresh_token:${refreshToken}`, user.id, 'EX', 60 * 60 * 24 * 7 // 7 days
            );
            // store access token in redis cache (optional)
            await redisClient.set(`access_token:${user.id}`, accessToken, 'EX', 60 * 15 // 15 minutes
            );
            return reply.redirect(originUrl);
        }
    }
    catch (error) {
        console.log("[OAuth Controller] 42 OAuth error:", error);
        return reply.code(500).send({ message: "42 OAuth failed" + error });
    }
}
/* ************************************************************************** */ 
