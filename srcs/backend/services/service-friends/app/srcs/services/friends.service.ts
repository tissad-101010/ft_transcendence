/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.service.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:54:11 by tissad            #+#    #+#             */
/*   Updated: 2025/12/16 15:12:49 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// IMPORT FASTIFY
import { FastifyInstance } from "fastify";
import { prisma } from "../models/friends.model";

import { invitationFriend, UserInfo } from "../types/friends.type";

// IMPORT FRIENDS.ERROR
import {
  DataBaseConnectionError,
  InvitationError,
  UserNotFoundError
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
    result: invitationFriend[]
  }> 
  {
    const result : invitationFriend[] = await safePrisma(() =>
      this.prismaClient.friendInvitation.findMany({
        where: { 
          OR: [
            { toUserId: userId },
            { fromUserId: userId }
          ]
        },
        select: { toUserUsername: true, fromUserUsername: true, status: true, createdAt: true, responsedAt: true }
      })
    );
    // SUCCESS
    return { result };
  }

  async removeInvitation(
    fromUser: string,
    toUser: string
  ) : Promise<{count: number}>
  {
    if (!fromUser || !toUser)
      throw new InvitationError("Invalid parameter");
    return (await safePrisma(() => 
      this.prismaClient.friendInvitation.deleteMany({
          where: {
            OR: [
              {fromUserUsername: fromUser, toUserUsername: toUser},
              {fromUserUsername: toUser, toUserUsername: fromUser}
            ]
          }
      })
    ))
  }

  async sendInvitation(
    fromUserId        : string,
    toUserUsername    : string
  ) : Promise<invitationFriend> 
  {
    // GET "FROM USER" FROM BDD
    const user = await getUserById(fromUserId);
    if (!user) throw new UserNotFoundError(fromUserId);
    // INVITE HIMSELF ?
    if (user.username === toUserUsername) throw new InvitationError("You can't invite yourself");
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
    if (existing) throw new InvitationError("Invitation already exists");
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
  ) : Promise<invitationFriend> 
  {
    const invitation : invitationFriend = await safePrisma(() => 
      this.prismaClient.friendInvitation.findFirst({
        where: {
          OR: [
            { fromUserUsername: user1, toUserUsername: user2 },
            { fromUserUsername: user2, toUserUsername: user1 },
          ],
          status: "PENDING"
        }
      })
    );
    if (!invitation)
      throw new InvitationError("Invitation not found");
    
    return (await safePrisma(() =>
      this.prismaClient.friendInvitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED", responsedAt: new Date() },
      })
    ));
  }

  async blockInvitation(
    user1: string,
    user2: string
  ) : Promise<invitationFriend> 
  {
    const invitation : invitationFriend = await safePrisma(() => 
      this.prismaClient.friendInvitation.findFirst({
        where: {
          AND: [
            {
              OR: [
                { fromUserUsername: user1, toUserUsername: user2 },
                { fromUserUsername: user2, toUserUsername: user1 },
              ],
            },
            {
              OR: [
                { status: "PENDING" },
                { status: "ACCEPTED" },
              ],
            },
          ],
        },
      })
    );
    if (!invitation)
      throw new InvitationError("Invitation not found");
    return (await safePrisma(() =>
      this.prismaClient.friendInvitation.update({
        where: { id: invitation.id },
        data: { status: "BLOCKED", responsedAt: new Date() },
      })
    ));
  }

  async declineInvitation(
    id: number
  ) : Promise<invitationFriend> 
  {
    return this.prismaClient.friendInvitation.update({
      where: { id },
      data: { status: "DECLINED" },
    });
  }

  async blockUser(
    id: number
  ) : Promise<invitationFriend> 
  {
    return this.prismaClient.friendInvitation.update({
      where: { id },
      data: { status: "BLOCKED" },
    });
  }

  async removeFriend(
    id: number
  ) : Promise<invitationFriend>
  {
    return this.prismaClient.friendInvitation.delete({ where: { id } });
  }
}
