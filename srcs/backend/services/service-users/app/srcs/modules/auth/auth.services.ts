/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.services.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:44:27 by tissad            #+#    #+#             */
/*   Updated: 2025/10/31 16:55:54 by tissad           ###   ########.fr       */
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



/***********************************/
/*       Auth Service Class        */
/***********************************/

export class AuthService {
    private userService: UsersService;
    private redisClient: any;
    private prismaClient: any;
    constructor(app: FastifyInstance) {
        this.prismaClient = app.prisma;
        this.redisClient = app.redis;
        this.userService = new UsersService(this.prismaClient);
    }
    // register a new user
    async registerUser(inputData: SignupUserDTO): Promise<SignupResponseDTO> {
        console.log('[Signup authservice] Registering user:', inputData.username);
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
        console.log('[Signin authservice] Authenticating user:', inputData.username);
        const user = await this.userService.getUserByUsername(inputData.username) ||
        await this.userService.getUserByEmail(inputData.username);
        console.log('[Signin authservice] User found:', user ? user.username : 'null');
        if (!user) {
            return {
                message: 'Authentication failed: User not found',
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
                console.log('[Signin authservice] Failed to generate temp token for 2FA');
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
        await this.redisClient.set(
            `refresh_token:${user.id}`,
            refreshToken,
            'EX',
            7 * 24 * 60 * 60 // 7 days expiration
        );
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
        console.log('(============================================[AuthService] Fetching profile for user ID:', userId);
        const user = await this.userService.getUserById(userId);
        if (!user) {
            return null;
        }
        // return user profile data excluding sensitive information
        const twoFactorMethods = await this.userService.getUserTwoFactorMethods(user.id);
        const isTwoFactorEnabled = twoFactorMethods.length > 0;
        return {
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
}