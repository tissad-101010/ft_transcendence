"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   mailler.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/09 14:10:25 by tissad            #+#    #+#             */
/*   Updated: 2025/10/30 17:48:28 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendUserRegistrationEmail = sendUserRegistrationEmail;
exports.sendUserOtpEmail = sendUserOtpEmail;
const sendMail_utils_1 = require("../../utils/sendMail.utils");
async function sendUserRegistrationEmail(userEmail) {
    const mailOptions = {
        from: `"Pong Game" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Welcome to Our Pong Game!",
        text: "Thank you for registering!",
    };
    return await (0, sendMail_utils_1.sendMail)(mailOptions);
}
// Send OTP email
async function sendUserOtpEmail(userEmail, otp) {
    const mailOptions = {
        from: `"Pong Game" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}`,
    };
    return await (0, sendMail_utils_1.sendMail)(mailOptions);
}
