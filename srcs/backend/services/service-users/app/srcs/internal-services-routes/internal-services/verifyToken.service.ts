/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   verifyToken.service.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 12:43:37 by tissad            #+#    #+#             */
/*   Updated: 2025/11/21 12:46:07 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { JwtUtils } from "../../utils/jwt.utils";

export async function verifyTokenService(tocken : string): Promise<boolean> {
    const decoded = JwtUtils.verifyToken(tocken, process.env.INTERNAL_API_KEY!);
    
