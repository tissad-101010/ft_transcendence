/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   google.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:09 by tissad            #+#    #+#             */
/*   Updated: 2025/10/28 17:38:08 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import axios from "axios";
import { UsersService } from "../../users/users.services";
import { OAuthProvider } from "../../../types/user.types";
import { OAuthProviderType } from "../../../prisma/prisma/generated/client/enums";

/***********************************/
/*    Google OAuth Provider       */
/***********************************/

export class GoogleOAuthProvider {
    private clientId: string;
    private clientSecret: string;
    private userService: UsersService;


    constructor(prismaClient?: any) {
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
        console.log("[google.service] Successfully fetched Google profile");
        return response.data;
    }
    /*
    step 3 — find user in DB or create new user
    */
    async findOrCreateUser(profile: any): Promise<any> {
        let user = await this.userService.getUserByEmail(profile.email);
        if (!user) {
            console.log("[google.service] No existing user found, creating new user");
            const data = {
                email: profile.email,
                username: profile.name,
                
            };
            user = await this.userService.createUser(data);
            // link OAuth provider to the new user
            if (user)
            {
                await this.userService.linkOAuthProviderToUser(user.id, {
                    provider: OAuthProviderType.GOOGLE,
                    providerId: profile.providerId,
                    accessToken: profile.accessToken,
                    refreshToken: profile.refreshToken,
                });
            }
            
        } else {
            console.log("[google.service] Existing user found:", user.username);
        }
        return user;
    }
}