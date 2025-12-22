/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.services.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:44:27 by tissad            #+#    #+#             */
/*   Updated: 2025/12/11 10:50:52 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyInstance } from 'fastify';
import { UsersService } from '../users/users.services';
import { SignupUserDTO,
         SignupResponseDTO,
         LoginUserDTO,
         LoginResponseDTO,
         AuthenticatedUserDTO,
         UserProfile 
        } from '../../types/user.types';
import { CryptUtils } from '../../utils/crypt.utils';
import { JwtUtils } from '../../utils/jwt.utils';

interface responseRefreshTokens {
    accessToken: string | null;
    refreshToken: string | null;
    refreshComplete: boolean;
    message?: string;
}

/***********************************/
/*       Auth Service Class        */
/***********************************/

export class AuthService {
    private userService: UsersService;
    private redisClient: any;
    private prismaClient: any;
    private refreshTimeout: number = 7 * 24 * 60 * 60; // 7 days in seconds
    private accessTimeout: number = 60 * 60; // 1 hour in seconds
    
    constructor(app: FastifyInstance) {
        this.prismaClient = app.prisma;
        this.redisClient = app.redis;
        this.userService = new UsersService(this.prismaClient);
    }
    // register a new user
    async registerUser(inputData: SignupUserDTO): Promise<SignupResponseDTO> {
        // console.log('[Signup authservice] Registering user:', inputData.username);
        // hash the password before storing
        const hashedPassword = await CryptUtils.hashLongPassword(inputData.password);
        // data that will be stored in the database
        const data = {
            email: inputData.email,
            username: inputData.username,
            passwordHash: hashedPassword,
        };
        // create the user
        const user = await this.userService.createUser(data);

        // if user creation fails
        if (!user) {
            return {
                message: 'Signup failed',
                signupComplete: false,
            };
        }
        // if user creation is successful
        return {
            message: 'Signup successful',
            signupComplete: true,
        };
    }
    
