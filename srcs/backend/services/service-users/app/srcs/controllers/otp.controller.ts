/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   otp.controller.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 19:00:31 by tissad            #+#    #+#             */
/*   Updated: 2025/10/17 12:02:17 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// srcs/controllers/otp.controller.ts
// print logs whit the file name


import { FastifyReply, FastifyRequest } from "fastify";
import { TwoFactorAuthService } from "../services/2fa.service";
import {  OtpEmailRequest,
          VerifyOtpEmailRequest,
       } from "../types/otp.type";

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
    const mailSent = await this.twoFactorAuthService.SendOtpByEmail(email);
    
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
}
