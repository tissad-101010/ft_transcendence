/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   twoFactor.routes.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: issad <issad@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:55:45 by tissad            #+#    #+#             */
/*   Updated: 2025/11/22 19:45:27 by issad            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { TwoFactorAuthController } from "./twoFactor.controllers";

export  async function TwoFactorAuth(fastify: FastifyInstance) {

  const twoFactorAuthController = new TwoFactorAuthController(fastify);


  // Define routes
  // need route to enable 2fa with email otp verification first
  fastify.post("/email-sendOtp", twoFactorAuthController.sendOtpByEmailForTfaController);
  fastify.post("/email-enable", twoFactorAuthController.enableEmailOtpForTfaController);

  // fastify.post("/email-sendOtp", twoFactorAuthController.sendOtpByEmail);
  // Verify OTP email
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