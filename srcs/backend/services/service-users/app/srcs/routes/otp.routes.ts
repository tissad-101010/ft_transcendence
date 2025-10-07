/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   otp.routes.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:55:45 by tissad            #+#    #+#             */
/*   Updated: 2025/09/16 19:29:47 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { OtpService } from "../services/otp.service";
import { OtpController } from "../controllers/otp.controller";

export  async function otpRoutes(fastify: FastifyInstance) {
  const otpService = new OtpService(fastify);
  const otpController = new OtpController(otpService);

  fastify.post("/otp", otpController.generateOtp);
  fastify.post("/otp/verify", otpController.verifyOtp);
}



