/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   2fa.service.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:54:11 by tissad            #+#    #+#             */
/*   Updated: 2025/10/17 11:54:02 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


// srcs/services/2fa.service.ts
// print logs whit the file name

import { FastifyInstance } from "fastify";
import { sendUserOtpEmail } from "./mailer.service";

export class TwoFactorAuthService {
  private fastify: FastifyInstance;
  
  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
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
}
