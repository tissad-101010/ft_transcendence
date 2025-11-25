/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.controllers.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: issad <issad@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:44:30 by tissad            #+#    #+#             */
/*   Updated: 2025/11/24 23:40:54 by issad            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// this file receives the request from the frontend and call userservice 
// to handle the request response

import { FastifyReply, FastifyRequest } from 'fastify';

import { SignupUserDTO,
         SignupResponseDTO,
         LoginUserDTO,
         LoginResponseDTO,
        } from '../../types/user.types';
import { UsersService } from '../users/users.services';
import { CredentialUtils } from '../../utils/credential.utils';
import { AuthService } from './auth.services';
import { CryptUtils } from '../../utils/crypt.utils';
import { JwtUtils } from '../../utils/jwt.utils';
import { TwoFactorType } from '../../prisma/prisma/generated/client/browser';


/***********************************/
/*     Auth Controllers            */
/***********************************/

export async function signupController(
  request: FastifyRequest,
  reply: FastifyReply
  
) {
    const inputData = request.body as SignupUserDTO;
    // Step 1: validate credentials before proceeding
    const credentialValidation = CredentialUtils.validateCredentials(
        inputData
    );
    if (!credentialValidation.isValid) {
        console.log('[Signup Controller] Invalid credentials:', credentialValidation.errors);
        // send back error response
        return reply.code(400).send({
            message: 'Signup failed: Invalid credentials',
            signupComplete: false,
            errors: credentialValidation
        } as SignupResponseDTO);
    }
    
    // Step 2: check for existing username or email
    const userService = new UsersService(request.server.prisma);
    // check if username or email already exists
    try {   
        console.log('[Signup Controller] Checking for existing username or email');
        const existingUser = await userService.getUserByEmail(inputData.email)
            || await userService.getUserByUsername(inputData.username);
        if (existingUser) {
            console.log('[Signup Controller] Username or email already exists');
            // send back error response
            return reply.code(409).send({ 
                message: 'Username or email already exists',
                signupComplete: false,
            } as SignupResponseDTO);
        }
    } catch (error) {
        console.error('[Signup Controller] Error checking existing user:', error);
        return reply.code(500).send({
            message: 'Internal server error during signup',
            signupComplete: false,
        } as SignupResponseDTO);
    }

    // Step 3: proceed to register the user
    try {
        console.log('[Signup Controller] Credentials validated, proceeding to register user');
        const authService = new AuthService(request.server);
        const signupResponse = await authService.registerUser(inputData);
        if (!signupResponse.signupComplete) {
            return reply.code(400).send(signupResponse);
        }
    
        
        // Successful registration redirect to signin page
        console.log('[Signup Controller] User registered successfully');
        return reply.code(201).send(signupResponse);
    
    
    } catch (error) {
        console.error('[Signup Controller] Error during user registration:', error);
        return reply.code(500).send({
            message: 'Internal server error during signup',
            signupComplete: false,
        } as SignupResponseDTO);
    }
} 


// signin controller to handle signin requests  
export async function signinController(
  request: FastifyRequest,  
  reply: FastifyReply 
) { 
    
    console.log('[Signin Controller] Received signin request');
    const inputData = request.body as LoginUserDTO;
    const authService = new AuthService(request.server);
    try {
        // authenticate the user
        const loginResponse = await authService.authenticateUser(inputData);
        if (!loginResponse.signinComplete) {
            return reply.code(401).send(loginResponse);
        }
        console.log('[Signin Controller] User authenticated successfully');
        // prepare BASIC response data
        const responseData: LoginResponseDTO = {
            message: loginResponse.message,
            signinComplete: loginResponse.signinComplete,
            twoFactorRequired: loginResponse.twoFactorRequired,
            methodsEnabled: loginResponse.methodsEnabled,
        };    
        

        // handle 2FA requirement
        if ( loginResponse.twoFactorRequired ) {    
            console.log('[Signin Controller] 2FA required, sending response without access tokens');
            JwtUtils.setTempTokenCookie(reply, loginResponse.tempToken!); 
            return reply.code(200).send(responseData);// or redirect to 2FA page
        }


        // no 2FA required, set JWT cookies
        console.log('[Signin Controller] No 2FA required, setting JWT cookies');
        // set JWT cookies
        JwtUtils.setRefreshTokenCookie(reply, loginResponse.refreshToken!);
        JwtUtils.setAccessTokenCookie(reply, loginResponse.accessToken!);
        
        console.log('[Signin Controller] JWT cookies set successfully');
        console.log('[Signin Controller] responseData:', responseData);
        return reply.code(200).send(responseData);

        
    
    } catch (error) {
        console.error('[Signin Controller] Error during authentication:', error);
        return reply.code(500).send({
            message: 'Internal server error during authentication',
            signinComplete: false,
        } as LoginResponseDTO);
    }
}

