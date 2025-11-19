/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.service.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:54:11 by tissad            #+#    #+#             */
/*   Updated: 2025/11/19 18:55:11 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// friends.services.ts
import { FastifyInstance } from "fastify";
import { prisma } from "../models/friends.model";
import axios from "axios";

export class FriendsService {
  private prismaClient: typeof prisma;
  private userServiceUrl: string;


  // Demander pour userServiceUrl si c'est nginx qui gère ou si c'est en brut dans le code
  constructor(app: FastifyInstance) {
    this.prismaClient = app.prisma;
    this.userServiceUrl = "http://service-user:4000"; // url du service-user
  }

  async getAllUsers() {
    const res = await axios.get(`${this.userServiceUrl}/users`);
    return res.data;
  }

  async sendInvitation(fromUserId: string, toUserId: string) {
    const existing = await this.prismaClient.friendInvitation.findUnique({
      where: { fromUserId_toUserId: { fromUserId, toUserId } },
    });
    if (existing) throw new Error("Invitation already exists");

    return this.prismaClient.friendInvitation.create({
      data: { fromUserId, toUserId, status: "PENDING" },
    });
  }

  async acceptInvitation(id: number) {
    return this.prismaClient.friendInvitation.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });
  }

  async declineInvitation(id: number) {
    return this.prismaClient.friendInvitation.update({
      where: { id },
      data: { status: "DECLINED" },
    });
  }

  async blockUser(id: number) {
    return this.prismaClient.friendInvitation.update({
      where: { id },
      data: { status: "BLOCKED" },
    });
  }

  async removeFriend(id: number) {
    return this.prismaClient.friendInvitation.delete({ where: { id } });
  }

  async listInvitations(userId: string) {
    const received = await this.prismaClient.friendInvitation.findMany({
      where: { toUserId: userId, status: "PENDING" },
    });
    const sent = await this.prismaClient.friendInvitation.findMany({
      where: { fromUserId: userId, status: "PENDING" },
    });
    return { received, sent };
  }
}
