/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauthProvidersCallback.controllers.ts              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/18 15:31:26 by tissad            #+#    #+#             */
/*   Updated: 2025/12/10 18:40:23 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyReply, FastifyRequest } from "fastify";
import { OauthService } from "../services/oauth.services";
import { JwtUtils } from "../../../utils/jwt.utils";
import {LoginResponseDTO} from "../../../types/user.types";

// Google OAuth callback handler
export async function googleOAuthControllerCallback(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const redisClient = request.server.redis;
    const code = (request.query as any).code;
    const oauthService = new OauthService(request.server.prisma);
    try {
        const user = await oauthService.handleGoogleOAuth(code);
        // Authentication failed
        if (!user) {
            return reply.code(401).send({ message: "Google OAuth authentication failed" });
        }
        else {
            
            const temp_token = JwtUtils.generateTwoFactorTempToken({ id: user.id, email: user.email });
    
            JwtUtils.setTempTokenCookie(reply, temp_token);
            // handle 2FA if enabled
            if ( user.isTwoFactorEnabled ) {
                console.log("User has 2FA enabled, redirecting to 2FA page");
                // add playload to temp token
  
                
                // redirect to 2FA page
                return reply.redirect(`https://localhost:8443/oauth/callback`);
            }
            // Successful authentication
            // generate JWT tokens
            // console.log("Google OAuth successful for user ID:", user.id);
            // const accessToken = JwtUtils.generateAccessToken({ id: user.id, email: user.email });
            // const refreshToken = JwtUtils.generateRefreshToken({ id: user.id, email: user.email });
            // // store tokens in redis cache
            //         // store refresh token in redis cache
            // await redisClient.set(
            //     `refresh_token:${refreshToken}`,
            //     user.id,
            //     'EX',
            //     60 * 60 * 24 * 7// 7 days
            // );

            // // store access token in redis cache (optional)
            // await redisClient.set(
            //     `access_token:${user.id}`,
            //     accessToken,
            //     'EX',
            //     60 * 15// 15 minutes
            // );
            // // set cookies
            // JwtUtils.setAccessTokenCookie(reply, accessToken);
            // JwtUtils.setRefreshTokenCookie(reply, refreshToken);
            return reply.redirect(`https://localhost:8443/oauth/callback`);
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
    const redisClient = request.server.redis;
    const code = (request.query as any).code;
    const oauthService = new OauthService(request.server.prisma);
    try {
        const user = await oauthService.handleGitHubOAuth(code);
        if (!user) {
            // Authentication failed    
            return reply.code(401).send({ message: "GitHub OAuth authentication failed" }); 
        }   
        else {
            if ( user.isTwoFactorEnabled ) {
                // redirect to 2FA page
                console.log("User has 2FA enabled, redirecting to 2FA page");
                const temp_token = JwtUtils.generateTwoFactorTempToken({ id: user.id, email: user.email });
                JwtUtils.setTempTokenCookie(reply, temp_token);
                // reply.send({
                //     message: "GitHub OAuth successful t2fa required",
                // });
                return reply.redirect(`https://localhost:8443`);
            }
            // Successful authentication
            console.log("GitHub OAuth successful for user ID:", user.id);
            // generate JWT tokens
            const accessToken = JwtUtils.generateAccessToken({ id: user.id, email: user.email });
            const refreshToken = JwtUtils.generateRefreshToken({ id: user.id, email: user.email });
            // store tokens in redis cache 
            // set cookies
            JwtUtils.setAccessTokenCookie(reply, accessToken);
            JwtUtils.setRefreshTokenCookie(reply, refreshToken);
            await redisClient.set(
                `refresh_token:${refreshToken}`,
                user.id,
                'EX',
                60 * 60 * 24 * 7// 7 days
            );

            // store access token in redis cache (optional)
            await redisClient.set(
                `access_token:${user.id}`,
                accessToken,
                'EX',
                60 * 15// 15 minutes
            );
            return reply.redirect(`https://localhost:8443`);
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
    const redisClient = request.server.redis;
    const code = (request.query as any).code;
    const oauthService = new OauthService(request.server.prisma);
    try {
        const user = await oauthService.handle42OAuth(code);    
        if (!user) {
            // Authentication failed
            console.log("42 OAuth authentication failed");
            return reply.code(401).send({ message: "42 OAuth authentication failed" });  
        }   
        else {
            
            if ( user.isTwoFactorEnabled ) {
                // redirect to 2FA page
                console.log("User has 2FA enabled, redirecting to 2FA page");   
                const temp_token = JwtUtils.generateTwoFactorTempToken({ id: user.id, email: user.email });
                JwtUtils.setTempTokenCookie(reply, temp_token);
                 return reply.redirect(`https://localhost:8443`);
            }
            // Successful authentication
            console.log("42 OAuth successful for user ID:", user.id);
            // generate JWT tokens
            const accessToken = JwtUtils.generateAccessToken({ id: user.id, email: user.email });
            const refreshToken = JwtUtils.generateRefreshToken({ id: user.id, email: user.email });
            // set cookies
            JwtUtils.setAccessTokenCookie(reply, accessToken);
            JwtUtils.setRefreshTokenCookie(reply, refreshToken);
            await redisClient.set(
                `refresh_token:${refreshToken}`,
                user.id,
                'EX',
                60 * 60 * 24 * 7// 7 days
            );

            // store access token in redis cache (optional)
            await redisClient.set(
                `access_token:${user.id}`,
                accessToken,
                'EX',
                60 * 15// 15 minutes
            );
             return reply.redirect(`https://localhost:8443`);
        }   
    }
    catch (error) {
        console.log("[OAuth Controller] 42 OAuth error:", error);
        return reply.code(500).send({ message: "42 OAuth failed" + error });
    }
} 
/* ************************************************************************** */