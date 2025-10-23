/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TwoFactorAuth.routes.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:55:45 by tissad            #+#    #+#             */
/*   Updated: 2025/10/23 15:19:24 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { TwoFactorAuthController } from "../controllers/TwoFactorAuth.controller";
import { TwoFactorAuthService } from "../services/TwoFactorAuth.service";

export  async function TwoFactorAuth(fastify: FastifyInstance) {
  const twoFactorAuthService = new TwoFactorAuthService(fastify);
  const twoFactorAuthController = new TwoFactorAuthController(twoFactorAuthService);


  // Define routes
  // need route to enable 2fa with email otp verification first
  // fastify.post("/email-enable", twoFactorAuthController.enableEmailOtpForTfa);
  // Generate OTP email
  fastify.post("/email-sendOtp", twoFactorAuthController.SendOtpByEmail);
  // Verify OTP email
  fastify.post("/email-verify", twoFactorAuthController.verifyOtp);
  //need routes to disable email otp verification
  // fastify.post("/email-disable", twoFactorAuthController.disableEmailOtpForTfa);

  
  // google auth routes
  // enable googe auth tfa
  // fastify.post("/authenticator-enable", twoFactorAuthController.enableTwoFactorAuth);
  // // send qr code
  // fastify.get("/authenticator-sendQrcode", twoFactorAuthController.sendQrCode);  
  // // disable google auth tfa
  // fastify.post("/authenticator-disable", twoFactorAuthController.disableTwoFactorAuth);
  // verify google auth tfa
  fastify.post("/authenticator-verify", twoFactorAuthController.verifyTwoFactorAuth);
}