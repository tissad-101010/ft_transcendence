/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauth.services.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:45:25 by tissad            #+#    #+#             */
/*   Updated: 2025/10/30 12:02:16 by tissad           ###   ########.fr       */
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
        const googleProvider = new GoogleOAuthProvider( this.prismaClient);
        const accessToken = await googleProvider.getAccessToken(code);
        const profile = await googleProvider.getGoogleProfile(accessToken);
        const user = await googleProvider.findOrCreateUser(profile);
        // 
        return user;
    }
    
    async handleGitHubOAuth(code: string): Promise<any> {
        const githubProvider = new GitHubOAuthProvider();
        const accessToken = await githubProvider.getAccessToken(code);
        const profile = await githubProvider.getGithubProfile(accessToken);
        return profile;
    }

    async handle42OAuth(code: string): Promise<any> {
        const api42Provider = new Api42OAuthProvider();
        const accessToken = await api42Provider.getAccessToken(code);
        const profile = await api42Provider.get42Profile(accessToken);
        return profile;
    }
}   