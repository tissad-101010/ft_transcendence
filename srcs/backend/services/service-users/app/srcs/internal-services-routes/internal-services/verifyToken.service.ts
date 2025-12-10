/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   verifyToken.service.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 12:43:37 by tissad            #+#    #+#             */
/*   Updated: 2025/11/21 14:24:09 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { JwtUtils } from "../../utils/jwt.utils";

// fuction to verify token returns the payload if the token is valid
export async function verifyTokenService(tocken : string): Promise<any> {
    try {
        const payload = JwtUtils.verifyAccessToken(tocken);
        return payload;
    }
    catch (error) {
        return null;
    }
}