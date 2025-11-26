/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.service.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:54:11 by tissad            #+#    #+#             */
/*   Updated: 2025/11/26 12:56:36 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// IMPORT FASTIFY
import { FastifyInstance } from "fastify";
import { prisma } from "../models/friends.model";

import { FriendInvitation, UserInfo } from "../types/friends.type";

// IMPORT AXIOS
import axios from "axios";

// IMPORT FRIENDS.ERROR
import {
  DataBaseConnectionError,
  InvitationError,
  AuthError,
  UserNotFoundError,
  RemoteServiceUnavailableError
} from "../errors/friends.error";

import { getUserById, getUserByUsername } from "../controllers/remote/clients/remoteGetUser.controller";


async function safePrisma<T>(fn: () => Promise<T>) : Promise<T>
{
  try
  {
    return await fn();
  } catch (err: any)
  {
    if (err.code === "P1001" || err.code === "P1002")
      throw new DataBaseConnectionError();
    throw err;
  }
}


// CLASS FRIENDSSERVICE
export class FriendsService {
  // PROPS
  private prismaClient: typeof prisma;
  // CONSTRUCTOR
  constructor(app: FastifyInstance) {
    this.prismaClient = app.prisma;
  }

  // ASYNC METHODS
  async listInvitations(
    userId: string
  ) : Promise<{
    received: FriendInvitation[],
    sent: FriendInvitation[]
  }> 
  {
    const received : FriendInvitation[] = await safePrisma(() =>
      this.prismaClient.friendInvitation.findMany({
        where: { toUserId: userId, status: "PENDING" },
        select: { toUserUsername: true, fromUserUsername: true, status: true, createdAt: true}
      })
    );
    const sent : FriendInvitation[] = await safePrisma(() =>
      this.prismaClient.friendInvitation.findMany({
        where: { fromUserId: userId, status: "PENDING" },
        select: { toUserUsername: true, fromUserUsername: true, status: true, createdAt: true}
      })
    );
    // SUCCESS
    return { received, sent };
  }

  async sendInvitation(
    fromUserId        : string,
    toUserUsername    : string
  ) : Promise<FriendInvitation> 
  {
    // GET "FROM USER" FROM BDD
    const user = await getUserById(fromUserId);
    if (!user) throw new UserNotFoundError(fromUserId);
    // INVITE HIMSELF ?
    if (user.username === toUserUsername) throw new InvitationError("Tu ne peux pas t'inviter toi-même");
    // SEARCH "TO USER" FROM BDD
    const other : UserInfo = await getUserByUsername(toUserUsername);
    if (!other) throw new UserNotFoundError(toUserUsername);
    // INVITATION ALREADY ON BDD ?
    const existing = await safePrisma(() => 
      this.prismaClient.friendInvitation.findFirst({
        where: {
          OR: [
            { fromUserId, toUserId: other.id },
            { fromUserId: other.id, toUserId: fromUserId }
          ]
        }
      })
    );
    if (existing) throw new InvitationError("Invitation déjà existante");
    // ADD INVITATION ON BDD
    return (await safePrisma(() => 
      this.prismaClient.friendInvitation.create({
        data: {
          fromUserId,
          toUserId: other.id,
          fromUserUsername: user.username,
          toUserUsername,
          status: "PENDING" 
        },
      })
    ));
  }

  async acceptInvitation(
    user1: string,
    user2: string
  ) : Promise<FriendInvitation> 
  {
    return (await safePrisma(() =>
      this.prismaClient.friendInvitation.update({
        where: {  
          OR: [
            { fromUserUsername: user1, toUserUsername: user2 },
            { fromUserUsername: user2, toUserUsername: user1 },
          ]
        },
        data: { status: "ACCEPTED" },
      })
    ));
  }

  async declineInvitation(
    id: number
  ) : Promise<FriendInvitation> 
  {
    return this.prismaClient.friendInvitation.update({
      where: { id },
      data: { status: "DECLINED" },
    });
  }

  async blockUser(
    id: number
  ) : Promise<FriendInvitation> 
  {
    return this.prismaClient.friendInvitation.update({
      where: { id },
      data: { status: "BLOCKED" },
    });
  }

  async removeFriend(
    id: number
  ) : Promise<FriendInvitation>
  {
    return this.prismaClient.friendInvitation.delete({ where: { id } });
  }
}
