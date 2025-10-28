/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   api42.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:18 by tissad            #+#    #+#             */
/*   Updated: 2025/10/28 16:13:44 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import axios from "axios";
/********************************
 *   42 OAuth Provider          *
 * ******************************/

export class Api42OAuthProvider {
        private clientId: string;
    private clientSecret: string;
    private redirectUri: string

    constructor() {
        this.clientId = process.env.FORTYTWO_CLIENT_ID!;
        this.clientSecret = process.env.FORTYTWO_CLIENT_SECRET!;
        this.redirectUri = process.env.FORTYTWO_REDIRECT_URI!;
    }

      /**
   * step 1 — get access token from GitHub
   */
    async getAccessToken(code: string): Promise<string> {
        const url = "https://api.intra.42.fr/oauth/token";
        const params = {
            grant_type: "authorization_code",
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
            redirect_uri: this.redirectUri,
        };
        const response = await axios.post(url, params, {
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
    async get42Profile(token: string): Promise<any> {
        const response = await axios.get("https://api.intra.42.fr/v2/me", {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status !== 200) {
            console.log("[42.service] Failed to fetch 42 profile:", response.data);
            throw new Error("Failed to fetch 42 profile");
        }
        return response.data;
    }
}