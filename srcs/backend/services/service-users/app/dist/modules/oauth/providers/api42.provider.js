"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api42.provider.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:18 by tissad            #+#    #+#             */
/*   Updated: 2025/12/10 15:13:05 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api42OAuthProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const users_services_1 = require("../../users/users.services");
const enums_1 = require("../../../prisma/prisma/generated/client/enums");
/********************************
 *   42 OAuth Provider          *
 * ******************************/
class Api42OAuthProvider {
    constructor(prismaClient) {
        this.clientId = process.env.FORTYTWO_CLIENT_ID;
        this.clientSecret = process.env.FORTYTWO_CLIENT_SECRET;
        this.redirectUri = process.env.FORTYTWO_REDIRECT_URI;
        this.userService = new users_services_1.UsersService(prismaClient);
        this.prismaClient = prismaClient;
    }
    /**
 * step 1 — get access token from GitHub
 */
    async getAccessToken(code) {
        const url = "https://api.intra.42.fr/oauth/token";
        const params = {
            grant_type: "authorization_code",
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
            redirect_uri: this.redirectUri,
        };
        const response = await axios_1.default.post(url, params, {
            headers: { "Content-Type": "application/json" },
        });
        if (response.data.error) {
            console.log("[42.service] OAuth error:", response.data);
            throw new Error(response.data.error_description || "42 OAuth error");
        }
        return response.data.access_token;
    }
    /**
   * step 2 — get user profile from GitHub
   */
    async get42Profile(token) {
        const response = await axios_1.default.get("https://api.intra.42.fr/v2/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status !== 200) {
            console.log("[42.service] Failed to fetch 42 profile:", response.data);
            throw new Error("Failed to fetch 42 profile");
        }
        return response.data;
    }
    // step 3 — find or create user in our database
    async findOrCreateUser(fortytwo_profile) {
        console.log("[42.service]================> 42 profile data:", fortytwo_profile.image.link);
        // Placeholder logic to find or create user in your database
        let user = await this.userService.getUserByEmail(fortytwo_profile.email);
        if (!user) {
            console.log("[google.service] No existing user found, creating new user");
            const DB_profile = {
                email: fortytwo_profile.email,
                username: fortytwo_profile.login,
                // twoFactorEnabled: false,
                // firstName: google_profile.given_name,
                // lastName: google_profile.family_name,
                passwordHash: undefined,
                isVerified: true,
                emailVerified: false,
                phoneVerified: false,
                phoneNumber: undefined,
                displayName: fortytwo_profile.login,
                avatarUrl: fortytwo_profile.image.link,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            try {
                console.log("[google.service] Creating user with profile:", DB_profile);
                user = await this.userService.createUser(DB_profile);
            }
            catch (error) {
                console.log("[google.service] Error preparing user creation:", error);
                return null;
            }
        }
        // link OAuth provider to user account
        if (user) {
            console.log("[google.service] Linking Google OAuth provider to user:", user.id);
            const DB_provider = {
                provider: enums_1.OAuthProviderType.FORTYTWO,
                providerId: fortytwo_profile.id.toString(),
                accessToken: undefined,
                refreshToken: undefined,
            };
            try {
                await this.userService.linkOAuthProviderToUser(user.id, DB_provider);
                console.log("[google.service] Successfully linked Google OAuth provider to user:", user.id);
                const twoFactorMethods = await this.userService.getUserTwoFactorMethods(user.id);
                const isTwoFactorEnabled = twoFactorMethods.length > 0;
                return ({
                    username: user.username,
                    email: user.email,
                    id: user.id,
                    avatarUrl: user.avatarUrl,
                    isTwoFactorEnabled: isTwoFactorEnabled,
                    twoFactorMethods: twoFactorMethods,
                });
            }
            catch (error) {
                console.log("[google.service] Error linking OAuth provider to user:", error);
                return null;
            }
        }
    }
}
exports.Api42OAuthProvider = Api42OAuthProvider;
