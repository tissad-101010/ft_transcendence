/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.model.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 11:32:05 by tissad            #+#    #+#             */
/*   Updated: 2025/11/19 17:01:05 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export type FriendInvitation = {
    id: number;
    forUserId: string;
    toUserId: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED";
    createdAt: Date;
};
