/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   chat.controller.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 19:00:31 by tissad            #+#    #+#             */
/*   Updated: 2025/12/01 08:48:26 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { FastifyReply, FastifyRequest } from 'fastify';
import { chatService } from "../services/chat.service";
import { Server } from "socket.io";

export async function getUserConversations(request: FastifyRequest, reply: FastifyReply) {
    const { username } = (request as any).query;
    console.log("Request to get conversations for user:", username);
    try {
        if (!username) {
            //send empty array
            return reply.send([]);
        }
        const user = await chatService.getUserByUsername(username);
        if (!user) {
            return reply.send([]);
        }
        const conversations = await chatService.getUserConversations(user.id);
        if (!conversations || conversations.length === 0) {
            return reply.send([]);
        }
            // Format conversations to include the other user's username
        const formattedConversations = conversations.map((conversation: any) => {
            const otherUser = conversation.participants.find((p: any) => p.userId !== user.id);
            return {
                otherUsername: otherUser ? otherUser.user.username : null,
                messages: conversation.messages,
            };
        });
        return reply.send(formattedConversations);
    }
    catch (error) {
        console.error("Error getting user conversations:", error);
        return reply.status(500).send({ error: "Internal Server Error" });
    }
    
}

export async function startConversation(request: FastifyRequest, reply: FastifyReply) {
    const { senderUsername, receiverUsername } = (request as any).body;
    // check if both users exist with userService (not implemented yet)
    console.log("Request to start conversation between:", senderUsername, "and", receiverUsername);
    try {
        // add user existence check with userService here
        // if not exist, create user
        if (!senderUsername || !receiverUsername) {
            return reply.status(400).send({ error: "Both senderUsername and receiverUsername are required." });
        }
        let senderUser = await chatService.getUserByUsername(senderUsername) 
        if (!senderUser) {       
            senderUser = await chatService.addUser(senderUsername);  
        }
        let receiverUser = await chatService.getUserByUsername(receiverUsername);
        if (!receiverUser) {
            receiverUser = await chatService.addUser(receiverUsername);
        }
        const conversation = await chatService.startConversation(senderUser.id, receiverUser.id);
        return reply.send(conversation);
    }
    catch (error) {
        console.error("Error starting conversation:", error);
        return reply.status(500).send({ error: "Internal Server Error" });
    }
}

export async function sendMessage(request: FastifyRequest, reply: FastifyReply) {
    
    const { senderUsername, receiverUsername, content } = (request as any).body;
    console.log("Request to send message from:", senderUsername, "to", receiverUsername, "with content:", content);
    try {
        if (!senderUsername || !receiverUsername || !content) {
            return reply.status(400).send({ error: "senderUsername, receiverUsername, and content are required." });
        }
        let senderUser = await chatService.getUserByUsername(senderUsername);
        if (!senderUser) {
            senderUser = await chatService.addUser(senderUsername);
        }
        let receiverUser = await chatService.getUserByUsername(receiverUsername);
        if (!receiverUser) {
            receiverUser = await chatService.addUser(receiverUsername);
        }
        const conversation = await chatService.startConversation(senderUser.id, receiverUser.id);
        const conversationId = conversation.id;
        const senderId = senderUser.id;
        


        const message = await chatService.sendMessage(conversationId, senderId, content);
        
        return reply.send(message);
    }
    catch (error) {
        console.error("Error sending message:", error);
        return reply.status(500).send({ error: "Internal Server Error" });
    }
}

