/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   google.provider.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:09 by tissad            #+#    #+#             */
/*   Updated: 2025/12/10 15:12:35 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import axios from "axios";
import { UsersService } from "../../users/users.services";
import { OAuthProvider,
        UserProfile
 } from "../../../types/user.types";
import { OAuthProviderType } from "../../../prisma/prisma/generated/client/enums";

/***********************************/
/*    Google OAuth Provider       */
/***********************************/

export class GoogleOAuthProvider {
    private clientId: string;
    private clientSecret: string;
    private userService: UsersService;


    constructor(prismaClient: any) {
        this.clientId = process.env.GOOGLE_CLIENT_ID!;
        this.clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
        this.userService = new UsersService(prismaClient);
    }
  
    async getAccessToken(code: string): Promise<string> {
        const url = "https://oauth2.googleapis.com/token";
        const params = {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
            grant_type: "authorization_code",
            redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        };
        console.log("[google.service] Requesting access token from Google");
        const response = await axios.post(url, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        if (response.data.error) {
            console.log("[google.service] OAuth error:", response.data);
            throw new Error(response.data.error_description || "Google OAuth error");
        }
        console.log("[google.service] Received access token from Google");
        return response.data.access_token;
    }

    
    async getGoogleProfile(token: string): Promise<any> {
        console.log("[google.service] Fetching Google profile with access token");
        const response = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
        }); 
        if (response.status !== 200) {
            console.log("[google.service] Failed to fetch Google profile:", response.data);
            throw new Error("Failed to fetch Google profile");
        }
        // console.log("[google.service] ====>Successfully fetched Google profile", response);
        return (response.data);
    }
    /*
    step 3 — find user in DB or create new user
    */
    // connection ok + jwt token, not user data
    async findOrCreateUser(google_profile: any): Promise<any> {
        console.log("[google.service]================> Google profile data:", google_profile);
        let  user = await this.userService.getUserByEmail(google_profile.email);
        console.log("[google.service] Searching for user by email:", google_profile.email);  
        if (!user) {
            console.log("[google.service] No existing user found, creating new user");
            const DB_profile: UserProfile = {
                email: google_profile.email,
                username: google_profile.name,
                // firstName: google_profile.given_name,
                // lastName: google_profile.family_name,
                passwordHash: undefined,
                isVerified: true,
                emailVerified: google_profile.verified_email,
                phoneVerified: false,
                phoneNumber: undefined,
                displayName: google_profile.name,
                avatarUrl: google_profile.picture,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            try {
                console.log("[google.service] Creating user with profile:", DB_profile);
                 user = await this.userService.createUser(DB_profile);
            } catch (error) {
                console.log("[google.service] Error preparing user creation:", error);
                return null;
            }
        }
        // link OAuth provider to the new user
        if (user)
        {
            console.log("[google.service] Linking Google OAuth provider to user:", user.id);
            const DB_provider : OAuthProvider = {
                provider: OAuthProviderType.GOOGLE,
                providerId: google_profile.id,// Google unique ID /!\
                accessToken: undefined,
                refreshToken: undefined,
            }
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
                    isTwoFactorEnabled : isTwoFactorEnabled,
                    twoFactorMethods: twoFactorMethods,
                });
            } catch (error) {
                console.log("[google.service] Error linking OAuth provider to user:", error);
                return null;
            }    
        }
    }
}