// controller to get user profile
export async function getProfileController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    
    console.log('[Profile Controller] Received profile request');
    const redisClient = request.server.redis;
    const authService = new AuthService(request.server);
    const cookies = JwtUtils.extractCookiesFromRequest(request);
    const access_token = JwtUtils.extractTokenFromCookies(cookies, 'access_token');
    // check if access token is valid in redis cache
    if (access_token) {
        const cachedToken = await redisClient.get(`access_token:${JwtUtils.verifyAccessToken(access_token)?.id}`);
        if (!cachedToken || cachedToken !== access_token) {
            console.error('[Profile Controller] Unauthorized: Access token not found or mismatch in cache');
            return reply.code(401).send({ message: 'Unauthorized ❌' });
        }
        else {
            console.log('======================✅ [Profile Controller] Access token validated from cache');
        }
    }
    const user = JwtUtils.extractUserFromAccessToken(access_token);
    if (!user) {
        console.error('[Profile Controller] Unauthorized: No valid user found in request');
        return reply.code(401).send({ message: 'Unauthorized ❌' });
    }
    try {
        // check if user profile is cached in redis
        const cachedProfile = await redisClient.get(`user_profile:${user.userId}`);
        if (cachedProfile) {
            console.log('[Profile Controller] User profile retrieved from cache for user ID:', user.userId);
            return reply.code(200).send( JSON.parse(cachedProfile) );
        }else {
            console.log('[Profile Controller] No cached profile found, fetching from database for user ID:', user.userId);
            const userProfile = await authService.getUserProfile(user.userId);
            if (!userProfile) {
                console.error('[Profile Controller] User profile not found for user ID:', user.userId);
                return reply.code(404).send({ message: 'User profile not found ❌' });
            }
            // store user profile in redis cache (optional) 
            await redisClient.set(
                `user_profile:${user.userId}`,
                JSON.stringify(userProfile),
                'EX',
                15 * 60 // 15 minutes expiration
            );
            console.log('[Profile Controller] User profile retrieved successfully for user ID:', user.userId);
            return reply.code(200).send(userProfile);
        }
    } catch (error) {
        console.error('[Profile Controller] Error retrieving user profile:', error);
        return reply.code(500).send({ message: 'Internal server error ❌' });
    }
}

/* ************************************************************************** */

// refresh token controller to handle refresh token requests
export async function refreshTokenController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const redisClient = request.server.redis;
    console.log('[Refresh Token Controller] Received refresh token request');
    const authService = new AuthService(request.server);
    const incomingCookies = JwtUtils.extractCookiesFromRequest(request);
    // const incomingTempToken = JwtUtils.extractTokenFromCookies(incomingCookies, 'temp_token');
    // if (incomingTempToken) {
    //     const user = JwtUtils.extractUserFromTempToken(incomingTempToken);
    //     if (user) {
    //         console.error(`[Refresh Token Controller] Temp token belongs to user ID: ${user.userId}`);
    //         //test for refreshing tokens using temp token when user connect with oauth and 2fa is enabled
    //         return reply.send( { signinComplete: true,
    //           message?: "Tokens refreshed successfully",
    //           twoFactorRequired: true
    //           methodsEnabled?:
    //           accessToken?: string;
    //           refreshToken?: string;
    //           tempToken?: string;);
    //     } else {
    //         console.error('[Refresh Token Controller] Invalid temp token provided');
    //     }
    //     return reply.code(401).send({ message: 'Unauthorized ❌' }); 
    // }
    const incomingRefreshToken = JwtUtils.extractTokenFromCookies(incomingCookies, 'refresh_token');
    const incomingUserId = JwtUtils.extractUserFromRefreshToken(incomingRefreshToken)?.userId;
    if (!incomingRefreshToken || !incomingUserId) {
        console.error('[Refresh Token Controller] No refresh token found in request cookies');
        return reply.code(401).send({ message: 'Unauthorized ❌' });
    }
    try {
        // check if refresh token is valid in redis cache
        const userId = await redisClient.get(`refresh_token:${incomingRefreshToken}`);

        // const cachedToken = await redisClient.get(`refresh_token:${JwtUtils.verifyRefreshToken(refresh_token)?.id}`);
        
        if (!userId) {
            console.error('[Refresh Token Controller] Unauthorized: Refresh token not found or mismatch in cache');
            return reply.code(401).send({ message: 'Unauthorized ❌' });
        }else {
            console.log('======================✅ [Refresh Token Controller] Refresh token validated from cache');
        }
        
        // refresh the tokens
        const tokenResponse = await authService.refreshTokens(incomingUserId);
        if (!tokenResponse.refreshComplete) {
            console.error('[Refresh Token Controller] Refresh token invalid or expired');
            return reply.code(401).send(tokenResponse);
        }
        console.log('[Refresh Token Controller] Tokens refreshed successfully, setting new cookies');
        // set new JWT cookies
        JwtUtils.setRefreshTokenCookie(reply, tokenResponse.refreshToken!);
        JwtUtils.setAccessTokenCookie(reply, tokenResponse.accessToken!);  
        console.log('[Refresh Token Controller] New JWT cookies set successfully');
        return reply.code(200).send({
            message: tokenResponse.message,
            refreshComplete: tokenResponse.refreshComplete,
        });
    } catch (error) {
        console.error('[Refresh Token Controller] Error during token refresh:', error);
        return reply.code(500).send({
            message: 'Internal server error during token refresh',
            refreshComplete: false,
        });
    }   
}