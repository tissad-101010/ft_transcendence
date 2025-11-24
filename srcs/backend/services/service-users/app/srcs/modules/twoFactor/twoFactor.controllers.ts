/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   twoFactor.controllers.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:48:33 by tissad            #+#    #+#             */
/*   Updated: 2025/11/24 18:13:56 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// srcs/controllers/otp.controller.ts
// print logs whit the file name
//

// il faut bien distinger le tmp token lors de l'activation de la 2fa et le token access pour l'authentification 2fa
// si 2fa est activée on doit utiliser le token access pour l'authentification 2fa
// sinon on doit utiliser le tmp token lors de l'activation de la 2fa
// une fois la 2fa activée on doit supprimer le tmp token
// il faut aussi envoyer un access token avec un flag 2fa_enabled a true ou false
// il faut aussi envoyer un refresh token
// une fois la 2fa verifiee la connexion est completee et l'utilisateur est authentifie


import { FastifyInstance } from "fastify";
import { FastifyReply, FastifyRequest } from "fastify";
import { send } from "process";

import { TwoFactorType } from "../../prisma/prisma/generated/client/enums";
import { JwtUtils } from "../../utils/jwt.utils";
import { TwoFactorAuthService } from "./twoFactor.services";

import {  OtpEmailRequest,
          VerifyOtpEmailRequest,
       } from "../../types/otp.type";

export class TwoFactorAuthController {
  private twoFactorAuthService: TwoFactorAuthService;
  private redisClient:any;
  constructor(server: FastifyInstance) {
    this.twoFactorAuthService = new TwoFactorAuthService(server);
    this.redisClient = server.redis;
  }

  sendOtpByEmailForEnableTfaController = async (
    req: FastifyRequest,
    reply: FastifyReply
  ) => {
    const cookies = JwtUtils.extractCookiesFromRequest(req);
    const accessToken = JwtUtils.extractTokenFromCookies(cookies, 'access_token');
    const user = JwtUtils.extractUserFromAccessToken(accessToken);
    if (accessToken === null || user === null) {
      console.error("❌ [2fa.controller.ts] User not found");
      return reply.status(401).send({ message: "Unauthorized ❌" });
    }
    const userId  = user.userId;
    const email   = user.email;
    console.log("[2fa.controller.ts] Enabling TFA for user ID:", userId, "email:", email);
    // Tmp Token user id and email extraction from request
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
  
  // verify otp and enable email otp for tfa
  enableEmailOtpForTfaController = async (
    req: FastifyRequest<{ Body: VerifyOtpEmailRequest }>,
    reply: FastifyReply
  ) => {
    // accessToken user id and email extraction from request
    const cookies = JwtUtils.extractCookiesFromRequest(req);
    const accessToken = JwtUtils.extractTokenFromCookies(cookies, 'access_token');
    const user = JwtUtils.extractUserFromAccessToken(accessToken);
    if (accessToken === null || user === null) {
      console.error("❌ [2fa.controller.ts] User not found");
      return reply.status(401).send({ message: "Unauthorized ❌" });
    }
    const userId  = user.userId;
    const email   = user.email;
    const type = TwoFactorType.EMAIL;
    console.log("[2fa.controller.ts] Verifying OTP and enabling TFA for user ID:", userId, "email:", email);
    // verify otp
    const { code } = req.body;
    console.log("[2fa.controller.ts] Verifying OTP for email:", email);
    console.log("[2fa.controller.ts] Provided OTP:", code);
    console.log("[2fa.controller.ts] request body:", req.body);
    const isValid = await this.twoFactorAuthService.verifyOtpEmail(email, code);
    if (!isValid) {
      console.error("❌ [2fa.controller.ts] OTP verification failed for email:", email);
      return reply.status(400).send({ message: "Invalid or expired OTP ❌" });
    } else {
      // enable email otp for tfa
      await this.twoFactorAuthService.enableTwoFactorAuth(userId, type);
      console.log("✅ [2fa.controller.ts] TFA enabled successfully for user ID:", userId);
      return reply.send({ message: "Two-factor authentication enabled successfully ✅" });
    }
  };
  
  
  sednOtpByEmailForTfaController = async (
    req: FastifyRequest<{ Body: OtpEmailRequest }>,
    reply: FastifyReply
  ) => {
    // Tmp Token user id and email extraction from request
    const cookies = JwtUtils.extractCookiesFromRequest(req);
    console.log("[2fa.controller.ts] Cookies extracted from request:", cookies);
    const tempToken = JwtUtils.extractTokenFromCookies(cookies, 'temp_token');
    console.log("[2fa.controller.ts] Temp token extracted from cookies:", tempToken);
    const user = JwtUtils.extractUserFromTempToken(tempToken);
    if (tempToken === null || user === null) {
      console.error("❌ [2fa.controller.ts] User not found");
      return reply.status(401).send({ message: "Unauthorized ❌" });
    }
    const userId  = user.userId;
    const email   = user.email;
    console.log("[2fa.controller.ts] Sending OTP email for sign-in TFA for user ID:", userId, "email:", email);
    const mailSent = await this.twoFactorAuthService.sendOtpByEmail(email); 
    if (!mailSent) {
      console.error("❌ [otp.controller.ts] Failed to send OTP email to:", email);
      return reply.status(500).send({ message: "Failed to send OTP email", mailSent });
    }
    else{
      console.log("✅ [otp.controller.ts] OTP email sent to:", email);
      return reply.send({ message: "OTP email sent successfully ✅", mailSent });
    }
  }
  


  verifyEmailOtpForTfaController = async (
    req: FastifyRequest<{ Body: VerifyOtpEmailRequest }>,
    reply: FastifyReply
  ) => {
    // Tmp Token user id and email extraction from request
    const cookies = JwtUtils.extractCookiesFromRequest(req);
    console.log("[2fa.controller.ts] Cookies extracted from request:", cookies);
    const tempToken = JwtUtils.extractTokenFromCookies(cookies, 'temp_token');
    console.log("[2fa.controller.ts] Temp token extracted from cookies:", tempToken);
    const user = JwtUtils.extractUserFromTempToken(tempToken);
    if (tempToken === null || user === null) {
      console.error("❌ [2fa.controller.ts] User not found");
      return reply.status(401).send({ message: "Unauthorized ❌" });
    }
    const userId  = user.userId;
    console.log("================================================================================[2fa.controller.ts] User ID from temp token:", userId);
    const email   = user.email;
    console.log("[2fa.controller.ts] Verifying OTP for sign-in TFA for user ID:", userId, "email:", email);
    const { code } = req.body;
    console.log("[2fa.controller.ts] Verifying OTP for email:", email);
    console.log("[2fa.controller.ts] Provided OTP:", code);
    console.log("[2fa.controller.ts] request body:", req.body);
    const isValid = await this.twoFactorAuthService.verifyOtpEmail(email, code);  
    if (!isValid) {
      console.error("❌ [2fa.controller.ts] OTP verification failed for email:", email);
      return reply.status(400).send({ message: "Invalid or expired OTP ❌" });
    }
    else {
      console.log("✅ [2fa.controller.ts] OTP verified successfully for email:", email);
      
      const accessToken = JwtUtils.generateAccessToken(user);
      const refreshToken = JwtUtils.generateRefreshToken(user);
      // store refresh token in redis cache
        // store refresh token in redis cache
        await this.redisClient.set(
            `refresh_token:${refreshToken}`,
            userId,
            'EX',
            60 * 60 * 24 * 7
        );

        // store access token in redis cache (optional)
        await this.redisClient.set(
            `access_token:${userId}`,
            accessToken,
            'EX',
            60 * 15// 15 minutes
        );
      JwtUtils.setTempTokenCookie(reply, ''); // clear temp token cookie
      JwtUtils.setAccessTokenCookie(reply, accessToken); 
      JwtUtils.setRefreshTokenCookie(reply, refreshToken);
      return reply.code(200).send({
        success: true, 
        message: "OTP verified successfully ✅" 
      });
    }
  };

  
  // Verify OTP
  private verifyOtpEmailController = async (
    req: FastifyRequest<{ Body: VerifyOtpEmailRequest }>,
    reply: FastifyReply
  ) => {
    const { email, code } = req.body;
    console.log("[otp.controller.ts] Verifying OTP for email:", email);
    const isValid = await this.twoFactorAuthService.verifyOtpEmail(email, code);

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
          // accessToken user id and email extraction from request
    const cookies = JwtUtils.extractCookiesFromRequest(req);
    const accessToken = JwtUtils.extractTokenFromCookies(cookies, 'access_token');
    const user = JwtUtils.extractUserFromAccessToken(accessToken);
    if (accessToken === null || user === null) {
      console.error("❌ [2fa.controller.ts] User not found");
      return reply.status(401).send({ message: "Unauthorized ❌" });
    }
    const userId  = user.userId;
    const email   = user.email;
    const type = TwoFactorType.EMAIL;
      const qrCodeUrl = await this.twoFactorAuthService.generateTotpSecretAndQrCode(userId);
      console.log("✅ [2fa.controller.ts] TFA setup successful for user ID:", userId);
      reply.send({ qrCodeUrl, message: 'TFA setup successful ✅' });
    } catch (error: any) {
      console.error("❌ [2fa.controller.ts] Error setting up TFA for user ID:", error);
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
      const isValid = await this.twoFactorAuthService.verifyTotpTocken(userId, token);
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
