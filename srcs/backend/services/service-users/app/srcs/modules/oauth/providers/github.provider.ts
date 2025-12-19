/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   github.provider.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 12:12:13 by tissad            #+#    #+#             */
/*   Updated: 2025/11/24 17:44:07 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import axios from "axios";
import { UsersService } from "../../users/users.services";
import { OAuthProvider,
        UserProfile
 } from "../../../types/user.types";
import { OAuthProviderType } from "../../../prisma/prisma/generated/client/enums";
/***********************************/
/*    GitHub OAuth Provider        */
/***********************************/ 
export class GitHubOAuthProvider {
  private clientId: string;
  private clientSecret: string;
  private userService: UsersService;

  constructor(prismaClient: any) {
    this.clientId = process.env.GITHUB_CLIENT_ID!;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET!;
    this.userService = new UsersService(prismaClient);
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
      // console.log("[github.service] OAuth error:", response.data);
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
      // console.log("[github.service] Failed to fetch GitHub profile:", response.data); 
      throw new Error("Failed to fetch GitHub profile");
    }
    return response.data;
  }
  /*
  step 3 — find user in DB
  */
  async findOrCreateUser(github_profile: any): Promise<any> {
    // Placeholder logic to find or create user in your database
    // console.log("[github.service] Finding or creating user with GitHub profile:", github_profile);
    
    let  user = await this.userService.getUserByUsername(github_profile.login)||
                   await this.userService.getUserByEmail(github_profile.notification_email);
    // console.log("[github.service] Searching for user by userName:", github_profile.login);
    // console.log("[github.service] GitHub profile data:", github_profile.notification_email);
    if (!user) {
      // console.log("[github.service] No existing user found, creating new user");
      const DB_profile: UserProfile = {
          email: github_profile.notification_email,
          username: github_profile.login,
          // firstName: google_profile.given_name,
          // lastName: google_profile.family_name,
          passwordHash: undefined,
          isVerified: true,
          emailVerified: false,
          phoneVerified: false,
          phoneNumber: undefined,
          displayName: github_profile.login,
          avatarUrl: github_profile.avatar_url,
          createdAt: new Date(),
          updatedAt: new Date(),
      };
      try {
          // console.log("[github.service] Creating user with profile:", DB_profile);
            user = await this.userService.createUser(DB_profile);
      } catch (error) {
          // console.log("[github.service] Error preparing user creation:", error);
          return null;
      }
    }
    // link OAuth provider to the new user
    if (user)
    {
      // console.log("[google.service] Linking Google OAuth provider to user:", user.id);
      const DB_provider : OAuthProvider = {
        provider: OAuthProviderType.GITHUB,
        providerId: github_profile.id.toString(),
        accessToken: undefined,
        refreshToken: undefined,
      }
      try {
          await this.userService.linkOAuthProviderToUser(user.id, DB_provider);
          // console.log("[google.service] Successfully linked Google OAuth provider to user:", user.id);
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
          // console.log("[google.service] Error linking OAuth provider to user:", error);
          return null;
      }    
    }
  }
}