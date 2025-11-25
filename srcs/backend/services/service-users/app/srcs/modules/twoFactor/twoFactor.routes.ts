/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   twoFactor.routes.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:55:45 by tissad            #+#    #+#             */
/*   Updated: 2025/11/25 21:15:43 by tissad            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { TwoFactorAuthController } from "./twoFactor.controllers";


/* ************************************************************************** */
/*                          Two Factor Auth Routes                            */
/* ************************************************************************** */

/**
 * @function TwoFactorAuth
 * @description Sets up the routes for Two Factor Authentication (2FA) functionalities.
 * @param fastify - The Fastify instance to which the routes will be added.
 * @returns void
 * @author tissad <tissad@student.42.fr>
 * @date 2025/09/16
 *
 */

export  async function TwoFactorAuth(fastify: FastifyInstance) {

  const twoFactorAuthController = new TwoFactorAuthController(fastify);
  /******************************************************************************/
  /*                          Two Factor Auth by Email                          */
  /******************************************************************************/
  // Enable TFA by Email OTP
  fastify.post("/email-enable-sendOtp", twoFactorAuthController.sendOtpByEmailForEnableTfaController);
  fastify.post("/email-enable", twoFactorAuthController.enableEmailOtpForTfaController);
  // Verify TFA by Email OTP
  fastify.post("/email-sendOtp", twoFactorAuthController.sendOtpByEmailForTfaController);
  fastify.post("/email-verifyOtp", twoFactorAuthController.verifyEmailOtpForTfaController);
  // Disable TFA by Email OTP
  fastify.post("/email-disable", twoFactorAuthController.disableEmailOtpForTfaController);
  /******************************************************************************/
  /*                          Two Factor Auth by TOTP                           */
  /******************************************************************************/
  // send QR code to user
  fastify.get("/totp-secret", twoFactorAuthController.sendQrCodeController);  
  // Enable TFA by TOTP
  fastify.post("/totp-enable", twoFactorAuthController.enableTwoFactorTotpController);
  // Verify TFA by TOTP
  fastify.post("/totp-verify", twoFactorAuthController.verifyTwoFactorTotpController);
  // Disable TFA by TOTP
  fastify.post("/totp-disable", twoFactorAuthController.disableTwoFactorTotpController);
}