    async authenticateUser(inputData: LoginUserDTO) : Promise<LoginResponseDTO> {  
        // find user by username
        // console.log('[Signin authservice] Authenticating user:', inputData.username);
        const user = await this.userService.getUserByUsername(inputData.username) ||
        await this.userService.getUserByEmail(inputData.username);
        // console.log('[Signin authservice] User found:', user ? user.username : 'null');
        if (!user) {
            return {
                message: 'Authentication failed: User not found',
                signinComplete: false,
                twoFactorRequired: false,
            };
        }
        console.log('[Signin authservice] Verifying password for user:', user);
        if (user.passwordHash === null) {
            return {
                message: 'Authentication failed: No password set for this user',
                signinComplete: false,
                twoFactorRequired: false,
            };
        }
        // verify password  
        const isPasswordValid = await CryptUtils.verifyLongPassword(
            inputData.password,
            user.passwordHash
        );
        if (!isPasswordValid) {
            return {
                message: 'Authentication failed: Incorrect password',   
                signinComplete: false,
                twoFactorRequired: false,
            };
        }
        const loginResponse: AuthenticatedUserDTO = {
            id: user.id,
            email: user.email,
        };
        const twoFactorMethods = await this.userService.getUserTwoFactorMethods(user.id);
        const isTwoFactorEnabled = twoFactorMethods.length > 0;

        // if 2FA is enabled, return response indicating 2FA is required
        // generate temp token for 2FA verification
        // wen 2fa is successful, i will generate normal JWT tokens with refresh token  
        if (isTwoFactorEnabled) {
            const tempToken = JwtUtils.generateTwoFactorTempToken(loginResponse);
            if (!tempToken) {
                // console.log('[Signin authservice] Failed to generate temp token for 2FA');
                return {
                    message: 'Authentication failed: Unable to generate temporary token for 2FA',
                    signinComplete: false,
                };
            }
            return {
                message: 'Two-factor authentication required',
                signinComplete: true,
                twoFactorRequired: true,
                methodsEnabled: twoFactorMethods,
                tempToken: tempToken,
            };
        }

        
        // 2FA not enabled, proceed with normal authentication
        // generate JWT tokens
        const accessToken = JwtUtils.generateAccessToken(loginResponse);
        const refreshToken = JwtUtils.generateRefreshToken(loginResponse);
        
        // store refresh token in redis cache
        await this.redisClient.del(`refresh_token:${user.id}`); // delete old refresh token if exists
        await this.redisClient.set(
            `refresh_token:${refreshToken}`,
            user.id,
            'EX',
            60 * 60 * 24 * 7
        );

        // store access token in redis cache (optional)
        await this.redisClient.del(`access_token:${user.id}`); // delete old access token if exists
        await this.redisClient.set(
            `access_token:${user.id}`,
            accessToken,
            'EX',
            this.accessTimeout || 60 * 60
        );
        
        // console.log('[Signin authservice] User authenticated successfully, tokens generated');
        return {
            message: 'Authentication successful',
            signinComplete: true,
            methodsEnabled: twoFactorMethods,
            twoFactorRequired: isTwoFactorEnabled,
            accessToken,
            refreshToken,
        };
    }

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        // console.log('(============================================[AuthService] Fetching profile for user ID:', userId);
        const user = await this.userService.getUserById(userId);
        if (!user) {
            return null;
        }
        // return user profile data excluding sensitive information
        const twoFactorMethods = await this.userService.getUserTwoFactorMethods(user.id);
        const isTwoFactorEnabled = twoFactorMethods.length > 0;
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            twoFactorEnabled: isTwoFactorEnabled,
            twoFactorMethods: twoFactorMethods,
        }as  UserProfile;
    }
    
    async getUserById(userId: string) { 
        return this.userService.getUserById(userId);
    }


    // change user password
    async changeUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<{passwordChangeComplete: boolean, message: string}> {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            // console.log("[AuthService] User not found for password change:", userId);
            return {passwordChangeComplete: false, message: "User not found"};
        }
        if (user.passwordHash === null) {
            // console.log("[AuthService] User has no password set (OAuth user) for user:", userId);
            return {passwordChangeComplete: false, message: "User has no password set (OAuth user)"};
        }
        // verify current password
        const isPasswordValid = await CryptUtils.verifyLongPassword(
            currentPassword,
            user.passwordHash
        );
        if (!isPasswordValid) {
            // console.log("[AuthService] Current password is incorrect for user:", userId);
            return {passwordChangeComplete: false, message: "Current password is incorrect"}
        }
        // hash new password
        const hashedNewPassword = await CryptUtils.hashLongPassword(newPassword);
        // update password in database
        const updateResult = await this.userService.updateUserPassword(userId, hashedNewPassword);
        if (!updateResult) {
            // console.log("[AuthService] Failed to update password for user:", userId);
            return {passwordChangeComplete: false, message: "Failed to update password"}
        }
        // console.log("[AuthService] Password updated successfully for user:", userId);
        return {passwordChangeComplete: true, message: "Password updated successfully"};
    } 

    // upload user avatar
    async uploadUserAvatar(userId: string, avatarUrl:string): Promise<{uploadComplete: boolean, message: string, avatarUrl?: string}> {
          // @fastify/multipart
          
        // delete cache or old avatar if exists
        await this.redisClient.del(`user_profile:${userId}`); 
        const updateResult = await this.userService.uploadUserAvatar(userId, avatarUrl);
        if (!updateResult) {
            // console.log("[AuthService] Failed to update avatar for user:", userId);
            return {uploadComplete: false, message: "Failed to update avatar"};
        }
        // console.log("[AuthService] Avatar updated successfully for user:", userId);
        return {uploadComplete: true, message: "Avatar updated successfully", avatarUrl: avatarUrl};
    }
    
}