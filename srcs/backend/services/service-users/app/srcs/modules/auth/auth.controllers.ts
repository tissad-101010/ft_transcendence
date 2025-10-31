/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.controllers.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:44:30 by tissad            #+#    #+#             */
/*   Updated: 2025/10/31 11:52:56 by tissad           ###   ########.fr       */
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
import { log } from 'console';
import { auth } from 'firebase-admin';
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
        const authService = new AuthService(request.server.prisma);
        const signupResponse = await authService.registerUser(inputData);
        if (!signupResponse.signupComplete) {
            return reply.code(400).send(signupResponse);
        }
    
        
        // Successful registration redirect to signin page
        console.log('[Signup Controller] User registered successfully');
        return reply.code(201).redirect(process.env.FRONTEND_URL || 'https://localhost:8443/signin');
    
    
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
    const authService = new AuthService(request.server.prisma);
    try {
        // authenticate the user
        const loginResponse = await authService.authenticateUser(inputData);
        if (!loginResponse.signinComplete) {
            return reply.code(401).send(loginResponse);
        }
        // set JWT cookies
        JwtUtils.setAccessTockenCookie(reply, loginResponse.accessToken!);
        JwtUtils.setRefreshTockenCookie(reply, loginResponse.refreshToken!);
        return reply.code(200).send({
            message: loginResponse.message,
            signinComplete: loginResponse.signinComplete,
            twoFactorRequired: loginResponse.twoFactorRequired,
            methodsEnabled: loginResponse.methodsEnabled,
        } as LoginResponseDTO);
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
    const access_token = request.cookies['access_token'];
    if (!access_token) {
        return reply.code(401).send({ message: 'Unauthorized: No access token provided' });
    }
    const authService = new AuthService(request.server.prisma);
    const payload = JwtUtils.verifyAccessToken(access_token);
    if (!payload) {
        return reply.code(401).send({ message: 'Unauthorized: Invalid access token' });
    }
    try {
        const user = await authService.getUserById(payload.id);
        if (!user) {
            return reply.code(404).send({ message: 'User not found' });
        }
        const profie_data = await authService.getUserProfile(user.id);
        if (profie_data === null) {
            return reply.code(404).send({ message: 'User profile not found' });
        }
        return reply.code(200).send({ profile: profie_data});
    } catch (error) {
        console.error('[Get Profile Controller] Error fetching user profile:', error);
        return reply.code(500).send({ message: 'Internal server error' });
    }
}

/* ************************************************************************** */