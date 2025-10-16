/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   sendMail.utils.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/10 15:30:33 by tissad            #+#    #+#             */
/*   Updated: 2025/10/16 15:58:33 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// srcs/utils/mailer.utils.ts
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
console.log("======>>HHHHHOST",process.env.EMAIL_HOST);

console.log("===========================>Email user:", process.env.EMAIL_USER);
console.log("Email pass:", process.env.GMAIL_APP_PASSWORD? "********" : "Not Set");
console.log(" REKAPTCHA_API_KEY host:", process.env.REKAPTCHA_API_KEY);
export async function sendMail(mailOptions: MailArgs): Promise<boolean> {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email: " + error);
    return false;
  }
}
