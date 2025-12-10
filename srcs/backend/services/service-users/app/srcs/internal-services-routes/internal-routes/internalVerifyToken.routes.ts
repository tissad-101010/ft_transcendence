/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   internalVerifyToken.routes.ts                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 14:40:28 by tissad            #+#    #+#             */
/*   Updated: 2025/12/01 11:52:32 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { verifyTokenController } from "../internal-controllers/verifyToken.controllers";

export async function internalVerifyTokenRoutes(app: FastifyInstance) {
  app.post("/verify-token", verifyTokenController);
}   