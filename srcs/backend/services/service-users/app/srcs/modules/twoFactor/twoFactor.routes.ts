/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   twoFactor.routes.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:55:45 by tissad            #+#    #+#             */
/*   Updated: 2025/11/25 18:00:38 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { TwoFactorAuthController } from "./twoFactor.controllers";

export  async function TwoFactorAuth(fastify: FastifyInstance) {

  const twoFactorAuthController = new TwoFactorAuthController(fastify);


  // Define routes
  // need route to enable 2fa with email otp verification first
  fastify.post("/email-enable-sendOtp", twoFactorAuthController.sendOtpByEmailForEnableTfaController);
  fastify.post("/email-enable", twoFactorAuthController.enableEmailOtpForTfaController);
  fastify.post("/email-sendOtp", twoFactorAuthController.sendOtpByEmailForTfaController);
  fastify.post("/email-verifyOtp", twoFactorAuthController.verifyEmailOtpForTfaController);
  fastify.post("/email-disable", twoFactorAuthController.disableEmailOtpForTfaController);
  fastify.get("/totp-secret", twoFactorAuthController.sendQrCodecontroller);  
  fastify.post("/totp-enable", twoFactorAuthController.enableTwoFactorTotpController);
  fastify.post("/totp-verify", twoFactorAuthController.verifyTwoFactorTotpController);

  // Verify OTP email
  //need routes to disable email otp verification

  
  // google auth routes
  // enable googe auth tfa
  // // send qr code
  // // disable google auth tfa
  // fastify.post("/authenticator-disable", twoFactorAuthController.disableTwoFactorAuth);
  // verify google auth tfa
//   fastify.post("/authenticator-verify", twoFactorAuthController.verifyTwoFactorAuth);
}