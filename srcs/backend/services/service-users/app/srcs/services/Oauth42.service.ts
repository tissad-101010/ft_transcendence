/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Oauth42.service.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/21 13:52:48 by tissad            #+#    #+#             */
/*   Updated: 2025/10/21 14:25:46 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import axios from "axios";
import { Pool } from "pg";
export class Oauth42Service {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string
    private db: Pool;

    constructor(private pg: Pool) {
        this.clientId = process.env.FORTYTWO_CLIENT_ID!;
        this.clientSecret = process.env.FORTYTWO_CLIENT_SECRET!;
        this.redirectUri = process.env.FORTYTWO_REDIRECT_URI!;
        this.db = pg;
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
     /**
   * step 3 — find existing user or create a new one
   */
    async findOrCreateUser(profile: any): Promise<any> {    
        const client = await this.db.connect();
        try {
            const res = await client.query(
                "SELECT * FROM users WHERE email = $1",
                [profile.email]
            );
            if (res.rows.length > 0) {
                return res.rows[0];
            } else {
                const insertRes = await client.query(
                    "INSERT INTO users (email, oauth42_id, username, provider) VALUES ($1, $2, $3, $4) RETURNING *",
                    [profile.email, profile.id, profile.login, '42']
                );
                return insertRes.rows[0];
            }
        } finally {
            client.release();
        }
    }
}

