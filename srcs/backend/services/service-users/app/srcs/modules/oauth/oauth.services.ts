/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauth.services.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:45:25 by tissad            #+#    #+#             */
/*   Updated: 2025/10/30 17:20:51 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import axios from "axios";
import { GoogleOAuthProvider } from "./providers/google";
import { GitHubOAuthProvider } from "./providers/github";
import { Api42OAuthProvider } from "./providers/api42";
/***********************************/
/*     Oauth Service Class         */
/***********************************/
export class OauthService {
    // Placeholder for OAuth service methods
    private prismaClient: any;
    constructor(prismaClient: any) {
        this.prismaClient = prismaClient;
    }
    
    async handleGoogleOAuth(code: string): Promise<any> {
        try {
            const googleProvider = new GoogleOAuthProvider( this.prismaClient);
            const accessToken = await googleProvider.getAccessToken(code);
            const profile = await googleProvider.getGoogleProfile(accessToken);
            const user = await googleProvider.findOrCreateUser(profile);
            return user;
        } catch (error) {
            console.log("[OAuth Service] Google OAuth error:", error);
            return (null);
        }
    }
    
    async handleGitHubOAuth(code: string): Promise<any> {
        try {
            const githubProvider = new GitHubOAuthProvider( this.prismaClient);
            const accessToken = await githubProvider.getAccessToken(code);
            const profile = await githubProvider.getGithubProfile(accessToken);
            const user = await githubProvider.findOrCreateUser(profile);
            return user;
        } catch (error) {
            console.log("[OAuth Service] Google OAuth error:", error);
            return (null);
        }
    }

    async handle42OAuth(code: string): Promise<any> {
        try {
            const api42Provider = new Api42OAuthProvider(this.prismaClient);
            const accessToken = await api42Provider.getAccessToken(code);
            const profile = await api42Provider.get42Profile(accessToken);
            const user = await api42Provider.findOrCreateUser(profile);
            return user;
        } catch (error) {
            console.log("[OAuth Service] 42 OAuth error:", error);
            return (null);
        }
    }
}   