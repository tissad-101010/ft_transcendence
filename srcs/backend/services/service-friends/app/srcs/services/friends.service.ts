/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.service.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:54:11 by tissad            #+#    #+#             */
/*   Updated: 2025/11/20 16:44:41 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// friends.services.ts
import { FastifyInstance } from "fastify";
import { FriendInvitation, prisma } from "../models/friends.model";
import axios from "axios";

export class FriendsService {
  private prismaClient: typeof prisma;


  constructor(app: FastifyInstance) {
    this.prismaClient = app.prisma;
  }

  async sendInvitation(
    fromUserId: string,
    toUserId: string
  ) : Promise<FriendInvitation> 
  {
    const existing = await this.prismaClient.friendInvitation.findUnique({
      where: { fromUserId_toUserId: { fromUserId, toUserId } },
    });
    if (existing) throw new Error("Invitation already exists");

    return this.prismaClient.friendInvitation.create({
      data: { fromUserId, toUserId, status: "PENDING" },
    });
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
