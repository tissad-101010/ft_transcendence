/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.controller.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 19:00:31 by tissad            #+#    #+#             */
/*   Updated: 2025/11/19 22:05:45 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyReply, FastifyRequest } from "fastify";
import { FriendsService } from "../services/friends.service";

export async function getAllUsersController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const service = new FriendsService(request.server);
    const users = await service.getAllUsers();
    return reply.send({ success: true, data: users });
  } catch (err: any) {
    console.error(err);
    return reply.status(500).send({ success: false, message: err.message });
  }
}

export async function sendInviteController(request: FastifyRequest<{ Params: { friendId: string } }>, reply: FastifyReply) {
  try {
    const service = new FriendsService(request.server);
    const userId = request.cookies.userId; // ou extraire depuis JWT
    const friendId = request.params.friendId;
    const invite = await service.sendInvitation(userId, friendId);
    return reply.send({ success: true, data: invite });
  } catch (err: any) {
    console.error(err);
    return reply.status(400).send({ success: false, message: err.message });
  }
}

export async function acceptInviteController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const service = new FriendsService(request.server);
    const updated = await service.acceptInvitation(Number(request.params.id));
    return reply.send({ success: true, data: updated });
  } catch (err: any) {
    console.error(err);
    return reply.status(400).send({ success: false, message: err.message });
  }
}

export async function declineInviteController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const service = new FriendsService(request.server);
    const updated = await service.declineInvitation(Number(request.params.id));
    return reply.send({ success: true, data: updated });
  } catch (err: any) {
    console.error(err);
    return reply.status(400).send({ success: false, message: err.message });
  }
}

export async function blockUserController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const service = new FriendsService(request.server);
    const updated = await service.blockUser(Number(request.params.id));
    return reply.send({ success: true, data: updated });
  } catch (err: any) {
    console.error(err);
    return reply.status(400).send({ success: false, message: err.message });
  }
}

export async function removeFriendController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const service = new FriendsService(request.server);
    const deleted = await service.removeFriend(Number(request.params.id));
    return reply.send({ success: true, data: deleted });
  } catch (err: any) {
    console.error(err);
    return reply.status(400).send({ success: false, message: err.message });
  }
}

export async function listSentInvitesController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const service = new FriendsService(request.server);
    const userId = request.cookies.userId;
    const { sent } = await service.listInvitations(userId);
    return reply.send({ success: true, data: sent });
  } catch (err: any) {
    console.error(err);
    return reply.status(500).send({ success: false, message: err.message });
  }
}

export async function listReceivedInvitesController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const service = new FriendsService(request.server);
    const userId = request.cookies.userId;
    const { received } = await service.listInvitations(userId);
    return reply.send({ success: true, data: received });
  } catch (err: any) {
    console.error(err);
    return reply.status(500).send({ success: false, message: err.message });
  }
}

export async function listFriendsController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const service = new FriendsService(request.server);
    const userId = request.cookies.userId;
    const { received, sent } = await service.listInvitations(userId);
    const friends = [
      ...sent.filter(inv => inv.status === "ACCEPTED").map(inv => inv.toUserId),
      ...received.filter(inv => inv.status === "ACCEPTED").map(inv => inv.fromUserId)
    ];
    return reply.send({ success: true, data: friends });
  } catch (err: any) {
    console.error(err);
    return reply.status(500).send({ success: false, message: err.message });
  }
}
