/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   otp.controller.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 19:00:31 by tissad            #+#    #+#             */
/*   Updated: 2025/10/13 19:00:03 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Contrôleur pour la gestion des OTP (One-Time Password)
// le controleur est responsable de la logique métier et de la gestion des requêtes/réponses
// il utilise le service OTP pour la génération et la vérification des OTP
// tandis que le service son role est de gérer la logique spécifique liée aux OTP


import { FastifyReply, FastifyRequest } from "fastify";
import { OtpService } from "../services/otp.service";
import { OtpRequest, VerifyOtpRequest } from "../types/otp.type";

export class OtpController {
  private otpService: OtpService;

  constructor(otpService: OtpService) {
    this.otpService = otpService;
  }

  // Generate OTP
  SendOtpByEmail = async (
    req: FastifyRequest<{ Body: OtpRequest }>,
    reply: FastifyReply
  ) => {
    const { email } = req.body;
    const mailSent = await this.otpService.SendOtpByEmail(email);
    console.log("Mail sent status:", mailSent);
    console.log("Email:", email);
    // If mail sending failed, return error response
    if (!mailSent) {
      return reply.status(500).send({ message: "Failed to send OTP email", mailSent });
    }
    // Return success response
    return reply.send({ message: "OTP generated", mailSent });
  };

  // send otp by sms
  SendOtpBySms = async (
    req: FastifyRequest<{ Body: OtpRequest }>,
    reply: FastifyReply
  ) => {
    const { phone } = req.body;
    const smsSent = await this.otpService.SendOtpBySms(phone);
    console.log("SMS sent status:", smsSent);
    console.log("Phone:", phone);
    // If SMS sending failed, return error response
    if (!smsSent) {
      return reply.status(500).send({ message: "Failed to send OTP SMS", smsSent });
    }
    // Return success response
    return reply.send({ message: "OTP sent via SMS", smsSent });
  };

  
  // Verify OTP
  verifyOtp = async (
    req: FastifyRequest<{ Body: VerifyOtpRequest }>,
    reply: FastifyReply
  ) => {
    const { email, otp } = req.body;
    console.log("Verifying OTP for email:", email);
    console.log("OTP to verify:", otp);
    const isValid = await this.otpService.verifyOtp(email, otp);

    if (!isValid) {
      return reply.status(400).send({ message: "Invalid or expired OTP" });
    }

    return reply.send({ message: "OTP verified successfully ✅" });
  };
}
