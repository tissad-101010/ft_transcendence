/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.services.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:44:27 by tissad            #+#    #+#             */
/*   Updated: 2025/10/27 16:50:07 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { UsersService } from '../users/users.services';
import { SignupUserDTO,
         SignupResponseDTO,
         LoginUserDTO,
         LoginResponseDTO,
        } from '../../types/user.types';
import { CryptUtils } from '../../utils/crypt.utils';
import { JwtUtils } from '../../utils/jwt.utils';



/***********************************/
/*       Auth Service Class        */
/***********************************/

export class AuthService {
    private usersService: UsersService;
    constructor(prismaClient: any) {
        this.usersService = new UsersService(prismaClient);
    }
    // register a new user
    async registerUser(inputData: SignupUserDTO): Promise<SignupResponseDTO> {
        // hash the password before storing
        const hashedPassword = await CryptUtils.hashLongPassword(inputData.password);
        // data that will be stored in the database
        const data = {
            email: inputData.email,
            username: inputData.username,
            passwordHash: hashedPassword,
        };
        // create the user
        const user = await this.usersService.createUser(data);

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

    
    async authenticateUser(inputData: LoginUserDTO): Promise<LoginResponseDTO>{
        if (process.env.ACCESS_TOKEN_SECRET === undefined ||
            process.env.REFRESH_TOKEN_SECRET === undefined ||
            process.env.ACCESS_TOKEN_EXPIRATION === undefined ||
            process.env.REFRESH_TOKEN_EXPIRATION === undefined) {
            throw new Error('JWT configuration is missing');
        }        
        // find user by username
        const user = await this.usersService.getUserByUsername(inputData.username)|| 
        await this.usersService.getUserByEmail(inputData.username);
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
        // generate JWT tokens
        const accessToken = JwtUtils.generateToken(
            { id: user.id }, 
            process.env.ACCESS_TOKEN_SECRET!,
            process.env.ACCESS_TOKEN_EXPIRATION!
        );
        const refreshToken = JwtUtils.generateToken(
            { id: user.id },
            process.env.REFRESH_TOKEN_SECRET!,
            process.env.REFRESH_TOKEN_EXPIRATION!
        );
        return {
            signinComplete: true,
            twoFactorRequired: user.twoFactorEnabled || false,
            methodsEnabled: user.twoFactorMethods || [],
            accessToken,
            refreshToken,
        };
    }
    // Additional authentication methods can be added here
    async verifyAuthToken(token: string): Promise<any> {
        if (process.env.ACCESS_TOKEN_SECRET === undefined) {
            throw new Error('JWT configuration is missing');
        }
        const payload = JwtUtils.verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
        return payload;
    }

    async getUserProfile(userId: string): Promise<any> {
        const user = await this.usersService.getUserById(userId);
        if (!user) {
            return null;
        }
        // return user profile data excluding sensitive information
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}