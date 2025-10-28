/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.services.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:51:29 by tissad            #+#    #+#             */
/*   Updated: 2025/10/28 17:21:13 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */



import { OAuthProvider, OAuthProviderType } from "../../types/user.types";
/***********************************/
/*       Users Service Class       */
/***********************************/

export class UsersService {
    // Placeholder for user service methods
    private prismaClient: any;
    constructor(prismaClient: any) {
        this.prismaClient = prismaClient;
    }
    
    async createUser(data: any) {
        return this.prismaClient.user.create({
            data,
        });
    }
        
    async getUserById(userId: string) {
        return this.prismaClient.user.findUnique({
            where: { id: userId },
        });
    }
    
    async getUserByEmail(email: string) { 
        return this.prismaClient.user.findUnique({
            where: { email },
        });
    }

    async getUserByUsername(username: string) {
        return this.prismaClient.user.findUnique({
            where: { username },
        });
    }
    
    // find user by OAuth provider and provider ID
    async getUserByOAuthProvider(provider: OAuthProviderType, providerId: string) {
        return this.prismaClient.user.findFirst({
            where: {
                oauthProviders: {
                    some: {
                        provider,
                        providerId,
                    },
                },
            },
            include: {
                oauthProviders: true,
            },
        });
    }
    // link OAuth provider to user
  async linkOAuthProviderToUser(userId: string, oauthData: OAuthProviderInput) {
    try {
      // 1️⃣ Vérifie si le user existe
      const user = await this.prismaClient.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      // 2️⃣ Vérifie si un provider de ce type est déjà lié à ce user
      const existing = await this.prismaClient.oAuthProvider.findFirst({
        where: {
          userId,
          provider: oauthData.provider,
        },
      });

      let result;

      if (existing) {
        // 3️⃣ Mise à jour du provider existant
        result = await this.prismaClient.oAuthProvider.update({
          where: { id: existing.id },
          data: {
            providerId: oauthData.providerId,
            accessToken: oauthData.accessToken,
            refreshToken: oauthData.refreshToken,
          },
        });
      } else {
        // 4️⃣ Création d’un nouveau lien OAuth → User
        result = await this.prismaClient.oAuthProvider.create({
          data: {
            provider: oauthData.provider,
            providerId: oauthData.providerId,
            accessToken: oauthData.accessToken,
            refreshToken: oauthData.refreshToken,
            user: { connect: { id: userId } },
          },
        });
      }

      return result;
    } catch (err) {
      console.error('❌ Error linking OAuth provider to user:', err);
      throw err;
    }
  }
    
    // Additional user service methods can be added here
    async updateUser(userId: string, data: any) {
        return this.prismaClient.user.update({
            where: { id: userId },
            data,
        });
    }
    
    async deleteUser(userId: string) {
        return this.prismaClient.user.delete({
            where: { id: userId },
        });
    }

    async listUsers() {
        return this.prismaClient.user.findMany();
    }
}