/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   otp.routes.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:55:45 by tissad            #+#    #+#             */
/*   Updated: 2025/10/17 12:04:47 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { TwoFactorAuthController } from "../controllers/otp.controller";
import { TwoFactorAuthService } from "../services/2fa.service";

export  async function otpRoutes(fastify: FastifyInstance) {
  const twoFactorAuthService = new TwoFactorAuthService(fastify);
  const twoFactorAuthController = new TwoFactorAuthController(twoFactorAuthService);

  fastify.post("/email", twoFactorAuthController.SendOtpByEmail);
  fastify.post("/verify", twoFactorAuthController.verifyOtp);
}