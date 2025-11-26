/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.type.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 15:14:54 by tissad            #+#    #+#             */
/*   Updated: 2025/11/26 18:04:46 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export type UserInfo = {
    id: string;
    username: string;
    lastLogin: Date;
    avatarUrl: string;
    createdAt: string;
}

export type invitationFriend = {
    id: number;
    fromUserId: string;
    fromUserUsername: string;
    toUserId: string;
    toUserUsername: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED";
    createdAt: Date;
    responsedAt?: Date;
};