/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   internalVerifyToken.routes.ts                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 14:40:28 by tissad            #+#    #+#             */
/*   Updated: 2025/11/21 16:47:03 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { verifyTokenController } from "../internal-controllers/verifyToken.controllers";
export async function internalVerifyTokenRoutes(app: FastifyInstance) {
  app.post("/verify-token", verifyTokenController);
}   