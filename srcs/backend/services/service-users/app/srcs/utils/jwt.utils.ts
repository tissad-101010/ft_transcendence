/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   jwt.utils.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: issad <issad@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 14:02:23 by tissad            #+#    #+#             */
/*   Updated: 2025/12/09 17:30:12 by issad            ###   ########.fr       */
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
        } catch (error) {
            console.error('JWT verification error:', error);
            return null;
        }
    }
    static generateAccessToken(payload: Record<string, any>): string {
        return this.generateToken(
            payload,
            process.env.ACCESS_TOKEN_SECRET!,
            // process.env.ACCESS_TOKEN_EXPIRATION! ||
            process.env.ACCESS_TOKEN_EXPIRATION! || '60m' // for testing purpose
        );
    }

    static generateRefreshToken(payload: Record<string, any>): string {
        return this.generateToken(
            payload,
            process.env.REFRESH_TOKEN_SECRET!,
            process.env.REFRESH_TOKEN_EXPIRATION! ||
            '7d' // for testing purpose
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
            // maxAge: 60 * 15, // 15 minutes
        });
    }
    static setRefreshTokenCookie(reply: any, token: string) {
        reply.setCookie('refresh_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none', // to be changed to 'strict' in production
            // secure: process.env.NODE_ENV === 'production',
            // sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            
        });
    }
    
    static setTempTokenCookie(reply: any, token: string) {
        reply.setCookie('temp_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            // secure: process.env.NODE_ENV === 'production',
            // sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',
            path : '/',
            maxAge: 10 * 60, // 10 minutes
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

    static verifyTempToken(token: string): JwtPayload | null {
        return this.verifyToken(token, process.env.TEMP_TOKEN_SECRET!);
    }
    
    static clearTempTokenCookie(reply: any) {
        reply.clearCookie('temp_token');
    }
    
    static extractCookiesFromRequest(req: any): Record<string, string> {   
        return req.cookies || {};
    }
    
    static extractTokenFromCookies(cookies: Record<string, string>, tokenName: string): string | null {
        return cookies[tokenName] || null;
    }

    static extractUserFromAccessToken(access_token: string | null): { userId: string; email: string } | null {
        try {
          if (!access_token) {
            console.error("❌ [jwt.utils.ts] No JWT token found in cookies");
            return null;
          }
          const payload = JwtUtils.verifyAccessToken(access_token);
        //   console.log("✅ [jwt.utils.ts] Extracted user from request:", payload);
          if (!payload) {
            console.error("❌ [jwt.utils.ts] Invalid JWT token");
            return null;
          }
          const userId = payload.id;
          const email = payload.email;
        //   console.log("✅ [jwt.utils.ts] Extracted userId and email:", userId, email);
          return { userId, email };
        } catch (error) {
          console.error("❌ [jwt.utils.ts] Error extracting user from request:", error);
          return null;
        }
    };
    static extractUserFromRefreshToken(refresh_token: string | null): { userId: string; email: string } | null {
        try {
          if (!refresh_token) {
            console.error("❌ [jwt.utils.ts] No JWT token found in cookies");
            return null;
          }
          const payload = JwtUtils.verifyRefreshToken(refresh_token);
        //   console.log("✅ [jwt.utils.ts] Extracted user from request:", payload);
          if (!payload) {
            console.error("❌ [jwt.utils.ts] Invalid JWT token");
            return null;
          }
          const userId = payload.id;
          const email = payload.email;
        //   console.log("✅ [jwt.utils.ts] Extracted userId and email:", userId, email);
          return { userId, email };
        } catch (error) {
          console.error("❌ [jwt.utils.ts] Error extracting user from request:", error);
          return null;
        }
    };
    static extractUserFromTempToken(temp_token: string | null): { userId: string; email: string } | null {
        try {
            if (!temp_token) {
                console.error("❌ [jwt.utils.ts] No JWT token found in cookies");
                return null;
            }
            const payload = JwtUtils.verifyTempToken(temp_token);
            // console.log("✅ [jwt.utils.ts] Extracted user from request:", payload);
            if (!payload) {
                console.error("❌ [jwt.utils.ts] Invalid JWT token");
                return null;
            }
            const userId = payload.id;
            const email = payload.email;
            // console.log("✅ [jwt.utils.ts] Extracted userId and email:", userId, email);
            return { userId, email };
        } catch (error) {
            console.error("❌ [jwt.utils.ts] Error extracting user from request:", error);
            return null;
        }
    };
}