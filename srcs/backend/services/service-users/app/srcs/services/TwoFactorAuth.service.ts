/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TwoFactorAuth.service.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:54:11 by tissad            #+#    #+#             */
/*   Updated: 2025/10/21 17:03:03 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


// srcs/services/2fa.service.ts
// print logs whit the file name

import { FastifyInstance } from "fastify";
import { sendUserOtpEmail } from "./Mailer.service";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

export class TwoFactorAuthService {
  private fastify: FastifyInstance;
  private db: Pool;
  
  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.db = fastify.db;
  }
  
  // Generate a 6-digit OTP
  private generateOtp(): string {
    return (Math.floor(100000 + Math.random() * 900000).toString());
  }
  
  // Send OTP by email
  async SendOtpByEmail(email: string): Promise<boolean> {
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
  async verifyOtp(email: string, otp: string): Promise<boolean> {
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
  async generateTfaSecretAndQrCode(userId: number): Promise<{qrCodeDataUrl: string }> {
    const secret = speakeasy.generateSecret({ length: 20, name: `ft_transcendence_user_${userId}` });
    // warnning:
    // In production, you should never store the TFA secret in plain text in your database.
    // store the secret in hashicorp vault
    // you should configure vault and implement the logic to store and retrieve secrets securely.
    const client = await this.db.connect(); 
    try {
      await client.query(
        "UPDATE users SET tfa_secret = $1, tfa_enabled = $2 WHERE id = $3",
        [secret, true, userId]
      );
      console.log("✅ [2fa.service.ts] TFA secret stored in DB for user ID:", userId);
    } finally {
      client.release();
    }
    // generate QR code from secret 
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `ft_transcendence_user_${userId}`, 
      issuer: "ft_transcendence",
      encoding: "base32",
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    console.log("✅ [2fa.service.ts] QR code generated for user ID:", userId);
    
    // store qr code data url in redis
    await this.fastify.redis.set(`tfa_qr_code:${userId}`, qrCodeDataUrl, "EX", 600); // expire in 10 minutes
    
    return { qrCodeDataUrl };
  }

  // Verify TFA token
  async verifyTfaToken(userId: number, token: string): Promise<boolean> {
    const client = await this.db.connect();
    try {
      const res = await client.query(
        "SELECT tfa_secret FROM users WHERE id = $1",
        [userId]
      );
      if (res.rows.length === 0) {
        console.log("❌ [2fa.service.ts] User not found for ID:", userId);
        return false;
      }
      const tfaSecret = res.rows[0].tfa_secret;
      if (!tfaSecret) {
        console.log("❌ [2fa.service.ts] TFA not enabled for user ID:", userId);
        return false;
      }
      const verified = speakeasy.totp.verify({
        secret: tfaSecret.base32,
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
    } finally {
      client.release();
    }
  }

}


