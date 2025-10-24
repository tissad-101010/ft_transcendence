/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AuthLogin.service.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 11:38:09 by tissad            #+#    #+#             */
/*   Updated: 2025/10/24 18:46:31 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { SignupUserInput } from '../types/user.type'
import { SigninUserInput } from '../types/user.type'
import { SigninResponse } from '../types/user.type'
import { SignupResponse } from '../types/user.type'
import { DataResponse } from '../types/user.type'

import { FastifyInstance } from 'fastify'
//in the next ligne import jwt
import jwt from 'jsonwebtoken'


export class UserService {
  constructor(private app: FastifyInstance) {}
  
  async signupUser(input: SignupUserInput): Promise<SignupResponse> {
    const { username, email, password } = input;
    const newUser = await this.app.prisma.user.create({
      data: {
        username,
        email,
        password,
      },
    });
    if (!newUser) {
      console.log('[UserService] Error creating user');
    }
    else{
      console.log(`[UserService] User created with ID: ${newUser.id}`);
    }

    return { "message": "User created successfully", id: newUser.id, username: email, email: email };
  }







  
  async signinUser(input: SigninUserInput): Promise<SigninResponse> {
    const { username, password } = input;
    let user = await this.app.prisma.user.findUnique({
      where: { email: username },
    });
    if (!user){
      user = await this.app.prisma.user.findUnique({  
        where: { username: username },
      });
    }
    if (!user || user.password !== password) {
      console.log('[UserService] Invalid credentials'); 
      return { message: 'Invalid username or password', data: null };
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      'your_access_token_secret', // replace with your secret
      { expiresIn: '15m' } // access token valid for 15 minutes
    );  
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      'your_refresh_token_secret', // replace with your secret
      { expiresIn: '7d' } // refresh token valid for 7 days
    );
    const enabled2FA = user.email_2fa || user.phone_2fa || user.autenticator_2fa;
    return { 
      "message": "Signin successful", 
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        email2FA: user.email_2fa,
        phone2FA: user.phone_2fa,
        authenticator2FA: user.autenticator_2fa,
        enabled2FA: enabled2FA,
        accessToken: accessToken,
        refreshToken: refreshToken
      }
    };
  } 

  async getByUsername(username: string) {
    return this.app.prisma.user.findUnique({
      where: { username},
    });
  }
  async getByEmail(email: string) {
    return this.app.prisma.user.findUnique({
      where: { email },
    });
  }

}