/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   twoFactor.controllers.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:48:33 by tissad            #+#    #+#             */
/*   Updated: 2025/10/30 17:51:38 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// srcs/controllers/otp.controller.ts
// print logs whit the file name
//
const userId = 1; // temporary user id for testing

import { FastifyReply, FastifyRequest } from "fastify";
import { TwoFactorAuthService } from "./twoFactor.services";
import {  OtpEmailRequest,
          VerifyOtpEmailRequest,
       } from "../../types/otp.type";


export class TwoFactorAuthController {
  private twoFactorAuthService: TwoFactorAuthService;

  constructor(twoFactorAuthService: TwoFactorAuthService) {
    this.twoFactorAuthService = twoFactorAuthService;
  }

  // Generate OTP
  SendOtpByEmail = async (
    req: FastifyRequest<{ Body: OtpEmailRequest }>,
    reply: FastifyReply
  ) => {
    const { email } = req.body;
    const mailSent = await this.twoFactorAuthService.sendOtpByEmail(email);
    
    // If mail sending failed, return error response
    if (!mailSent) {
      console.error("❌ [otp.controller.ts] Failed to send OTP email to:", email);
      return reply.status(500).send({ message: "Failed to send OTP email", mailSent });
    }
    else{
      console.log("✅ [otp.controller.ts] OTP email sent to:", email);
      return reply.send({ message: "OTP email sent successfully ✅", mailSent });
    }
  };
  
  // Verify OTP
  verifyOtp = async (
    req: FastifyRequest<{ Body: VerifyOtpEmailRequest }>,
    reply: FastifyReply
  ) => {
    const { email, otp } = req.body;
    console.log("[otp.controller.ts] Verifying OTP for email:", email);
    const isValid = await this.twoFactorAuthService.verifyOtp(email, otp);

    if (!isValid) {
      console.error("❌ [otp.controller.ts] OTP verification failed for email:", email);
      return reply.status(400).send({ message: "Invalid or expired OTP ❌" });
    } else {
      console.log("✅ [otp.controller.ts] OTP verified successfully for email:", email);
      return reply.send({ message: "OTP verified successfully ✅" });
    }
  };

  // setup TFA for user with google authenticator app
  
  setupTwoFactorAuth = async (
    req: FastifyRequest,
    reply: FastifyReply
  ) => {
    // const userId = (req.params as any).userId;
    try {
      const qrCodeUrl = await this.twoFactorAuthService.generateTfaSecretAndQrCode(userId);
      console.log("✅ [2fa.controller.ts] TFA setup successful for user ID:", userId);
      reply.send({ qrCodeUrl, message: 'TFA setup successful ✅' });
    } catch (error: any) {
      console.error("❌ [2fa.controller.ts] Error setting up TFA for user ID:", userId, error);
      return reply.status(500).send({ message: "Error setting up two-factor authentication ❌" });
    }
  }
  // verify TFA token for user
  verifyTwoFactorAuth = async (
    req: FastifyRequest,
    reply: FastifyReply
  ) => {
  const { userId, token } = req.body as { userId: string; token: string };
    try {
      const isValid = await this.twoFactorAuthService.verifyTfaToken(Number(userId), token); 
      if (!isValid) {
        return reply.status(400).send({ message: "Invalid TFA token ❌" });
      } else {
        return reply.send({ message: "TFA token verified successfully ✅" });
      }
    } catch (error: any) {
      console.error("❌ [2fa.controller.ts] Error verifying TFA token for user ID:", userId, error);
      return reply.status(500).send({ message: "Error verifying two-factor authentication token ❌" });
    }
  };
}
