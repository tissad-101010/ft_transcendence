/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   jwt.utils.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 14:02:23 by tissad            #+#    #+#             */
/*   Updated: 2025/10/30 15:14:51 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// class to handle JWT utilities
import jwt, { JwtPayload } from 'jsonwebtoken';

/***********************************/
/*        JWT Utility Class        */
/***********************************/

export class JwtUtils {
    // Placeholder for JWT utility methods
    static generateToken(payload: Record<string, any>, secret: string, expiresIn: string): string {
        return jwt.sign(
            payload,
            secret as jwt.Secret,
            { expiresIn } as jwt.SignOptions
        );
    }

    static verifyToken(token: string, secret: string): JwtPayload | null {
        try {
            return jwt.verify(token, secret) as JwtPayload;
        } catch {
            return null; 
        }
    }
    static generateAccessToken(payload: Record<string, any>): string {
        return this.generateToken(
            payload,
            process.env.ACCESS_TOKEN_SECRET!,
            process.env.ACCESS_TOKEN_EXPIRATION!
        );
    }

    static generateRefreshToken(payload: Record<string, any>): string {
        return this.generateToken(
            payload,
            process.env.REFRESH_TOKEN_SECRET!,
            process.env.REFRESH_TOKEN_EXPIRATION!
        );
    }   

    static setAccessTockenCookie(reply: any, token: string) {
        reply.setCookie('access_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict', 
        });
    }
    static setRefreshTockenCookie(reply: any, token: string) {
        reply.setCookie('refresh_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict', 
        });
    }
    
    static clearAuthCookies(reply: any) {
        reply.clearCookie('access_token');
        reply.clearCookie('refresh_token');
    }
    
    static verifyAccessToken(token: string): JwtPayload | null {
        return this.verifyToken(token, process.env.ACCESS_TOKEN_SECRET!);
    }

    static verifyRefreshToken(token: string): JwtPayload | null {
        return this.verifyToken(token, process.env.REFRESH_TOKEN_SECRET!);
    }

    static getTokenFromCookies(cookies: Record<string, string>, tokenName: string): string | null {
        return cookies[tokenName] || null;
    }
}