/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.controllers.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:44:30 by tissad            #+#    #+#             */
/*   Updated: 2025/12/10 11:39:56 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// this file receives the request from the frontend and call userservice 
// to handle the request response

import path from "path";
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

import { JwtMiddleware } from '../middleware/auth.middleware';
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
    
    // JwtMiddleware(request, reply);
    // return; // ensure middleware is executed before proceeding
    console.log('[Profile Controller] Received profile request');
    const redisClient = request.server.redis;
    const authService = new AuthService(request.server);
    const user = await JwtMiddleware(request, reply);
    if (!user) {
        console.error('[Profile Controller] Unauthorized: No valid user found after middleware');
        return; // response already sent in middleware
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


// change password controller
export async function changePasswordController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    console.log('[Change Password Controller] Received change password request');
    const authService = new AuthService(request.server);
    const cookies = JwtUtils.extractCookiesFromRequest(request);
    const access_token = JwtUtils.extractTokenFromCookies(cookies, 'access_token');
    const user = JwtUtils.extractUserFromAccessToken(access_token);
    if (!user) {
        console.error('[Change Password Controller] Unauthorized: No valid user found in request');
        return reply.code(401).send({ message: 'Unauthorized ❌' });
    }
    const { currentPassword, newPassword } = request.body as { currentPassword: string; newPassword: string };
    if (!currentPassword || !newPassword) {
        console.error('[Change Password Controller] Bad Request: Missing current or new password');
        return reply.code(400).send({ message: 'Bad Request: Missing current or new password',
            passwordChangeComplete: false
         });
    }
    if (currentPassword === newPassword) {
        console.error('[Change Password Controller] New password cannot be the same as the current password');
        return reply.code(400).send({
            message: 'New password cannot be the same as the current password',
            passwordChangeComplete: false,
        });
    }
    if (CredentialUtils.isValidPassword(newPassword) === false) {
        console.error('[Change Password Controller] New password does not meet complexity requirements');
        return reply.code(400).send({
            message: 'New password does not meet complexity requirements',
            passwordChangeComplete: false,
        });
    }

    try {
        const changeResult = await authService.changeUserPassword(user.userId, currentPassword, newPassword);
        if (!changeResult.passwordChangeComplete) {
            console.error('[Change Password Controller] Password change failed:', changeResult.message);
            return reply.code(400).send(changeResult);
        }
        console.log('[Change Password Controller] Password changed successfully for user ID:', user.userId);
        return reply.code(200).send(changeResult);
    } catch (error) {
        console.error('[Change Password Controller] Error during password change:', error);
        return reply.code(500).send({
            message: 'Internal server error during password change',
            passwordChangeComplete: false,
        });
    }
}

import { uploadAvatar} from "../../utils/storage.utils";


// upload avatar controller
export async function uploadAvatarController(
    request: FastifyRequest,
    reply: FastifyReply
) {
    console.log('[Upload Avatar Controller] START');
    const authService = new AuthService(request.server);
    // extract user from access token
    const cookies = JwtUtils.extractCookiesFromRequest(request);
    const access_token = JwtUtils.extractTokenFromCookies(cookies, 'access_token');
    const user = JwtUtils.extractUserFromAccessToken(access_token);

    if (!user) {
        return reply.code(401).send({ message: 'Unauthorized ❌' });
    }

    try {
        const data = await request.body as any;
        const file = data.avatar;
        console.log('[Upload Avatar Controller] File received:', file);
        console.log('[Upload Avatar Controller] File name:', file.filename);
        if (!file) {
            return reply.code(400).send({ message: 'No avatar file provided', uploadComplete: false });
        }
        // new unique file name to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.filename);
        const newFileName = `avatar-${user.userId}-${uniqueSuffix}${fileExtension}`;
        console.log('[Upload Avatar Controller] New file name:', newFileName);
        // read file buffer
        const buffer = await file.toBuffer();
        console.log('[Upload Avatar Controller] File buffer size:', buffer.length);
        // upload to GCP Storage
        /****************************************************** */
        const filePath = await uploadAvatar(buffer, newFileName, file.mimetype);
        // const signedUrl = await generateSignedUrl(newFileName, 24 * 3600); // URL valide 24h
        //****************************************************** */
        console.log('[Upload Avatar Controller] File saved successfully:', filePath);
        console.log('[Upload Avatar Controller] basename:', path.basename(filePath));
        // console.log('[Upload Avatar Controller] signedUrl:', signedUrl);
        const avatarUrl = filePath; // use direct GCP URL
        console.log('[Upload Avatar Controller] avatarUrl:', avatarUrl);
        
        // update user url avatar in database
        const result = await authService.uploadUserAvatar(user.userId, avatarUrl);
        return reply.code(200).send(result);

    } catch (error) {
        console.error("[Upload Avatar Controller] ERROR:", error);

        return reply.code(500).send({
            message: error instanceof Error ? error.message : 'Internal server error during avatar upload',
            uploadComplete: false,
        });
    }
}


/* ************************************************************************** */
