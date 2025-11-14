/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   twoFactor.routes.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:55:45 by tissad            #+#    #+#             */
/*   Updated: 2025/11/14 15:58:05 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { TwoFactorAuthController } from "./twoFactor.controllers";
import { TwoFactorAuthService } from "./twoFactor.services";

export  async function TwoFactorAuth(fastify: FastifyInstance) {

  const twoFactorAuthController = new TwoFactorAuthController(fastify.prisma);


  // Define routes
  // need route to enable 2fa with email otp verification first
  // fastify.post("/email-enable", twoFactorAuthController.enableEmailOtpForTfa);
  // Generate OTP email
  fastify.post("/email-sendOtp", twoFactorAuthController.SendOtpByEmail);
  // Verify OTP email
  // fastify.post("/email-verify", twoFactorAuthController.verifyOtpByEmail);
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
//   fastify.post("/authenticator-verify", twoFactorAuthController.verifyTwoFactorAuth);
}