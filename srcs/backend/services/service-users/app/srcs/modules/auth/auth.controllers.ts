/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.controllers.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:44:30 by tissad            #+#    #+#             */
/*   Updated: 2025/11/20 15:30:54 by glions           ###   ########.fr       */
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
        JwtUtils.setAccessTokenCookie(reply, loginResponse.accessToken!);
        JwtUtils.setRefreshTokenCookie(reply, loginResponse.refreshToken!);
        console.log('[Signin Controller] JWT cookies set successfully');
        console.log('[Signin Controller] reponseData:', responseData);
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
    const authService = new AuthService(request.server);
    // extract user from cookies from header request
    const user = JwtUtils.extractUserFromRequest(request);
    if (!user) {
        console.error('[Profile Controller] Unauthorized: No valid user found in request');
        return reply.code(401).send({ message: 'Unauthorized ❌' });
    }
    try {
        const userProfile = await authService.getUserProfile(user.userId);
        if (!userProfile) {
            console.error('[Profile Controller] User profile not found for user ID:', user.userId);
            return reply.code(404).send({ message: 'User profile not found ❌' });
        }
        console.log('[Profile Controller] User profile retrieved successfully for user ID:', user.userId);
        return reply.code(200).send(userProfile);
    } catch (error) {
        console.error('[Profile Controller] Error retrieving user profile:', error);
        return reply.code(500).send({ message: 'Internal server error ❌' });
    }
}

/* ************************************************************************** */