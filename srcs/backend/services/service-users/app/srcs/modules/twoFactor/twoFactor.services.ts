/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   twoFactor.services.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:48:41 by tissad            #+#    #+#             */
/*   Updated: 2025/11/14 15:58:41 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


// srcs/services/2fa.service.ts
// print logs whit the file name

import { FastifyInstance } from "fastify";
import { sendUserOtpEmail } from "./mailler";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { UsersService } from "../users/users.services";
import { TwoFactorType } from "../../prisma/prisma/generated/client/enums";



export class TwoFactorAuthService {
  private fastify: FastifyInstance;
  private usersService:UsersService;
  
  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.usersService = new UsersService(fastify.prisma);
  }
  
  // Generate a 6-digit OTP
  private generateOtp(): string {
    return (Math.floor(100000 + Math.random() * 900000).toString());
  }
  // update user to enable tfa
  async enableTfaForUser(userId: number, methodstr:string ): Promise<boolean> {
    const method = methodstr as TwoFactorType;
    const methods = await this.usersService.getUserTwoFactorMethods(userId);
    if (methods.find((m) => m.type === method)) {
      console.log("⚠️ [2fa.service.ts] TFA method already enabled for user ID:", userId);
      return true; // already enabled
    }
    try {
      await this.usersService.addUserTwoFactorMethod(userId, method);      
      console.log("✅ [2fa.service.ts] TFA enabled for user ID:", userId);
      return true;
    }
    catch (error) {
      console.error("❌ [2fa.service.ts] Error enabling TFA for user ID:", userId, error);
      return false;
    }
  }

  // get user enabled tfa methods
  async getEnabledTfaMethodsForUser(userId: number): Promise<TwoFactorType[]> {
    const methods = await this.usersService.getUserTwoFactorMethods(userId);
    return methods.map((m) => m.type);
  }
  
  async sendOtpByEmail(email: string): Promise<boolean> {
    // generate otp
    const otp = this.generateOtp();
    console.log("✅ [2fa.service.ts] OTP generated:", otp);

    // send mail with otp
    const mailSent = await sendUserOtpEmail(email, otp);
    
    if (!mailSent) {
      console.error("❌ [2fa.service.ts] Failed to send OTP email to:", email);
      return (false);
    }
    else{
      console.log("✅ [2fa.service.ts] OTP email sent to:", email);
      // store otp in redis with expiration time of 5 minutes
      try
      {
        this.fastify.redis.set(`otp:${email}`, otp, "EX", 300); // expire in 300 seconds (5 minutes)
        console.log("✅ [2fa.service.ts] OTP stored in Redis for email:", email);
        return (true);
      } catch (error)
      {
        console.error("❌ [2fa.service.ts] Error storing OTP in Redis:", error);
        return (false);
      }
    }
  }

  // Verify OTP for email  
  async verifyOtpEmail(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.fastify.redis.get(`otp:${email}`);
    console.log(`[2fa.service.ts] Verifying OTP for email: ${email}`);
    console.log("[2fa.service.ts] Retrieved OTP from Redis:", storedOtp);
    
    // No OTP found or expired
    if (!storedOtp) {
      console.log("❌ [2fa.service.ts] No OTP found or OTP expired for email:", email);
      return (false); 
    }
    // OTP does not match
    if (storedOtp.trim() !== String(otp).trim()) {
      console.log("❌ [2fa.service.ts] OTP mismatch for email:", email);
      return (false);
    }
    
    // OTP matches, delete it from Redis
    await this.fastify.redis.del(`otp:${email}`);
    console.log("✅ [2fa.service.ts] OTP verified and deleted from Redis for email:", email);
    return true;
  }

  // gerate TFA secret and QR code and store  in db
  async generateTotpSecretAndQrCode(userId: number): Promise<{qrCodeUrl: string }> {
    const secret = speakeasy.generateSecret({ length: 20, name: `ft_transcendence_user_${userId}` });
    console.log("✅ [2fa.service.ts] TFA secret generated for user ID:", userId);
    // store tfa secret in redis with expiration time of 10 minutes
    await this.fastify.redis.set(`tfa_secret:${userId}`, secret.base32, "EX", 100 * 60); // expire in 10 minutes
    
    // warnning:
    // In production, you should never store the TFA secret in plain text in your database.
    // store the secret in hashicorp vault
    // you should configure vault and implement the logic to store and retrieve secrets securely.
    // generate QR code from secret 
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `ft_transcendence_user_${userId}`, 
      issuer: "ft_transcendence",
      encoding: "base32",
    });
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);
    console.log("✅ [2fa.service.ts] QR code generated for user ID:", userId);
    
    // store qr code data url in redis
    await this.fastify.redis.set(`tfa_qr_code:${userId}`, qrCodeUrl, "EX", 600); // expire in 10 minutes
    
    return { qrCodeUrl };
  }

  // Verify TFA token
  async verifyTotpTocken(userId: number, token: string): Promise<boolean> {
    // retrieve tfa secret from vault
    // for demo purpose, we will retrieve the secret from redis
    const client = await this.fastify.redis;
    try {
      const tfaSecret = await client.get(`tfa_secret:${userId}`);
      if (!tfaSecret) {
        console.log("❌ [2fa.service.ts] No TFA secret found for user ID:", userId);
        return false;
      }
      const verified = speakeasy.totp.verify({
        secret: tfaSecret,
        encoding: 'base32',
        token,
        window: 1, // allow 30 seconds before or after
      });
      if (verified) {
        console.log("✅ [2fa.service.ts] TFA token verified for user ID:", userId);
      } else {
        console.log("❌ [2fa.service.ts] TFA token verification failed for user ID:", userId);
      }
      return verified;
  
    } catch (error) {
      console.error("❌ [2fa.service.ts] Error verifying TFA token for user ID:", userId, error);
      return false;
    }
  }
}


