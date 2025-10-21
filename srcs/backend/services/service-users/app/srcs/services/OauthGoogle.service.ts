/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   google.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/20 17:48:07 by tissad            #+#    #+#             */
/*   Updated: 2025/10/20 17:56:31 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import axios from "axios";
import { Pool } from "pg";


export class GoogleService {
    private clientId: string;
    private clientSecret: string;
    private redirectUri: string;
    private db: Pool;

  constructor(private pg: Pool) {
    this.clientId = process.env.GOOGLE_CLIENT_ID!;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI!;
    this.db = pg;
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
    const response = await axios.post(url, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    if (response.data.error) {
        console.log("[google.service] OAuth error:", response.data);
        throw new Error(response.data.error_description || "Google OAuth error");
    }
    return response.data.access_token;
  }

  async getGoogleProfile(token: string): Promise<any> {
    const response = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
    }); 
    if (response.status !== 200) {
        console.log("[google.service] Failed to fetch Google profile:", response.data);
        throw new Error("Failed to fetch Google profile");
    }
    return response.data;
  }
  
    async findOrCreateUser(profile: any): Promise<any> {
    const googleId = profile.id;
    const email = profile.email;
    const username = profile.name || profile.email.split('@')[0];

    // Check if user already exists
    const res = await this.db.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [googleId, email]);
    let user = res.rows[0];
    if (user) {
        // link existing user if google_id is not set
        if (!user.google_id) {
            console.log("[google.service] Linking Google ID to existing user.");
            await this.db.query(
                `UPDATE users SET google_id = $1, provider = 'google', updated_at = NOW() WHERE id = $2`,
                [googleId?.toString(), user.id]
            );
            console.log("[google.service] Google ID linked successfully.");
        }
        console.log("[google.service] User found:", user);
        return user;
    }
    
    
    // Create new user
    const insertRes = await this.db.query(
        `INSERT INTO users (username, email, google_id, provider, created_at, updated_at)
         VALUES ($1, $2, $3, 'google', NOW(), NOW())
         RETURNING *`,
        [username, email, googleId]
    );
    user = insertRes.rows[0];
    console.log("[google.service] New user created:", user);
    return user;
  }
}