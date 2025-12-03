/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.controller.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 19:00:31 by tissad            #+#    #+#             */
/*   Updated: 2025/12/03 12:14:53 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// AXIOS
import axios from "axios";

// FASTIFY
import { FastifyReply, FastifyRequest } from "fastify";

// SERVICE
import { FriendsService } from "../services/friends.service";

// MODELS
import {
  UserInfo,
  invitationFriend
} from "../types/friends.type";

// GET USER FROM USER-SERVICE
import { 
  getUserById,
  getUserByUsername
} from "./remote/clients/remoteGetUser.controller";

// TOKEN UTILS
import {
  verifyToken,
  sendErrorToken
} from "./remote/clients/verifyToken";
import { AuthError, handleError } from "../errors/friends.error";


export async function removeFriendController(
  request: FastifyRequest<{ Params: { fromUser: string, toUser: string } }>,
  reply: FastifyReply
) : Promise<{success: boolean, message: string}>
{
  try {
    // CHECK TOKEN //
    const token               = await verifyToken(request.cookies["access_token"]!);
    if (!token) throw new AuthError();
    // VERIF PARAMS //
    const {fromUser, toUser} = request.params;
    if (!fromUser || !toUser)
      return (reply.code(400).send({success: false, message: "Parametre invalide"}));
    // CALL SERVICE //
    const service = new FriendsService(request.server);
    const deleted = await service.removeInvitation(fromUser, toUser);
    if (deleted.count === 1)
      return reply.code(200).send({ success: true, message: "Invitation supprimee"});
    else if (deleted.count === 0)
      return (reply.code(404).send({success: false, message: "L'invitation n'existe pas"}));
    else
      return (reply.code(500).send({success: false, message: `Houlalala tu viens de supprimer ${deleted.count} invitations`}));
  } catch (err: any) {
    console.error(err);
    return reply.code(400).send({ success: false, message: err.message });
  }
}

export async function listInvitationsController(
  request: FastifyRequest,
  reply: FastifyReply
)
{
  try {
    // CHECK TOKEN //
    const token               = await verifyToken(request.cookies["access_token"]!);
    if (!token) throw new AuthError();
    // CALL SERVICE //
    const service             = new FriendsService(request.server);
    const { result }  = await service.listInvitations(token.data.id);
    // SUCCESS //
    return reply.code(200).send({ success: true, data: result });
  } catch (err: unknown) {
    // ERRORS //
    console.error('/!\\ LIST INVITATION CONTROLLER ERROR /!\\', err);
    return (handleError(reply, err));
  }
}

export async function sendInviteController(
  request: FastifyRequest<{ Body: { friendUsername: string } }>,
  reply: FastifyReply
)
{
  try {
    // CHECK TOCKEN //
    const token               = await verifyToken(request.cookies["access_token"]!);
    if (!token) throw new AuthError();
    // CALL SERVICE USER //
    const { friendUsername }  = request.body;
    if (!friendUsername)
      return (reply.code(400).send({sucess: false, message: "Paramètre username manquant"}));
    // CALL SERVICE
    const service             = new FriendsService(request.server);
    const data                = await service.sendInvitation(token.data.id, friendUsername,);
    // SUCCESS
    return (reply.code(200).send({success: true, data: data}));
  // ERRORS
  } catch (err: any)
  {
    console.error('/!\\ SEND INVITE CONTROLLER ERROR /!\\', err);
    return (handleError(reply, err));
  }
}

export async function acceptInviteController(
  request: FastifyRequest<{ Body: { user1: string, user2: string } }>,
  reply: FastifyReply
)
{
  try {
    // CHECK TOCKEN //
    const token = await verifyToken(request.cookies["access_token"]!);
    if (!token) throw new AuthError();
    // VERIF PARAMS
    const {user1, user2} = request.body;
    if (!user1 || !user2) 
      return (reply.code(400).send({success: false, message: "Paramètres invalides"}))
    const service = new FriendsService(request.server);
    const response = await service.acceptInvitation(user1, user2);
    // SUCCESS
    return (reply.code(200).send({success: true, message: "Invitation acceptee"}));
  } catch (err: any)
  {
    console.error("/!\\ ACCEPT INVITE CONTROLLER ERROR /!\\");
    return (handleError(reply, err));
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


