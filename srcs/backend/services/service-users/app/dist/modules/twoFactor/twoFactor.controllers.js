"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   twoFactor.controllers.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:48:33 by tissad            #+#    #+#             */
/*   Updated: 2025/12/11 12:26:23 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorAuthController = void 0;
const enums_1 = require("../../prisma/prisma/generated/client/enums");
const jwt_utils_1 = require("../../utils/jwt.utils");
const twoFactor_services_1 = require("./twoFactor.services");
class TwoFactorAuthController {
    constructor(server) {
        this.sendOtpByEmailForEnableTfaController = async (req, reply) => {
            const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(req);
            const accessToken = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'access_token');
            const user = jwt_utils_1.JwtUtils.extractUserFromAccessToken(accessToken);
            if (accessToken === null || user === null) {
                console.error("❌ [2fa.controller.ts] User not found");
                return reply.status(401).send({ message: "Unauthorized ❌" });
            }
            const userId = user.userId;
            const email = user.email;
            console.log("[2fa.controller.ts] Enabling TFA for user ID:", userId, "email:", email);
            // Tmp Token user id and email extraction from request
            const mailSent = await this.twoFactorAuthService.sendOtpByEmail(email);
            // If mail sending failed, return error response
            if (!mailSent) {
                console.error("❌ [otp.controller.ts] Failed to send OTP email to:", email);
                return reply.status(500).send({ message: "Failed to send OTP email", mailSent });
            }
            else {
                console.log("✅ [otp.controller.ts] OTP email sent to:", email);
                return reply.send({ message: "OTP email sent successfully ✅", mailSent });
            }
        };
        // verify otp and enable email otp for tfa
        this.enableEmailOtpForTfaController = async (req, reply) => {
            // accessToken user id and email extraction from request
            const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(req);
            const accessToken = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'access_token');
            const user = jwt_utils_1.JwtUtils.extractUserFromAccessToken(accessToken);
            if (accessToken === null) {
                console.error("❌ [2fa.controller.ts] User not found");
                return reply.status(401).send({ message: "Unauthorized ❌" });
            }
            if (user === null) {
                console.error("❌ [2fa.controller.ts] User not found");
                return reply.status(401).send({ message: "Unauthorized ❌" });
            }
            const userId = user.userId;
            const email = user.email;
            const type = enums_1.TwoFactorType.EMAIL;
            console.log("[2fa.controller.ts] Verifying OTP and enabling TFA for user ID:", userId, "email:", email);
            // verify otp
            const { code } = req.body;
            console.log("[2fa.controller.ts] Verifying OTP for email:", email);
            console.log("[2fa.controller.ts] Provided OTP:", code);
            console.log("[2fa.controller.ts] request body:", req.body);
            const isValid = await this.twoFactorAuthService.verifyOtpEmail(email, code);
            if (!isValid) {
                console.error("❌ [2fa.controller.ts] OTP verification failed for email:", email);
                return reply.status(400).send({ message: "Invalid or expired OTP ❌" });
            }
            else {
                // enable email otp for tfa
                await this.twoFactorAuthService.enableTwoFactorAuth(userId, type);
                console.log("✅ [2fa.controller.ts] TFA enabled successfully for user ID:", userId);
                return reply.send({ message: "Two-factor authentication enabled successfully ✅" });
            }
        };
        this.sendOtpByEmailForTfaController = async (req, reply) => {
            // Tmp Token user id and email extraction from request
            const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(req);
            console.log("[2fa.controller.ts] Cookies extracted from request:", cookies);
            const tempToken = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'temp_token');
            console.log("[2fa.controller.ts] Temp token extracted from cookies:", tempToken);
            const user = jwt_utils_1.JwtUtils.extractUserFromTempToken(tempToken);
            if (tempToken === null || user === null) {
                console.error("❌ [2fa.controller.ts] User not found");
                return reply.status(401).send({ message: "Unauthorized ❌" });
            }
            const userId = user.userId;
            const email = user.email;
            console.log("[2fa.controller.ts] Sending OTP email for sign-in TFA for user ID:", userId, "email:", email);
            const mailSent = await this.twoFactorAuthService.sendOtpByEmail(email);
            if (!mailSent) {
                console.error("❌ [otp.controller.ts] Failed to send OTP email to:", email);
                return reply.status(500).send({ message: "Failed to send OTP email", mailSent });
            }
            else {
                console.log("✅ [otp.controller.ts] OTP email sent to:", email);
                return reply.send({ message: "OTP email sent successfully ✅", mailSent });
            }
        };
        this.verifyEmailOtpForTfaController = async (req, reply) => {
            // Tmp Token user id and email extraction from request
            const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(req);
            console.log("[2fa.controller.ts] Cookies extracted from request:", cookies);
            const tempToken = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'temp_token');
            console.log("[2fa.controller.ts] Temp token extracted from cookies:", tempToken);
            const user = jwt_utils_1.JwtUtils.extractUserFromTempToken(tempToken);
            if (tempToken === null) {
                console.error("❌ [2fa.controller.ts] Temp token not found");
                return reply.status(401).send({ message: "Unauthorized ❌" });
            }
            if (user === null) {
                console.error("❌ [2fa.controller.ts] User not found");
                return reply.status(401).send({ message: "Unauthorized ❌" });
            }
            const userId = user.userId;
            console.log("================================================================================[2fa.controller.ts] User ID from temp token:", userId);
            const email = user.email;
            console.log("[2fa.controller.ts] Verifying OTP for sign-in TFA for user ID:", userId, "email:", email);
            const { code } = req.body;
            console.log("[2fa.controller.ts] Verifying OTP for email:", email);
            console.log("[2fa.controller.ts] Provided OTP:", code);
            console.log("[2fa.controller.ts] request body:", req.body);
            const isValid = await this.twoFactorAuthService.verifyOtpEmail(email, code);
            if (!isValid) {
                console.error("❌ [2fa.controller.ts] OTP verification failed for email:", email);
                return reply.status(400).send({ message: "Invalid or expired OTP ❌" });
            }
            else {
                console.log("✅ [2fa.controller.ts] OTP verified successfully for email:", email);
                const loginResponse = {
                    id: userId,
                    email: email,
                };
                // generate access and refresh tokens
                const accessToken = jwt_utils_1.JwtUtils.generateAccessToken(loginResponse);
                const refreshToken = jwt_utils_1.JwtUtils.generateRefreshToken(loginResponse);
                // store refresh token in redis cache
                // store refresh token in redis cache
                await this.redisClient.set(`refresh_token:${refreshToken}`, userId, 'EX', 60 * 60 * 24 * 7);
                // store access token in redis cache (optional)
                await this.redisClient.set(`access_token:${userId}`, accessToken, 'EX', 60 * 15 // 15 minutes
                );
                jwt_utils_1.JwtUtils.setTempTokenCookie(reply, ''); // clear temp token cookie
                jwt_utils_1.JwtUtils.setAccessTokenCookie(reply, accessToken);
                jwt_utils_1.JwtUtils.setRefreshTokenCookie(reply, refreshToken);
                return reply.code(200).send({
                    success: true,
                    message: "OTP verified successfully ✅"
                });
            }
        };
        // disable email otp for tfa
        this.disableEmailOtpForTfaController = async (req, reply) => {
            // accessToken user id and email extraction from request
            const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(req);
            const accessToken = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'access_token');
            const user = jwt_utils_1.JwtUtils.extractUserFromAccessToken(accessToken);
            if (accessToken === null || user === null) {
                console.error("❌ [2fa.controller.ts] User not found");
                return reply.status(401).send({ message: "Unauthorized ❌" });
            }
            const userId = user.userId;
            const email = user.email;
            const type = enums_1.TwoFactorType.EMAIL;
            console.log("[2fa.controller.ts] Disabling TFA for user ID:", userId, "email:", email);
            await this.twoFactorAuthService.disableTwoFactorAuth(userId, type);
            console.log("✅ [2fa.controller.ts] TFA disabled successfully for user ID:", userId);
            return reply.send({ message: "Two-factor authentication disabled successfully ✅" });
        };
        // Verify OTP
        this.verifyOtpEmailController = async (req, reply) => {
            const { email, code } = req.body;
            console.log("[otp.controller.ts] Verifying OTP for email:", email);
            const isValid = await this.twoFactorAuthService.verifyOtpEmail(email, code);
            if (!isValid) {
                console.error("❌ [otp.controller.ts] OTP verification failed for email:", email);
                return reply.status(400).send({ message: "Invalid or expired OTP ❌" });
            }
            else {
                console.log("✅ [otp.controller.ts] OTP verified successfully for email:", email);
                return reply.send({ message: "OTP verified successfully ✅" });
            }
        };
        // setup TFA for user with google authenticator app
        this.sendQrCodeController = async (req, reply) => {
            // const userId = (req.params as any).userId;
            try {
                // accessToken user id and email extraction from request
                const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(req);
                const accessToken = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'access_token');
                const user = jwt_utils_1.JwtUtils.extractUserFromAccessToken(accessToken);
                if (accessToken === null || user === null) {
                    console.error("❌ [2fa.controller.ts] User not found");
                    return reply.status(401).send({ message: "Unauthorized ❌" });
                }
                const userId = user.userId;
                const qrCodeUrl = await this.twoFactorAuthService.generateTotpSecretAndQrCode(userId);
                console.log("✅ [2fa.controller.ts] TFA setup successful for user ID:", userId);
                reply.send({ qrCodeUrl: qrCodeUrl, message: 'TFA setup successful ✅' });
            }
            catch (error) {
                console.error("❌ [2fa.controller.ts] Error setting up TFA for user ID:", error);
                return reply.status(500).send({ message: "Error setting up two-factor authentication ❌" });
            }
        };
        // enable TFA with TOTP
        this.enableTwoFactorTotpController = async (req, reply) => {
            // accessToken user id and email extraction from request
            const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(req);
            const accessToken = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'access_token');
            const user = jwt_utils_1.JwtUtils.extractUserFromAccessToken(accessToken);
            if (accessToken === null || user === null) {
                console.error("❌ [2fa.controller.ts] User not found");
                return reply.status(401).send({ message: "Unauthorized ❌" });
            }
            const code = req.body.code;
            console.log("[2fa.controller.ts] TOTP code received for enabling TFA:", code);
            // verify TOTP code before enabling TFA
            const userId = user.userId;
            const isValid = await this.twoFactorAuthService.verifyTotpToken(userId, code);
            if (!isValid) {
                console.error("❌ [2fa.controller.ts] TOTP verification failed for user ID:", userId);
                return reply.status(400).send({ message: "Invalid TOTP code ❌" });
            }
            const type = enums_1.TwoFactorType.TOTP;
            console.log("[2fa.controller.ts] Enabling TFA TOTP for user ID:", userId);
            try {
                await this.twoFactorAuthService.enableTwoFactorAuth(userId, type);
                console.log("✅ [2fa.controller.ts] TFA TOTP enabled successfully for user ID:", userId);
                return reply.send({ message: "Two-factor authentication TOTP enabled successfully ✅" });
            }
            catch (error) {
                console.error("❌ [2fa.controller.ts] Error enabling TFA TOTP for user ID:", userId, error);
                return reply.status(500).send({ message: "Error enabling two-factor authentication TOTP ❌" });
            }
        };
        // disable TFA with TOTP
        this.disableTwoFactorTotpController = async (req, reply) => {
            // accessToken user id and email extraction from request
            const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(req);
            const accessToken = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'access_token');
            const user = jwt_utils_1.JwtUtils.extractUserFromAccessToken(accessToken);
            if (accessToken === null || user === null) {
                console.error("❌ [2fa.controller.ts] User not found");
                return reply.status(401).send({ message: "Unauthorized ❌" });
            }
            const userId = user.userId;
            const type = enums_1.TwoFactorType.TOTP;
            console.log("[2fa.controller.ts] Disabling TFA TOTP for user ID:", userId);
            try {
                await this.twoFactorAuthService.disableTwoFactorAuth(userId, type);
                console.log("✅ [2fa.controller.ts] TFA TOTP disabled successfully for user ID:", userId);
                return reply.send({ message: "Two-factor authentication TOTP disabled successfully ✅" });
            }
            catch (error) {
                console.error("❌ [2fa.controller.ts] Error disabling TFA TOTP for user ID:", userId, error);
                return reply.status(500).send({ message: "Error disabling two-factor authentication TOTP ❌" });
            }
        };
        // verify TFA token for user
        this.verifyTwoFactorTotpController = async (req, reply) => {
            const redisClient = req.server.redis;
            const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(req);
            const tempToken = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'temp_token');
            const user = jwt_utils_1.JwtUtils.extractUserFromTempToken(tempToken);
            if (tempToken === null) {
                console.error("❌ [2fa.controller.ts] Temp token not found");
                return reply.status(401).send({ message: "Unauthorized ❌" });
            }
            if (user === null) {
                console.error("❌ [2fa.controller.ts] User not found");
                return reply.status(401).send({ message: "Unauthorized ❌" });
            }
            const userId = user.userId;
            const email = user.email;
            console.log("[2fa.controller.ts] Verifying TFA TOTP for user ID:", userId, "email:", email);
            const { code } = req.body;
            try {
                const isValid = await this.twoFactorAuthService.verifyTotpToken(userId, code);
                if (!isValid) {
                    return reply.status(400).send({ message: "Invalid TFA token ❌" });
                }
                else {
                    const loginResponse = {
                        id: userId,
                        email: email,
                    };
                    // generate access and refresh tokens
                    const accessToken = jwt_utils_1.JwtUtils.generateAccessToken(loginResponse);
                    const refreshToken = jwt_utils_1.JwtUtils.generateRefreshToken(loginResponse);
                    // store refresh token in redis cache
                    // store refresh token in redis cache
                    await this.redisClient.set(`refresh_token:${refreshToken}`, userId, 'EX', 60 * 60 * 24 * 7);
                    // store access token in redis cache (optional)
                    await this.redisClient.set(`access_token:${userId}`, accessToken, 'EX', 60 * 15 // 15 minutes
                    );
                    jwt_utils_1.JwtUtils.setTempTokenCookie(reply, ''); // clear temp token cookie
                    jwt_utils_1.JwtUtils.setAccessTokenCookie(reply, accessToken);
                    jwt_utils_1.JwtUtils.setRefreshTokenCookie(reply, refreshToken);
                    return reply.code(200).send({
                        success: true,
                        message: "OTP verified successfully ✅"
                    });
                }
            }
            catch (error) {
                console.error("❌ [2fa.controller.ts] Error verifying TFA token for user ID:", userId, error);
                return reply.status(500).send({ message: "Error verifying two-factor authentication token ❌" });
            }
        };
        this.getTwoFactorAuthMethodsController = async (req, reply) => {
            // accessToken user id and email extraction from request
            const cookies = jwt_utils_1.JwtUtils.extractCookiesFromRequest(req);
            const accessToken = jwt_utils_1.JwtUtils.extractTokenFromCookies(cookies, 'access_token');
            const user = jwt_utils_1.JwtUtils.extractUserFromAccessToken(accessToken);
            if (accessToken === null || user === null) {
                console.error("❌ [2fa.controller.ts] User not found");
                return reply.status(401).send({ message: "Unauthorized ❌" });
            }
            const userId = user.userId;
            console.log("[2fa.controller.ts] Getting TFA methods for user ID:", userId);
            try {
                const methods = await this.twoFactorAuthService.getTwoFactorAuthMethods(userId);
                console.log("✅ [2fa.controller.ts] TFA methods retrieved successfully for user ID:", userId);
                return reply.send({ methods });
            }
            catch (error) {
                console.error("❌ [2fa.controller.ts] Error getting TFA methods for user ID:", userId, error);
                return reply.status(500).send({ message: "Error getting two-factor authentication methods ❌" });
            }
        };
        this.twoFactorAuthService = new twoFactor_services_1.TwoFactorAuthService(server);
        this.redisClient = server.redis;
    }
}
exports.TwoFactorAuthController = TwoFactorAuthController;
