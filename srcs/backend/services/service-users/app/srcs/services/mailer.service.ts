/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   mailer.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/09 14:10:25 by tissad            #+#    #+#             */
/*   Updated: 2025/10/10 16:24:20 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// srcs/services/mailer/mailer.service.ts

import { MailArgs } from "../types/mail.type";
import { sendMail } from "../utils/sendMail.utils";

export async function sendUserRegistrationEmail(userEmail: string) {
  const mailOptions: MailArgs = {
    from: `"Pong Game" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Welcome to Our Pong Game!",
    text: "Thank you for registering!",
  };

  await sendMail(mailOptions);
}

// Send OTP email
export async function sendUserOtpEmail(userEmail: string, otp: string): Promise<boolean> {
  const mailOptions: MailArgs = {
    from: `"Pong Game" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  return await sendMail(mailOptions);
}