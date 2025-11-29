/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   chat.routes.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: issad <issad@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:55:45 by tissad            #+#    #+#             */
/*   Updated: 2025/11/29 18:56:46 by issad            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */



import { FastifyInstance } from "fastify";

import { getUserConversations,
         startConversation,
          sendMessage
        } from "../controllers/chat.controller";



export async function chatRoutes(fastify: FastifyInstance) {
  
  // ===============================
  //       CONVERSATIONS
  // ===============================

  // Get all conversations for a user
  fastify.post("/conversation/start-conversation", startConversation);
  
  fastify.get("/conversation/get-user-conversations", getUserConversations);
  
 
  // // ===============================
  // //          MESSAGES
  // // ===============================


  // fastify.get("/chat/messages/:conversationId", async (request: any, reply) => {
  //   const userId = request.user.id;
  //   const { conversationId } = request.params;

  //   // Optional: verify user is part of conversation
  //   const conversation = await findConversationBetween(userId, parseInt(conversationId));
  //   if (!conversation) return reply.status(403).send({ error: "Forbidden" });

  //   const messages = await getMessages(parseInt(conversationId));
  //   return messages;
  // });

  // // Send a message
  fastify.post("/message/send-message", sendMessage); 

  // // ===============================
  // //            BLOCK
  // // ===============================

  // // Block a user
  // fastify.post("/chat/block/:targetId", async (request: any, reply) => {
  //   const blockerId = request.user.id;
  //   const { targetId } = request.params;

  //   const blocked = await blockUser(blockerId, parseInt(targetId));
  //   return blocked;
  // });

  // // Unblock a user
  // fastify.delete("/chat/block/:targetId", async (request: any, reply) => {
  //   const blockerId = request.user.id;
  //   const { targetId } = request.params;

  //   const unblocked = await unblockUser(blockerId, parseInt(targetId));
  //   return unblocked;
  // });

  // // Check if a user is blocked
  // fastify.get("/chat/block/:targetId", async (request: any, reply) => {
  //   const blockerId = request.user.id;
  //   const { targetId } = request.params;

  //   const blocked = await isBlocked(blockerId, parseInt(targetId));
  //   return { blocked: !!blocked };
  // });

}
