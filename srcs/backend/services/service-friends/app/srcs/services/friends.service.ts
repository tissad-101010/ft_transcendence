/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.service.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:54:11 by tissad            #+#    #+#             */
/*   Updated: 2025/11/24 16:49:50 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// IMPORT FASTIFY
import { FastifyInstance } from "fastify";
import { FriendInvitation, prisma } from "../models/friends.model";

// IMPORT AXIOS
import axios from "axios";

// IMPORT FRIENDS.ERROR
import { DataBaseConnectionError, InvitationAlreadyExistsError } from "../errors/friends.error";

// CLASS FRIENDSSERVICE
export class FriendsService {
  // PROPS
  private prismaClient: typeof prisma;
  // CONSTRUCTOR
  constructor(app: FastifyInstance) {
    this.prismaClient = app.prisma;
  }
  // ASYNC METHODS
  async sendInvitation(
    fromUserId        : string,
    fromUserUsername  : string,
    toUserId          : string,
    toUserUsername    : string,
  ) : Promise<FriendInvitation> 
  {
    try
    {
      console.log(">> FROMUSERID = " + fromUserId);
      console.log(">> FROMUSERUSERNAME = " + fromUserUsername);
      console.log(">> TOUSERID = " + toUserId);
      console.log(">> TOUSERUSERNAME = " + toUserUsername);
      // ALREADY ON BDD ?
      const existing = await this.prismaClient.friendInvitation.findUnique({
        where: { fromUserId_toUserId: { fromUserId, toUserId } },
      });
      if (existing) throw new InvitationAlreadyExistsError();
      // CALL BDD
      return this.prismaClient.friendInvitation.create({
        data: { fromUserId, toUserId, fromUserUsername, toUserUsername, status: "PENDING" },
      });
    } catch (err: any)
    {
      // DATABASE ERROR
      if (err.code === "P1001" || err.code === "P1002")
        throw new DataBaseConnectionError();
      // OTHER ERROR
      throw err;
    }
  }

  async acceptInvitation(
    id: number
  ) : Promise<FriendInvitation> 
  {
    return this.prismaClient.friendInvitation.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });
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

  async listInvitations(
    userId: string
  ) : Promise<{
    received: FriendInvitation[],
    sent: FriendInvitation[]
  }> 
  {
    const received = await this.prismaClient.friendInvitation.findMany({
      where: { toUserId: userId, status: "PENDING" },
    });
    const sent = await this.prismaClient.friendInvitation.findMany({
      where: { fromUserId: userId, status: "PENDING" },
    });
    return { received, sent };
  }
  
}
