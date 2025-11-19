/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   user.types.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 15:14:54 by tissad            #+#    #+#             */
/*   Updated: 2025/11/19 12:40:23 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


/***********************************/
/*         User Interfaces         */
/***********************************/

export type UserRole = 'USER' | 'ADMIN';

export type TwoFactorType = 'TOTP' | 'SMS' | 'EMAIL';

export type OAuthProviderType = 'GOOGLE' | 'GITHUB' | 'FORTYTWO';



/***********************************/
/*       User Two-Factor Method    */
/***********************************/
export interface TwoFactorMethod {
  id: string;
  type: TwoFactorType;
  enabled: boolean;
  createdAt: Date;
}

/***********************************/
/*        User OAuth Provider      */
/***********************************/
export interface OAuthProvider {
  provider: OAuthProviderType;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
}

/***********************************/
/*          User Profile           */
/***********************************/
export interface UserProfile {
  id?: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  passwordHash?: string;
  phoneNumber?: string;
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  // 2FA
  twoFactorEnabled?: boolean;
  twoFactorMethods?: TwoFactorMethod[];

  // OAuth
  oauthProviders?: OAuthProvider[];

  // Profil
  displayName?: string;
  avatarUrl?: string;
  role?: UserRole;

  createdAt?: Date;
  updatedAt?: Date;
}

/***********************************/
/*      User Data Transfer Objects */
/***********************************/
export interface CreateUserDTO {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  oauthProvider?: OAuthProvider;
  
}

/************************************/
/*      User Data Transfer Objects */
/************************************/
export interface UpdateUserDTO {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  displayName?: string;
  avatarUrl?: string;
  role?: UserRole;
}

/************************************/
/*      User Verification DTO       */
/************************************/
export interface VerifyUserDTO {
  email: string;
  code: string;
}

/************************************/
/*      User Password Reset DTO     */
/************************************/
export interface ResetPasswordDTO {
  email: string;
  code: string;
  newPassword: string;
} 

/************************************/
/*      User Signup DTO             */  
/************************************/
export interface SignupUserDTO {
  email: string;
  username: string;
  password: string;
}


/************************************/
/*      User Signup Response DTO    */
/************************************/

export interface SignupResponseDTO {
  message: string;
  signupComplete: boolean;
  errors?:any;
}

/************************************/
/*      User Login DTO              */  
/************************************/
export interface LoginUserDTO {
  userAgent: string;
  ipAddress: string;
  username: string;
  password: string;
}
/************************************/
/*      User Login Response DTO     */
/************************************/
export interface LoginResponseDTO {
  signinComplete: boolean;
  message?: string;
  twoFactorRequired?: boolean;
  methodsEnabled?: TwoFactorType[];
  accessToken?: string;
  refreshToken?: string;
  tempToken?: string;
}
/************************************/
/*      Authenticated User DTO      */
/************************************/
export interface AuthenticatedUserDTO {
  id: string;
  email: string;
}


/************************************/
/*      User OAuth Login DTO        */
/************************************/ 
export interface OAuthLoginDTO {
  provider: OAuthProviderType;
  accessToken: string;
}