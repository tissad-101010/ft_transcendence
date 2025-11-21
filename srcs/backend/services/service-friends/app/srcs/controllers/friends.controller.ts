/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.controller.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 19:00:31 by tissad            #+#    #+#             */
/*   Updated: 2025/11/21 10:16:49 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyReply, FastifyRequest } from "fastify";
import { FriendsService } from "../services/friends.service";
import { FriendInvitation } from "../models/friends.model";

import { UsersApi } from "../users.api"

export async function sendInviteController(
  request: FastifyRequest<{ Params: { friendLogin: string } }>,
  reply: FastifyReply
)
{
  try {
    const service = new FriendsService(request.server);
    const userId = request.cookies.userId; // ou extraire depuis JWT
    if (!userId || typeof userId !== 'string') {
      // Mauvaise requête si pas d'userId
      return reply.code(400).send({ success: false, message: 'Missing or invalid userId cookie' });
    }
    const friendLogin = request.params.friendLogin;
    if (!friendLogin)
      return reply.code(400).send({ success: false, message: "Missing friendLogin parameter" });

    // Crée le client HTTP vers le service User
    // Ici je dois appele la BDD User afin de trouver l'id correspondant au login envoye
    const userServiceUrl = process.env.USER_SERVICE_URL;
    if (!userServiceUrl)
      throw new Error("USER_SERVICE_URL environment variable is not defined");

    const userApi = new UsersApi(userServiceUrl);

    const friendUser = await userApi.getUserByLogin(friendLogin);
    if (!friendUser)
      return reply.status(404).send({success: false, message: "Friend not found"});

    // Une fois le user recupere je peux envoye l'invitation
    // Crée l'invitation via le service Friends
    const friendsService = new FriendsService(request.server);
    const invite = await friendsService.sendInvitation(userId, friendUser.id);
    
    return reply.send({ success: true, data: invite });
  } catch (err: any) 
  {
    console.error(err);
    return reply.status(400).send({ success: false, message: err.message });
  }
}

export async function acceptInviteController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
)
{
  try {
    const service = new FriendsService(request.server);
    const updated = await service.acceptInvitation(Number(request.params.id));
    return reply.send({ success: true, data: updated });
  } catch (err: any) {
    console.error(err);
    return reply.status(400).send({ success: false, message: err.message });
  }
}

export async function declineInviteController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
)
{
  try {
    const service = new FriendsService(request.server);
    const updated = await service.declineInvitation(Number(request.params.id));
    return reply.send({ success: true, data: updated });
  } catch (err: any) {
    console.error(err);
    return reply.status(400).send({ success: false, message: err.message });
  }
}

export async function blockUserController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
)
{
  try {
    const service = new FriendsService(request.server);
    const updated = await service.blockUser(Number(request.params.id));
    return reply.send({ success: true, data: updated });
  } catch (err: any) {
    console.error(err);
    return reply.status(400).send({ success: false, message: err.message });
  }
}

export async function removeFriendController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
)
{
  try {
    const service = new FriendsService(request.server);
    const deleted = await service.removeFriend(Number(request.params.id));
    return reply.send({ success: true, data: deleted });
  } catch (err: any) {
    console.error(err);
    return reply.status(400).send({ success: false, message: err.message });
  }
}

export async function listInvitationsController(
  request: FastifyRequest,
  reply: FastifyReply
)
{
  try {
    // Validation basique du cookie
    const userId = request.cookies?.userId;
    if (!userId || typeof userId !== 'string') {
      // Mauvaise requête si pas d'userId
      return reply.code(400).send({ success: false, message: 'Missing or invalid userId cookie' });
    }

    // Idéalement FriendsService est accessible via request.server.di ou fastify.decorate
    const service = new FriendsService(request.server);
    const { received, sent } = await service.listInvitations(userId);
    const datas = [
      ...sent.filter(inv => inv.status === "PENDING").map(inv => inv.toUserId),
      ...received.filter(inv => inv.status === "PENDING").map(inv => inv.toUserId),
    ]
    return reply.code(200).send({ success: true, datas });
  } catch (err: unknown) {
    // Log plus sûr côté serveur
    console.error('listInvitationsController error:', err);

    // Ne pas exposer err.message directement au client
    return reply.code(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function listFriendsController(
  request: FastifyRequest,
  reply: FastifyReply
)
{
  try {
    const service = new FriendsService(request.server);
    const userId = request.cookies.userId;
    if (!userId || typeof userId !== 'string') {
      // Mauvaise requête si pas d'userId
      return reply.code(400).send({ success: false, message: 'Missing or invalid userId cookie' });
    }
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
