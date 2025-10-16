/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   phone.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/13 18:34:28 by tissad            #+#    #+#             */
/*   Updated: 2025/10/16 21:18:19 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// srcs/services/phone/phone.service.ts 
import { FastifyInstance } from "fastify";
import axios from "axios";

import {    firebaseAdmin, 
            verifyFirebaseToken,
            createUser, 
            deleteUserByUid,
            verifyRecaptcha
          } from "./firebase.service";


export class PhoneService {
  /**
   * Envoie un OTP par SMS via Firebase Authentication
   * @param phone - Numéro de téléphone au format E.164 (+33..., +1..., etc.)
   * @param firebaseRecaptchaToken - Jeton reCAPTCHA généré côté client
   * @returns true si l’envoi a réussi, sinon false
   */
  public async SendOtpBySms(phone: string, firebaseRecaptchaToken: string): Promise<boolean> {
    if (!process.env.REKAPTCHA_API_KEY) {
      console.error("❌ REKAPTCHA_API_KEY manquant dans les variables d'environnement");
      return false;
    }



    if (!phone || !firebaseRecaptchaToken) {
      console.error("❌ Paramètres manquants : phone ou recaptchaToken");
      return false;
    }
    // Vérifier le token reCAPTCHA
    // const recaptchaValid = await verifyRecaptcha(firebaseRecaptchaToken);
    // if (!recaptchaValid) {
    //   console.error("❌ Échec de la vérification reCAPTCHA");
    //   return false;
    // }
    try {
      console.log("📤 Envoi OTP via Firebase pour :", phone);

      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${process.env.REKAPTCHA_API_KEY}`,
        {
          phoneNumber: phone,
          recaptchaToken: firebaseRecaptchaToken,
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000, // 10s de sécurité
        }
      );

      console.log("✅ OTP envoyé avec succès :", response.data);
      return true;
    } catch (error: any) {
      console.error("❌ Erreur envoi OTP Firebase :", error.response?.data || error.message);
      console.error("Phone:", phone);
      console.error("Token reCAPTCHA:", firebaseRecaptchaToken);
      return false;
    }
  }
}


