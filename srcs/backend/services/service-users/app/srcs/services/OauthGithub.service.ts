/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   github.service.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/17 16:56:59 by tissad            #+#    #+#             */
/*   Updated: 2025/10/20 17:36:35 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */



import axios from "axios";
import { Pool } from "pg";

export class GithubService {
  private clientId: string;
  private clientSecret: string;
  private db: Pool;

  constructor(private pg: Pool) {
    this.clientId = process.env.GITHUB_CLIENT_ID!;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET!;
    this.db = pg;
  }

  /**
   * step 1 — get access token from GitHub
   */
  async getAccessToken(code: string): Promise<string> {
    const url = "https://github.com/login/oauth/access_token";
    const params = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
    };

    const response = await axios.post(url, params, {
      headers: { Accept: "application/json" },
    });

    if (response.data.error) {
      console.log("[github.service] OAuth error:", response.data);
      throw new Error(response.data.error_description || "GitHub OAuth error");
    }

    return response.data.access_token;
  }

  /**
   * step 2 — get GitHub profile using access token
   */
  async getGithubProfile(token: string): Promise<any> {
    const response = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status !== 200) {
      console.log("[github.service] Failed to fetch GitHub profile:", response.data); 
      throw new Error("Failed to fetch GitHub profile");
    }
    return response.data;
  }

  /**
   * step 3 — find existing user or create a new one
   */
  async findOrCreateUser(profile: any) {
    const { id: githubId, email, name, login, avatar_url } = profile;
    console.log("[github.service] GitHub profile:", profile);
    console.log("[github.service] Searching for user with GitHub ID:", githubId, "or email:", email);
    // check if user with this githubId or email already exists
    const { rows } = await this.db.query(
      `SELECT * FROM users WHERE github_id = $1 OR email = $2 LIMIT 1`,
      [githubId?.toString(), email]
    );
    if (rows.length <= 0) {
      console.log("[github.service] No existing user found.");
    } else {
      console.log("[github.service] Found existing user:", rows[0]);
    }

    if (rows.length > 0) {
      const existingUser = rows[0];
      console.log("[github.service] Existing user details:", existingUser);
      // if the user exists but doesn't have github_id linked, update it
      if (!existingUser.github_id) {
        console.log("[github.service] Linking GitHub ID to existing user.");
        await this.db.query(
          `UPDATE users SET github_id = $1, provider = 'github', updated_at = NOW() WHERE id = $2`,
          [githubId?.toString(), existingUser.id]
        );
        console.log("[github.service] GitHub ID linked successfully.");
      }

      return existingUser;
    }

    // else, create a new user
    console.log("[github.service] Creating new user.");
    const insert = await this.db.query(
      `INSERT INTO users (username, email, provider, github_id, name, avatar_url)
       VALUES ($1, $2, 'github', $3, $4, $5)
       RETURNING *`,
      [login, email, githubId?.toString(), name, avatar_url]
    );
    if (insert.rows.length <= 0) {
      console.log("[github.service] Failed to create new user.");
      throw new Error("Failed to create new user");
    }
    console.log("[github.service] New user created:", insert.rows[0]);

    return insert.rows[0];
  }
}

