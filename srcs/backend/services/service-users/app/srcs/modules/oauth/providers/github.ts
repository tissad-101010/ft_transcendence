/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   github.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:13 by tissad            #+#    #+#             */
/*   Updated: 2025/10/28 16:37:58 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import axios from "axios";
/***********************************/
/*    GitHub OAuth Provider        */
/***********************************/ 
export class GitHubOAuthProvider {
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID!;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET!;
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
  /*
  step 3 — find user in DB
  */

}