/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   request.db.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/28 10:57:51 by tissad             #+#    #+#             */
/*   Updated: 2025/11/28 10:57:52 by tissad            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */



import { PrismaClient } from "../prisma/prisma/generated/client/client";
const prisma = new PrismaClient();

// =============================
//     USER / BLOCK SYSTEM
// =============================

// get user by username
export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username }
  });
}


// add user
export async function addUser(username: string) {
  return prisma.user.create({
    data: { username }
  });
}



// Check if user A has blocked user B
export async function isBlocked(blockerId: number, blockedId: number) {
  return prisma.block.findUnique({
    where: {
      blockerId_blockedId: { blockerId, blockedId }
    }
  });
}

// Block a user
export async function blockUser(blockerId: number, blockedId: number) {
  return prisma.block.create({
    data: { blockerId, blockedId }
  });
}

// Unblock a user
export async function unblockUser(blockerId: number, blockedId: number) {
  return prisma.block.delete({
    where: {
      blockerId_blockedId: { blockerId, blockedId }
    }
  });
}

// =============================
//         CONVERSATIONS
// =============================




// Find an existing 1-to-1 conversation
export async function findConversationBetween(userA: number, userB: number) {
  return prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          userId: { in: [userA, userB] }
        }
      }
    },
    include: {
      participants: true
    }
  });
}

// Create a conversation between two users
export async function createConversation(userA: number, userB: number) {
  return prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: userA },
          { userId: userB }
        ]
      }
    },
    include: {
      participants: true
    }
  });
}

// Get all conversations for a user
export async function getUserConversations(userId: number) {
  return prisma.conversation.findMany({
    where: {
      participants: { some: { userId } }
    },
    include: {
      participants: {
        include: { user: true }
      },
      messages: {
        orderBy: { sentAt: "asc"}
      }
    }
  });
}

export async function getConversationById(conversationId: number) {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: { user: true }
      },
      messages: {

        orderBy: { sentAt: "desc" }
      }
    }
  });
} 


// =============================
//            MESSAGES
// =============================

// Get full history of a conversation
export async function getMessages(conversationId: number) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { sentAt: "asc" },
    include: {
      sender: true
    }
  });
}

// Send a message
export async function sendMessage(conversationId: number, senderId: number, content: string, senderUsername: string, receiverUsername: string) {
  return prisma.message.create({
    data: {
      senderUsername,
      receiverUsername,
      conversationId,
      senderId,
      content,
      sentAt: new Date()
    },
    include: {
      sender: true
    }
  });
}

// Get last X messages (for pagination)
export async function getMessagesPaginated(conversationId: number, cursor?: number) {
  return prisma.message.findMany({
    take: -20,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    where: { conversationId },
    orderBy: { id: "asc" }
  });
}
