/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   signout.services.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 12:57:38 by tissad            #+#    #+#             */
/*   Updated: 2025/11/20 12:59:43 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from 'fastify';  
/***********************************/
/*     Signout Service Class       */
/***********************************/

export class SignoutService {
    private redisClient: any;
    private prismaClient: any;
    
    constructor(app: FastifyInstance) {
        this.prismaClient = app.prisma;
        this.redisClient = app.redis;
    }
    async logoutUser(userId: string): Promise<boolean> {
        try {
            // Supprimer le refresh token de Redis
            await this.redisClient.del(`refresh_Token:${userId}`);
            // await this.redisClient.del(`access_Token:${userId}`);
            console.log(`[SignoutService] User ${userId} logged out successfully.`);
            return true;
        } catch (error) {
            console.error(`[SignoutService] Error logging out user ${userId}:`, error);
            return false;
        }   
    }
}