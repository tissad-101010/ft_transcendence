/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.middleware.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/08 15:30:52 by tissad            #+#    #+#             */
/*   Updated: 2025/12/08 18:11:57 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtUtils } from '../utils/jwt.utils';
import { UsersService } from '../modules/users/users.services';
import jwt, { JwtPayload } from 'jsonwebtoken';

export async function JwtMiddleware(req: FastifyRequest, reply: FastifyReply){
    try {
        const userService = new UsersService(req.server.prisma);
        const redisClient = req.server.redis;
        const cookies = JwtUtils.extractCookiesFromRequest(req);
        if (!cookies) {
            return reply.status(401).send({ message: 'Cookies missing' });
        }
        const access_token = JwtUtils.extractTokenFromCookies(cookies, 'access_token');
        if (!access_token) {
            return reply.status(401).send({ message: 'Access token missing in cookies' });
        }
        else {
            console.log('Access token found in cookies:', access_token);
            
            try {
                const secret = process.env.ACCESS_TOKEN_SECRET;
                if (!secret) {
                    return reply.status(500).send({ message: 'Access token secret not configured' });
                }
                const payload = jwt.verify(access_token, secret) as JwtPayload;
                console.log('===============================================>Access token payload:', payload);
                if (!payload) {
                    return reply.status(401).send({ message: 'Invalid access token payload' });
                }
            } catch (error) {
                if (error == 'TokenExpiredError: jwt expired') {
                    return reply.status(401).send({ message: '=================================Access token expired' });
                } else {
                    return reply.status(401).send({ message: 'Invalid access token' });
                }
            }
        }

    } catch (error) {
        console.error('JWT Middleware error:', error);
        return reply.status(500).send({ message: 'Internal server error' });
    }
}


