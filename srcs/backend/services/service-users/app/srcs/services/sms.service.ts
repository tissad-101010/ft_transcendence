/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   sms.service.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/13 18:34:28 by tissad            #+#    #+#             */
/*   Updated: 2025/10/13 19:07:54 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

console.log("Twilio Account SID:", process.env.TWILIO_ACCOUNT_SID ? "********" : "Not Set");
console.log("Twilio Auth Token:", process.env.TWILIO_AUTH_TOKEN ? "********" : "Not Set");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(to: string, message: string) {
    console.log(`=========>Sending OTP to phone number: ${to}`);
    try {
    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to, // exemple : "+33612345678"
    });
    console.log("📨 SMS envoyé :", sms.sid);
    return true;
  } catch (error) {
    console.error("❌ Erreur d’envoi SMS :", error);
    return false;
  }
}
