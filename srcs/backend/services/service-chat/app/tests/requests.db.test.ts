import {
  isBlocked,
  blockUser,
  unblockUser,
  findConversationBetween,
  createConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  getMessagesPaginated
} from "../srcs/requestsDb/request.db";
import { test, expect, vi, beforeEach } from "vitest";

import { prisma } from "./__mocks__/prisma";

// Mock PrismaClient
vi.mock("@prisma/client", () => {
  return { PrismaClient: vi.fn(() => prisma) };
});

beforeEach(() => {
  vi.clearAllMocks();
});

// ================================
//           BLOCK SYSTEM
// ================================

test("isBlocked should call prisma.block.findUnique", async () => {
  prisma.block.findUnique.mockResolvedValue({ id: 1 });

  const result = await isBlocked(1, 2);

  expect(prisma.block.findUnique).toHaveBeenCalledWith({
    where: { blockerId_blockedId: { blockerId: 1, blockedId: 2 } }
  });

  expect(result).toEqual({ id: 1 });
});

test("blockUser should create a block entry", async () => {
  prisma.block.create.mockResolvedValue({ id: 1 });

  const result = await blockUser(1, 2);

  expect(prisma.block.create).toHaveBeenCalledWith({
    data: { blockerId: 1, blockedId: 2 }
  });

  expect(result).toEqual({ id: 1 });
});

test("unblockUser should delete a block entry", async () => {
  prisma.block.delete.mockResolvedValue({ id: 1 });

  const result = await unblockUser(1, 2);

  expect(prisma.block.delete).toHaveBeenCalledWith({
    where: { blockerId_blockedId: { blockerId: 1, blockedId: 2 } }
  });

  expect(result).toEqual({ id: 1 });
});

// ================================
//           CONVERSATIONS
// ================================

test("findConversationBetween should call prisma.conversation.findFirst", async () => {
  prisma.conversation.findFirst.mockResolvedValue({ id: 10 });

  const result = await findConversationBetween(1, 2);

  expect(prisma.conversation.findFirst).toHaveBeenCalled();
  expect(result).toEqual({ id: 10 });
});

test("createConversation should create a new conversation", async () => {
  prisma.conversation.create.mockResolvedValue({ id: 99 });

  const result = await createConversation(1, 2);

  expect(prisma.conversation.create).toHaveBeenCalledWith({
    data: {
      participants: {
        create: [{ userId: 1 }, { userId: 2 }]
      }
    },
    include: { participants: true }
  });

  expect(result).toEqual({ id: 99 });
});

test("getUserConversations should call prisma.conversation.findMany", async () => {
  prisma.conversation.findMany.mockResolvedValue([{ id: 50 }]);

  const result = await getUserConversations(1);

  expect(prisma.conversation.findMany).toHaveBeenCalled();
  expect(result).toEqual([{ id: 50 }]);
});

// ================================
//             MESSAGES
// ================================

test("getMessages should retrieve messages sorted ASC", async () => {
  prisma.message.findMany.mockResolvedValue([{ id: 1 }]);

  const result = await getMessages(5);

  expect(prisma.message.findMany).toHaveBeenCalledWith({
    where: { conversationId: 5 },
    orderBy: { sentAt: "asc" },
    include: { sender: true }
  });

  expect(result).toEqual([{ id: 1 }]);
});

test("sendMessage should create a message", async () => {
  prisma.message.create.mockResolvedValue({ id: 123 });

  const result = await sendMessage(5, 1, "hello");

  expect(prisma.message.create).toHaveBeenCalledWith({
    data: { conversationId: 5, senderId: 1, content: "hello" },
    include: { sender: true }
  });

  expect(result).toEqual({ id: 123 });
});

test("getMessagesPaginated should call prisma.message.findMany with cursor", async () => {
  prisma.message.findMany.mockResolvedValue([{ id: 1 }]);

  await getMessagesPaginated(5, 10);

  expect(prisma.message.findMany).toHaveBeenCalledWith({
    take: -20,
    skip: 1,
    cursor: { id: 10 },
    where: { conversationId: 5 },
    orderBy: { id: "asc" }
  });
});
