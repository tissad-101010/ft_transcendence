/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   mailer.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/09 14:10:25 by tissad            #+#    #+#             */
/*   Updated: 2025/10/09 14:46:08 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// src/utils/testMailer.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function testEmail(email_dest: string, otp_code: string) {
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("GMAIL_APP_PASSWORD:", process.env.GMAIL_APP_PASSWORD ? "✅ défini" : "❌ manquant");

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: '" pong game " <' + process.env.EMAIL_USER + '>', // expeiditor
      to: email_dest, // receiver
      subject: " Your code is here!", // Subject line
      text: "Hello\n\nYour code is: " + otp_code + "\n\nThis code is valid for 5 minutes.\n\nIf you did not request this, please ignore this email.", // plain text body
    });

    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
}
