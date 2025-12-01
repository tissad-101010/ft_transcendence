/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   verifyToken.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/25 09:41:41 by glions            #+#    #+#             */
/*   Updated: 2025/11/25 09:42:27 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyReply } from "fastify";

// UTILS FOR USER-SERVICE
import {
  usersClient,
  serviceUsersURL
} from "./usersClient";


export function sendErrorToken(reply: FastifyReply)
{
  return (reply.code(401).send({success: false, message: "Et beh t'as rien à faire là mon con !"}));
}

export async function verifyToken(token: string) {
  const res = await usersClient.post(`${serviceUsersURL}/internal/verify-token`, { token });
  return (res.data);
}