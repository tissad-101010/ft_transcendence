/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   otp.controller.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 19:00:31 by tissad            #+#    #+#             */
/*   Updated: 2025/09/16 19:06:35 by tissad           ###   ########.fr       */
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

  // Génération OTP
  generateOtp = async (
    req: FastifyRequest<{ Body: OtpRequest }>,
    reply: FastifyReply
  ) => {
    const { email } = req.body;
    const otp = await this.otpService.generateOtp(email);

    // ⚠️ Pour l’instant, retour OTP dans la réponse (à remplacer par un envoi email)
    return reply.send({ message: "OTP generated", otp });
  };

  // Vérification OTP
  verifyOtp = async (
    req: FastifyRequest<{ Body: VerifyOtpRequest }>,
    reply: FastifyReply
  ) => {
    const { email, otp } = req.body;
    const isValid = await this.otpService.verifyOtp(email, otp);

    if (!isValid) {
      return reply.status(400).send({ message: "Invalid or expired OTP" });
    }

    return reply.send({ message: "OTP verified successfully ✅" });
  };
}
