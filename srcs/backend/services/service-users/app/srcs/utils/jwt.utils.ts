/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   jwt.utils.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 14:02:23 by tissad            #+#    #+#             */
/*   Updated: 2025/10/31 16:52:20 by tissad           ###   ########.fr       */
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

    static generateTwoFactorTempToken(payload: Record<string, any>): string {
        return this.generateToken(
            payload,
            process.env.TEMP_TOKEN_SECRET!, 
            process.env.TEMP_TOKEN_EXPIRATION!
        );
    }

    static setAccessTokenCookie(reply: any, token: string) {
        reply.setCookie('access_token', token, {
            httpOnly: true,
            secure: true,
            sameSite:'none', // to be changed to 'strict' in production
            // secure: process.env.NODE_ENV === 'production',
            // sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
            path: '/',
            maxAge: 60 * 1, // 15 minutes
        });
    }
    static setRefreshTokenCookie(reply: any, token: string) {
        reply.setCookie('refresh_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none', // to be changed to 'strict' in production
            // secure: process.env.NODE_ENV === 'production',
            // sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
        });
    }
    
    static setTempTokenCookie(reply: any, token: string) {
        reply.setCookie('temp_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
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

    static clearTempTokenCookie(reply: any) {
        reply.clearCookie('temp_token');
    }



    static extractUserFromRequest = (req: any): { userId: string; email: string } | null => {
        try {
          const cookies = req.cookies;
          const token = JwtUtils.getTokenFromCookies(cookies, 'access_token');
          if (!token) {
            console.error("❌ [jwt.utils.ts] No JWT token found in cookies");
            return null;
          }
          const payload = JwtUtils.verifyAccessToken(token);
          console.log("✅ [jwt.utils.ts] Extracted user from request:", payload);
          if (!payload) {
            console.error("❌ [jwt.utils.ts] Invalid JWT token");
            return null;
          }
          const userId = payload.id;
          const email = payload.email;
          console.log("✅ [jwt.utils.ts] Extracted userId and email:", userId, email);
          return { userId, email };
        } catch (error) {
          console.error("❌ [jwt.utils.ts] Error extracting user from request:", error);
          return null;
        }
      };
}