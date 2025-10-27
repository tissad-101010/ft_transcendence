/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.services.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 11:51:29 by tissad            #+#    #+#             */
/*   Updated: 2025/10/27 13:45:43 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/***********************************/
/*       Users Service Class      */
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