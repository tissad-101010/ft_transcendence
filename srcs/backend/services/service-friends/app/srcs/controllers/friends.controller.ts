/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.controller.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 19:00:31 by tissad            #+#    #+#             */
/*   Updated: 2025/12/16 15:13:41 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// FASTIFY
import { FastifyReply, FastifyRequest } from "fastify";

// SERVICE
import { FriendsService } from "../services/friends.service";

// TOKEN UTILS
import {
  verifyToken,
} from "./remote/clients/verifyToken";
import { AuthError, handleError } from "../errors/friends.error";

async function getToken(request: FastifyRequest)
{
  const accessToken = request.cookies["access_token"];
  if (!accessToken) {
    console.error("Aucun token présent dans les cookies");
    throw new AuthError("Token manquant");
  }
  const tokenResponse = await verifyToken(accessToken);
  if (!tokenResponse || !tokenResponse.success || !tokenResponse.data) {
    console.error("Token invalide ou expiré :", tokenResponse);
    throw new AuthError("Token invalide ou expiré");
  }
  return (tokenResponse.data.id);
}

export async function removeFriendController(
  request: FastifyRequest<{ Params: { fromUser: string, toUser: string } }>,
  reply: FastifyReply
) : Promise<{success: boolean, message: string}>
{
  try {
    // CHECK TOKEN //
    await getToken(request);
    // VERIF PARAMS //
    const {fromUser, toUser} = request.params;
    if (!fromUser || !toUser)
      return (reply.code(400).send({success: false, message: "Invalid parameter"}));
    // CALL SERVICE //
    const service = new FriendsService(request.server);
    const deleted = await service.removeInvitation(fromUser, toUser);
    if (deleted.count === 1)
      // SUCCESS //
      return reply.code(200).send({ success: true, message: "Invitation removed"});
    else if (deleted.count === 0)
      // ERROR //
      return (reply.code(404).send({success: false, message: "Invitation doesn't exist"}));
    else
      // BIG ERROR //
      return (reply.code(500).send({success: false, message: `${deleted.count} invitations deleted, serious problem`}));
  } catch (err: any) {
    return (handleError(reply, err));
  }
}

export async function listInvitationsController(
  request: FastifyRequest,
  reply: FastifyReply
)
{
  try {
    // CHECK TOKEN //
    const userId = await getToken(request);
    // CALL SERVICE //
    const service             = new FriendsService(request.server);
    const { result }  = await service.listInvitations(userId);
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
   // CHECK TOKEN //
    const userId = await getToken(request);
    // CALL SERVICE USER //
    const { friendUsername }  = request.body;
    if (!friendUsername)
      return (reply.code(400).send({sucess: false, message: "Parameter username is missing"}));
    // CALL SERVICE //
    const service             = new FriendsService(request.server);
    const data                = await service.sendInvitation(userId, friendUsername,);
    // SUCCESS //
    return (reply.code(200).send({success: true, data: data}));
  // ERRORS //
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
    // CHECK TOKEN //
    await getToken(request);
    // VERIF PARAMS //
    const {user1, user2} = request.body;
    if (!user1 || !user2) 
      return (reply.code(400).send({success: false, message: "Invalid parameters"}))
    const service = new FriendsService(request.server);
    const response = await service.acceptInvitation(user1, user2);
    // SUCCESS //
    return (reply.code(200).send({success: true, message: "Invitation accepted"}));
  } catch (err: any)
  {
    console.error("/!\\ ACCEPT INVITE CONTROLLER ERROR /!\\");
    return (handleError(reply, err));
  }
}

export async function blockUserController(
  request: FastifyRequest<{ Body: { user1: string, user2: string } }>,
  reply: FastifyReply
)
{
  try {
    // CHECK TOKEN //
    await getToken(request);
    // VERIF PARAMS
    const {user1, user2} = request.body;
    if (!user1 || !user2) 
      return (reply.code(400).send({success: false, message: "Invalid parameters"}));
    // CALL SERVICE //
    const service = new FriendsService(request.server);
    const response = await service.blockInvitation(user1, user2);
    // SUCCESS //
    return (reply.code(200).send({success: true, message: "Invitation accepted"}));
  } catch (err: any)
  {
    console.error(err);
    return (handleError(reply, err));
  }
}

export async function declineInviteController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
)
{
  try {
    // CHECK TOKEN //
    await getToken(request);
    // VERIF PARAMS //
    const { id } = request.params;
    if (!id)
      return (reply.code(400).send({success: false, message: "Invalid parameters"}));
    // CALL SERVICE //
    const service = new FriendsService(request.server);
    const updated = await service.declineInvitation(Number(id));
    return reply.send({ success: true, data: updated });
  } catch (err: any) {
    console.error(err);
    return (handleError(reply, err));
  }
}
