/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   twoFactor.controllers.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:48:33 by tissad            #+#    #+#             */
/*   Updated: 2025/11/04 16:32:19 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// srcs/controllers/otp.controller.ts
// print logs whit the file name
//


const userId = 1; // temporary user id for testing

import { JwtUtils } from "../../utils/jwt.utils";
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
  // function that : 
      // extract coockies from the header
      // extarct Jwt token from cookies 
      // verify Jwt token and get user id and email
  static extactUserFromRequest = (req: FastifyRequest): { userId: number; email: string } | null => {
    try {
      const cookies = req.cookies;
      const token = cookies?.jwt;
      if (!token) {
        console.error("❌ [2fa.controller.ts] No JWT token found in cookies");
        return null;
      }
      const payload = JwtUtils.verifyToken(token, process.env.TEMP_TOKEN_SECRET!);
      if (!payload || typeof payload === "string") {
        console.error("❌ [2fa.controller.ts] Invalid JWT token payload");
        return null;
      }
      const { userId, email } = payload as { userId: number; email: string };
      return { userId, email };
    } catch (error) {
      console.error("❌ [2fa.controller.ts] Error extracting user from request:", error);
      return null;
    }
  };
  
  // enable TFA for user
  enableTfa = async (
    req: FastifyRequest,
    reply: FastifyReply
  ) => {
    // extract coockies from the header

    // extarct Jwt token from cookies
    
    // verify Jwt token and get user id and email
    
    
    const { userId, method } = req.body as { userId: number; method: string };
    const success = await this.twoFactorAuthService.enableTfaForUser(userId, method);
    if (success) {
      console.log("✅ [2fa.controller.ts] TFA enabled for user ID:", userId);
      return reply.send({ message: "Two-factor authentication enabled ✅" });
    } else {
      console.error("❌ [2fa.controller.ts] Failed to enable TFA for user ID:", userId);
      return reply.status(500).send({ message: "Failed to enable two-factor authentication ❌" });
    }
  };
  
  // Send OTP via Email
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
  verifyOtpEmail = async (
    req: FastifyRequest<{ Body: VerifyOtpEmailRequest }>,
    reply: FastifyReply
  ) => {
    const { email, otp } = req.body;
    console.log("[otp.controller.ts] Verifying OTP for email:", email);
    const isValid = await this.twoFactorAuthService.verifyOtpEmail(email, otp);

    if (!isValid) {
      console.error("❌ [otp.controller.ts] OTP verification failed for email:", email);
      return reply.status(400).send({ message: "Invalid or expired OTP ❌" });
    } else {
      console.log("✅ [otp.controller.ts] OTP verified successfully for email:", email);
      return reply.send({ message: "OTP verified successfully ✅" });
    }
  };

  // setup TFA for user with google authenticator app
  
  setupTotpAuth = async (
    req: FastifyRequest,
    reply: FastifyReply
  ) => {
    // const userId = (req.params as any).userId;
    try {
      const qrCodeUrl = await this.twoFactorAuthService.generateTotpSecretAndQrCode(Number(userId));
      console.log("✅ [2fa.controller.ts] TFA setup successful for user ID:", userId);
      reply.send({ qrCodeUrl, message: 'TFA setup successful ✅' });
    } catch (error: any) {
      console.error("❌ [2fa.controller.ts] Error setting up TFA for user ID:", userId, error);
      return reply.status(500).send({ message: "Error setting up two-factor authentication ❌" });
    }
  }
  // verify TFA token for user
  verifyTotpAuth = async (
    req: FastifyRequest,
    reply: FastifyReply
  ) => {
  const { userId, token } = req.body as { userId: string; token: string };
    try {
      const isValid = await this.twoFactorAuthService.verifyTotpTocken(Number(userId), token);
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
