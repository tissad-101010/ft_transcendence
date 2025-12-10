/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.services.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:51:29 by tissad            #+#    #+#             */
/*   Updated: 2025/12/01 11:54:26 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { OAuthProvider, OAuthProviderType } from "../../types/user.types";
import { DataBaseConnectionError, UserNotFoundError } from "../../errors/users.error";


async function safePrisma<T>(fn: () => Promise<T>) : Promise<T>
{
  try
  {
    return await fn();
  } catch (err: any)
  {
    if (err.code === "P1001" || err.code === "P1002")
      throw new DataBaseConnectionError();
    throw err;
  }
}

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
        
    async getUserById(id: string) {
      try
      {
        // CALL BDD
        const user = await this.prismaClient.user.findUnique({
          where: { id },
        });
        // SUCCESS
        return user;
      } catch (error: any)
      {
        // DATABASE ERROR
        if (error.code === "P1001" || error.code === "P1002")
          throw new DataBaseConnectionError();
        // USER NOT FOUND (NOT NECESSARY)
        if (error instanceof UserNotFoundError)
          throw error;
        // OTHER ERROR
        throw new Error("Unknown database error");
      }
    }
    
    async getUserByEmail(email: string) { 
        return this.prismaClient.user.findUnique({
            where: { email },
        });
    }

    async getUserByUsername(username: string) {
      try
      {
        // CALL BDD
        const user = await this.prismaClient.user.findUnique({
          where: { username },
        });
        // SUCCESS
        return user;
      } catch (error: any)
      {
        // DATABASE ERROR
        if (error.code === "P1001" || error.code === "P1002")
          throw new DataBaseConnectionError();
        // USER NOT FOUND (NOT NECESSARY)
        if (error instanceof UserNotFoundError)
          throw error;
        // OTHER ERROR
        throw new Error("Unknown database error");
      }
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
  async linkOAuthProviderToUser(userId: string, oauthData: OAuthProvider) {
    try {
      // step 1️⃣ — check if user exists
      try {
        await this.prismaClient.user.findUnique({ where: { id: userId } });
      } catch {
        throw new Error('User not found');
      }

      // 2️⃣ — check if the OAuth provider is already linked
      const existing = await this.prismaClient.oAuthProvider.findFirst({
        where: {
          userId,
          provider: oauthData.provider,
        },
      });

      let result;

      if (existing) {
        // 3️⃣ — update existing OAuth provider link
        console.log('🔄 Updating existing OAuth provider link for user ID:', userId);
        result = await this.prismaClient.oAuthProvider.update({
          where: { id: existing.id },
          data: {
            providerId: oauthData.providerId,
            accessToken: oauthData.accessToken,
            refreshToken: oauthData.refreshToken,
          },
        });
      } else {
        // 4️⃣ — create new OAuth provider link
        console.log('🔗 Linking new OAuth provider to user:', oauthData.provider, oauthData.providerId, 'for user ID:', userId);
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
    /**********************************************************/
    /*                       2FA Methods                      */
    /**********************************************************/
    // add 2FA method to user
    async addUserTwoFactorMethod(userId: string, method: string) {
      return this.prismaClient.twoFactorMethod.create({
        data: {
          type: method,
          enabled: true,
          createdAt: new Date(),
          user: { 
            connect: { id: userId } },
        },
      });
    }

    
    // Get enabled 2FA methods for a user
    async getUserTwoFactorMethods(userId: string): Promise<any[]> {
      const userWith2FA = await this.prismaClient.user.findUnique({
        where: { id: userId },
        include: {
          twoFactorMethods: true, // charge la relation
        },
      });
      return userWith2FA?.twoFactorMethods || [];
    }
    // remove 2FA method from user
    async removeUserTwoFactorMethod(userId: string, method: string) {
      return this.prismaClient.twoFactorMethod.deleteMany({
        where: {
          userId,
          type: method,
        },
      });
    }

  /**********************************************************/
  /*               update user password method              */
  /**********************************************************/
  async updateUserPassword(userId: string, newHashedPassword: string) {
    return this.prismaClient.user.update({
      where: { id: userId },
      data: { passwordHash: newHashedPassword },
    });
  }
  async uploadUserAvatar(userId: string, avatarUrl:string): Promise<boolean> {
    try {
      await this.prismaClient.user.update({
        where: { id: userId },
        data: { avatarUrl },
      });
      return true;
    } catch (error) {
      console.error("❌ [users.services.ts] Error updating avatar for user ID:", userId, error);
      return false;
    }
  }

    /**********************************************************/
    /*                       INFO FRIEND                      */
    /**********************************************************/
    
    async getInfoFriendService(
      username: string
    ): Promise<{lastLogin: Date, avatarUrl: string}>
    {
      return (await safePrisma(() =>
        this.prismaClient.user.findUnique({
          where: { username: username },
          select: {
            lastLogin: true,
            avatarUrl: true
          }
        })
      ));
    }
}