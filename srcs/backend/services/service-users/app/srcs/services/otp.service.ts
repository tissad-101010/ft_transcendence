/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   otp.service.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:54:11 by tissad            #+#    #+#             */
/*   Updated: 2025/10/13 18:37:20 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { sendUserOtpEmail } from "./mailer.service";
import { sendSMS } from "./sms.service";

export class OtpService {
  private fastify: FastifyInstance;
  // Génère un OTP à 6 chiffres
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  // generate otp 
  async SendOtpByEmail(email: string): Promise<boolean> {
    // generate otp
    const otp = this.generateOtp();

    // send mail with otp
    const mailSent = await sendUserOtpEmail(email, otp);
    console.log("Mail sent status (service):", mailSent);
    console.log("Email (service):", email);
    if (!mailSent) return mailSent;
    // store otp in redis with expiration time of 5 minutes
    try
    {
     this.fastify.redis.set(`otp:${email}`, otp, "EX", 300); // expire in 300 seconds (5 minutes)
    } catch (error)
    {
      console.error("Error storing OTP in Redis:", error);
      return false;
    }
    console.log(`Stored OTP for ${email}: ${otp}`);
    return mailSent;
  }

  // send otp by sms
  async SendOtpBySms(phone: string): Promise<boolean> {
    // Ici, vous implémenteriez la logique pour envoyer l’OTP par SMS
    // Cela pourrait impliquer l’utilisation d’un service tiers comme Twilio
    // Pour cet exemple, nous allons simplement simuler l’envoi
    const otp = this.generateOtp();
    
    await sendSMS(phone, `Your OTP code is: ${otp}`);
    console.log(`Sending OTP to phone number: ${phone}`);
    return true;
  }
  
  // Vérifie si l’OTP est correct
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.fastify.redis.get(`otp:${email}`);
      console.log(`Retrieved OTP for ${email}: ${storedOtp}`);
      console.log(`OTP provided for verification: ${otp}`);
    if (!storedOtp) return false;
    console.log("======================>Stored OTP:", storedOtp);    
    if (storedOtp.trim() !== String(otp).trim()) return false;

    console.log(`======================>OTP for ${email} is valid.`);
    // OTP valide → on le supprime pour empêcher la réutilisation
    await this.fastify.redis.del(`otp:${email}`);
    console.log(`OTP for ${email} verified and deleted.`);
    return true;
  }
}
