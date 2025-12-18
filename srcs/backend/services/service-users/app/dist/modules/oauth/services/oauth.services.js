"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   oauth.services.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:45:25 by tissad            #+#    #+#             */
/*   Updated: 2025/11/18 15:33:12 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OauthService = void 0;
const google_provider_1 = require("../providers/google.provider");
const github_provider_1 = require("../providers/github.provider");
const api42_provider_1 = require("../providers/api42.provider");
/***********************************/
/*     Oauth Service Class         */
/***********************************/
class OauthService {
    constructor(prismaClient) {
        this.prismaClient = prismaClient;
    }
    async handleGoogleOAuth(code) {
        try {
            const googleProvider = new google_provider_1.GoogleOAuthProvider(this.prismaClient);
            const accessToken = await googleProvider.getAccessToken(code);
            const profile = await googleProvider.getGoogleProfile(accessToken);
            const user = await googleProvider.findOrCreateUser(profile);
            return user;
        }
        catch (error) {
            console.log("[OAuth Service] Google OAuth error:", error);
            return (null);
        }
    }
    async handleGitHubOAuth(code) {
        try {
            const githubProvider = new github_provider_1.GitHubOAuthProvider(this.prismaClient);
            const accessToken = await githubProvider.getAccessToken(code);
            const profile = await githubProvider.getGithubProfile(accessToken);
            const user = await githubProvider.findOrCreateUser(profile);
            return user;
        }
        catch (error) {
            console.log("[OAuth Service] Google OAuth error:", error);
            return (null);
        }
    }
    async handle42OAuth(code) {
        try {
            const api42Provider = new api42_provider_1.Api42OAuthProvider(this.prismaClient);
            const accessToken = await api42Provider.getAccessToken(code);
            const profile = await api42Provider.get42Profile(accessToken);
            const user = await api42Provider.findOrCreateUser(profile);
            return user;
        }
        catch (error) {
            console.log("[OAuth Service] 42 OAuth error:", error);
            return (null);
        }
    }
}
exports.OauthService = OauthService;
