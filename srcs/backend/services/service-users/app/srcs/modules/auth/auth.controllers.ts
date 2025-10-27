/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.controllers.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:44:30 by tissad            #+#    #+#             */
/*   Updated: 2025/10/27 17:00:57 by tissad           ###   ########.fr       */
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
        console.log('[Signup Controller] Invalid credentials:', credentialValidation.response);
        // send back error response
        return reply.code(400).send({
            message: 'Signup failed: ' + credentialValidation.response,
            signupComplete: false,
        } as SignupResponseDTO);
    }
    
    // Step 2: check for existing username or email
    const userService = new UsersService(request.server.prisma);
    // check if username or email already exists
    try {   
        console.log('[Signup Controller] Checking for existing username or email');
        const existingUser = await userService.getUserByEmail(inputData.email) ||
            await userService.getUserByUsername(inputData.username);
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
        const authService = new AuthService(request.server.prisma);
        const signupResponse = await authService.registerUser(inputData);
        if (!signupResponse.signupComplete) {
            return reply.code(400).send(signupResponse);
        }
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
    const inputData = request.body as LoginUserDTO;
    const authService = new AuthService(request.server.prisma);
    try {
        // authenticate the user
        const loginResponse = await authService.authenticateUser(inputData);
        if (!loginResponse.signinComplete) {
            return reply.code(401).send(loginResponse);
        }
        console.log('[Signin Controller] User authenticated successfully');
        return reply.code(200).send(loginResponse);
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
    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) {
        return reply.code(401).send({ message: 'Unauthorized: No token provided' });
    }
    const authService = new AuthService(request.server.prisma);
    // midelware functionality to verify token
    try {
        const isAuthenticated = await authService.verifyAuthToken(token);
        if (!isAuthenticated) {
            return reply.code(401).send({ message: 'Unauthorized' });
        }
        // proceed to next handler
        try {
            const userId = isAuthenticated.id;
            const userProfile = await authService.getUserProfile(userId);
            if (!userProfile) {
                return reply.code(404).send({ message: 'User profile not found' });
            }
            return reply.code(200).send(userProfile);
        } catch (error) {
            console.error('[Get Profile Controller] Error fetching user profile:', error);
            return reply.code(500).send({ message: 'Internal server error fetching profile' });
        }
    }
    catch (error) {
        console.error('[Get Profile Controller] Error during token verification:', error);
        return reply.code(500).send({ message: 'Internal server error during authentication' });
    }
}

/* ************************************************************************** */