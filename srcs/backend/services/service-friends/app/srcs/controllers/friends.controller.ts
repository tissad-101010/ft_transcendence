/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.controller.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 19:00:31 by tissad            #+#    #+#             */
/*   Updated: 2025/11/24 17:31:13 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyReply, FastifyRequest } from "fastify";
import { FriendsService } from "../services/friends.service";
import { FriendInvitation } from "../models/friends.model";

import { UsersApi } from "../users.api"

import axios from "axios";
import { DataBaseConnectionError, InvitationAlreadyExistsError, RemoteServiceUserUnavailableError, RemoteUserNotFoundError } from "../errors/friends.error";

type UserInfo = {
    id: string;
    username: string;
    lastLogin: Date;
    avatarUrl: string;
    createdAt: string;
}

export const usersClient = axios.create({
  baseURL: process.env.USER_SERVICE_URL,
  timeout: 1500,
  headers: { 'x-internal-key': process.env.INTERNAL_API_KEY }
});

const serviceUsersURL = 'http://service-users:4000'; 

function sendErrorToken(reply: FastifyReply)
{
  return (reply.code(401).send({success: false, message: "Et beh t'as rien à faire là mon con !"}));
}

export async function verifyToken(token: string) {
  const res = await usersClient.post(`${serviceUsersURL}/internal/verify-token`, { token });
  return (res.data);
}

export async function getUserById(id: string)
{
  // CALL USER SERVICE
  const res = await usersClient.get(`${serviceUsersURL}/internalUser/user?id=${id}`);
  const data = res.data;
  // ERRORS
  if (!data.success)
  {
    // USER NOT FOUND
    if (res.status === 404)
      throw new RemoteUserNotFoundError(id);
    // SERVICE USER ERROR
    if (res.status === 503)
      throw new RemoteServiceUserUnavailableError();
    // OTHER ERROR
    return (null);
  }
  // SUCCESS
  return (data.data);
}

export async function getUserByUsername(username: string)
{
  // CALL USER SERVICE
  const res = await usersClient.get(`${serviceUsersURL}/internalUser/user?username=${username}`);
  const data = res.data;
  // ERRORS
  if (!data.success)
  {
    // USER NOT FOUND
    if (res.status === 404)
      throw new RemoteUserNotFoundError(username);
    // SERVICE USER ERROR
    if (res.status === 503)
      throw new RemoteServiceUserUnavailableError();
    // OTHER ERROR
    return (null);
  }
  // SUCCESS
  return (data.data);
}

export async function listInvitationsController(
  request: FastifyRequest,
  reply: FastifyReply
)
{
  try {
    // CHECK TOKEN //
    const user = await verifyToken(request.cookies["access_token"]!);
    if (!user)
     return (sendErrorToken(reply));
    // CALL BDD //
    const service = new FriendsService(request.server);
    const { received, sent } = await service.listInvitations(user.id);
    // SORT RESULTS //
    const datas = [
      ...sent.filter(inv => inv.status === "PENDING").map(inv => inv.toUserId),
      ...received.filter(inv => inv.status === "PENDING").map(inv => inv.toUserId)
    ]
    // SUCCESS //
    return reply.code(200).send({ success: true, datas });
  } catch (err: unknown) {
    // ERROR //
    console.error('/!\\ LIST INVITATION CONTROLLER ERROR /!\\', err);
    return reply.code(500).send({ success: false, message: 'Internal server error' });
  }
}

export async function sendInviteController(
  request: FastifyRequest<{ Body: { friendUsername: string } }>,
  reply: FastifyReply
)
{
  try {
    // CHECK TOCKEN //
    const token = await verifyToken(request.cookies["access_token"]!);
    if (!token)
      return (sendErrorToken(reply));
    console.log(">>>>>>> USER", token);
    // CALL BDD USERS //
    const user: UserInfo = await getUserById(token.data.id);
    if (!user)
      return (reply.code(404).send({success:false, message: "You are not on BDD wtf"}));
    const { friendUsername } = request.body;
    if (!friendUsername)
      return (reply.code(400).send({sucess: false, message: "friendUsername is required"}));
    const other : UserInfo = await getUserByUsername(friendUsername);
    // CALL BDD //
    if (!other)
      return (reply.code(404).send({success: false, message: `${friendUsername} not exists on BDD`}));
    const service = new FriendsService(request.server);
    const data    = await service.sendInvitation(
                      user.id,
                      user.username,
                      other.id,
                      other.username
                    );
    // SUCCESS
    return (reply.code(200).send({success: true, data: data}));
  // ERRORS
  } catch (err: any)
  {
    console.error('/!\\ SEND INVITE CONTROLLER ERROR /!\\', err);
    // SERVICE USER -> USER NOT FOUND
    if (err instanceof RemoteUserNotFoundError)
      return (reply.code(404).send({success: false, message: err.message}));
    if (axios.isAxiosError(err) && err.response?.status === 404)
      return (reply.code(404).send({success: false, message: `User not found`}));
    // SERVICE USER -> UNAVAILABLE
    if (err instanceof RemoteServiceUserUnavailableError)
      return (reply.code(503).send({success: false, message: "User service unavailable"}));
    // DATABASE ERROR
    if (err instanceof DataBaseConnectionError)
      return (reply.code(503).send({success: false, message:"Database temporarily unavailable"}));
    // INVITATION ALREADY EXISTS ERROR
    if (err instanceof InvitationAlreadyExistsError)
      return (reply.code(409).send({success: false, message: "Invitation already exists"}));
    // OTHER ERROR
    return reply.code(500).send({success: false, message: 'Internal server error'});
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
