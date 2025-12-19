/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   sendMail.utils.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/10 15:30:33 by tissad            #+#    #+#             */
/*   Updated: 2025/10/17 11:54:53 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// srcs/utils/mailer.utils.ts

// print logs whit the file name

import nodemailer from "nodemailer";
import dotenv from "dotenv";


import { MailArgs } from "../types/mail.type";


dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
});


if (!transporter) {
  console.error("[sendMail.utils.ts] Failed to create transporter");
}



// console.log("[sendMail.utils.ts] Email user:", process.env.EMAIL_USER);
// console.log("[sendMail.utils.ts] Gmail app password:", process.env.GMAIL_APP_PASSWORD ? "is set" : "not set");
// console.log("[sendMail.utils.ts] Transporter created");


export async function sendMail(mailOptions: MailArgs): Promise<boolean> {
  try {
    const info = await transporter.sendMail(mailOptions);
    // console.log("✅ [sendMail.utils.ts] Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("❌ [sendMail.utils.ts] Error sending email:", error);
    return false;
  }
}
