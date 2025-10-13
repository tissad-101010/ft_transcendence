/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   otp.service.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:54:11 by tissad            #+#    #+#             */
/*   Updated: 2025/10/10 16:27:28 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { sendUserOtpEmail } from "./mailer.service";


export class OtpService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  // generate otp 
  async generateAndSendOtp(email: string): Promise<boolean> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    
    // send mail with otp
    const mailSent = await sendUserOtpEmail(email, otp);
    if (!mailSent) return mailSent;
    // store otp in redis with expiration time of 5 minutes
    await this.fastify.redis.set(`otp:${email}`, otp, "EX", 300); // expire in 300 seconds (5 minutes)
    return mailSent;
  }

  // Vérifie si l’OTP est correct
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const storedOtp = await this.fastify.redis.get(`otp:${email}`);

    if (!storedOtp) return false;
    if (storedOtp !== otp) return false;

    // OTP valide → on le supprime pour empêcher la réutilisation
    await this.fastify.redis.del(`otp:${email}`);
    return true;
  }
}
