/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   chat.service.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:54:11 by tissad            #+#    #+#             */
/*   Updated: 2025/12/02 17:04:26 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
  getUserConversations,
  findConversationBetween,
  createConversation,
  getUserByUsername,
  getMessages,
  sendMessage,
  blockUser,
  unblockUser,
  isBlocked,
  addUser
} from "../requestsDb/request.db";

export class ChatService {

    async getUserByUsername(username: string) {
        return await getUserByUsername(username);
    }
    
    async addUser(username: string) {
        return await addUser(username);
    }
    
    async getUserConversations(userId: number) {
        return await getUserConversations(userId);
    }
    
    async findConversationBetween(userId: number, targetUserId: number) {
        return await findConversationBetween(userId, targetUserId);
    }

    async startConversation(userId: number, targetUserId: number) {
        let conversation = await this.findConversationBetween(userId, targetUserId);
        if (!conversation) {
            conversation = await createConversation(userId, targetUserId);
        }
        return conversation;
    }
    async getMessages(userId: number, conversationId: number) {
        const conversation = await findConversationBetween(userId, conversationId);
        if (!conversation) throw new Error("Forbidden");
        return await getMessages(conversationId);
    }
    async sendMessage(conversationId: number, senderId: number, content: string, senderUsername: string, receiverUsername: string) {
        return await sendMessage(conversationId, senderId, content, senderUsername, receiverUsername);
    }
    async blockUser(userId: number, targetUserId: number) {
        return await blockUser(userId, targetUserId);
    }
    async unblockUser(userId: number, targetUserId: number) {
        return await unblockUser(userId, targetUserId);
    }
    async isBlocked(userId: number, targetUserId: number) {
        return await isBlocked(userId, targetUserId);
    }
    
}

export const chatService = new ChatService();