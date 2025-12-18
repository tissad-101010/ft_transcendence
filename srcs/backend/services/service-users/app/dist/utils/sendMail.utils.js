"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = sendMail;
// srcs/utils/mailer.utils.ts
// print logs whit the file name
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
});
if (!transporter) {
    console.error("[sendMail.utils.ts] Failed to create transporter");
}
console.log("[sendMail.utils.ts] Email user:", process.env.EMAIL_USER);
console.log("[sendMail.utils.ts] Gmail app password:", process.env.GMAIL_APP_PASSWORD ? "is set" : "not set");
console.log("[sendMail.utils.ts] Transporter created");
async function sendMail(mailOptions) {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ [sendMail.utils.ts] Email sent: " + info.response);
        return true;
    }
    catch (error) {
        console.error("❌ [sendMail.utils.ts] Error sending email:", error);
        return false;
    }
}
