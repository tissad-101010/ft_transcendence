/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.routes.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:55:45 by tissad            #+#    #+#             */
/*   Updated: 2025/11/21 09:31:20 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// friends.routes.ts
import { FastifyInstance } from "fastify";
import * as controller from "../controllers/friends.controller";

export async function friendsRoutes(
  server: FastifyInstance
) : Promise<void>
{
  server.get("/invitations", controller.listInvitationsController);
  server.post("/invite", controller.sendInviteController);
  server.post("/invite/accept", controller.acceptInviteController);
  server.post("/invite/decline", controller.declineInviteController);
  server.post("/invite/block", controller.blockUserController);
  server.delete("/remove", controller.removeFriendController);
}



