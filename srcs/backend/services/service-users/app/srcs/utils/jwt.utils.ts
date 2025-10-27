/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   jwt.utils.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 14:02:23 by tissad            #+#    #+#             */
/*   Updated: 2025/10/27 14:32:27 by tissad           ###   ########.fr       */
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
            return null; // ou lever une erreur selon ton besoin
        }
    }
}