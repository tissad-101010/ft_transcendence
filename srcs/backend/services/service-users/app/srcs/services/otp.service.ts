/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   otp.service.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:54:11 by tissad            #+#    #+#             */
/*   Updated: 2025/09/16 18:54:21 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";

export class OtpService {
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  // Génère un OTP à 6 chiffres et le stocke en Redis (5 min)
  async generateOtp(email: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.fastify.redis.set(`otp:${email}`, otp, "EX", 300); // expire après 300s = 5min
    return otp;
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
