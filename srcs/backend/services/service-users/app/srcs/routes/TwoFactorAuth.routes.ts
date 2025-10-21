/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TwoFactorAuth.routes.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:55:45 by tissad            #+#    #+#             */
/*   Updated: 2025/10/21 17:35:40 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { TwoFactorAuthController } from "../controllers/TwoFactorAuth.controller";
import { TwoFactorAuthService } from "../services/TwoFactorAuth.service";

export  async function otpRoutes(fastify: FastifyInstance) {
  const twoFactorAuthService = new TwoFactorAuthService(fastify);
  const twoFactorAuthController = new TwoFactorAuthController(twoFactorAuthService);


  // Define routes
  // need route to enable 2fa with email otp verification first
  
  // Generate OTP email
  fastify.post("/email", twoFactorAuthController.SendOtpByEmail);
  // Verify OTP email
  fastify.post("/verify", twoFactorAuthController.verifyOtp);
  //need routes to disable email otp verification

  
  // google auth routes
  // enable googe auth tfa
  fastify.post("/enable-tfa", twoFactorAuthController.setupTwoFactorAuth);
  // fastify.post("/disable-tfa", twoFactorAuthController.disableTwoFactorAuth);
  fastify.post("/verify-tfa", twoFactorAuthController.verifyTwoFactorAuth);
}