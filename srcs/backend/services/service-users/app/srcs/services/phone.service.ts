/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   phone.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/13 18:34:28 by tissad            #+#    #+#             */
/*   Updated: 2025/10/14 17:12:41 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// srcs/services/phone/phone.service.ts 
import { FastifyInstance } from "fastify";
import axios from "axios";

import {    firebaseAdmin, 
            verifyFirebaseToken,
            createUserWithPhone, 
            deleteUserByUid } from "./firebase.service";

export class PhoneService {
  private fastify: FastifyInstance; 
    constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
  }
  // send otp by sms (placeholder)
    async SendOtpBySms(phone: string): Promise<boolean> {
        const userRecord = await createUserWithPhone(phone);
        console.log("User created with phone:", userRecord.uid);
        // envoyer l'otp via firebase
        try {
        // Appel REST Firebase Identity Toolkit
        const response = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${process.env.FIREBASE_API_KEY}`,
            { phoneNumber: phone, recaptchaToken: "RECAPTCHA_BYPASS" } // en dev, tu peux bypass
        );
        } catch (error: any) {
            console.error("❌ Erreur envoi OTP :", error.response?.data || error);
            //await deleteUserByUid(userRecord.uid);
            return false;
        }
        return true;
    }
    // verify otp by sms (placeholder)
    async VerifyOtpBySms(phone: string, otp: string): Promise<boolean> {
    
    // Ici, vous implémenteriez la logique pour vérifier l’OTP par SMS
    // Cela pourrait impliquer l’utilisation d’un service tiers comme Twilio
    // Pour cet exemple, nous allons simplement simuler la vérification 
    return true;
    }
}