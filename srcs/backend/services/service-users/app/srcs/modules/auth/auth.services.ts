/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.services.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:44:27 by tissad            #+#    #+#             */
/*   Updated: 2025/10/31 11:49:23 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

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
    constructor(prismaClient: any) {
        this.userService = new UsersService(prismaClient);
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
        const user = await this.userService.getUserByUsername(inputData.username)|| 
        await this.userService.getUserByEmail(inputData.username);
        console.log('[Signin authservice] User found:', user ? user.username : 'null');
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
        const accessToken = JwtUtils.generateAccessToken(loginResponse);
        const refreshToken = JwtUtils.generateRefreshToken(loginResponse);
        const twoFactorMethods = await this.userService.getTwoFactorMethods(user.id);
        const isTwoFactorEnabled = twoFactorMethods.length > 0;
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
        const user = await this.userService.getUserById(userId);
        if (!user) {
            return null;
        }
        // return user profile data excluding sensitive information
        const twoFactorMethods = await this.userService.getTwoFactorMethods(user.id);
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