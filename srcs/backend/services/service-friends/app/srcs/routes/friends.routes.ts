/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.routes.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 18:55:45 by tissad            #+#    #+#             */
/*   Updated: 2025/11/19 18:46:03 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// friends.routes.ts
import { FastifyInstance } from "fastify";
import * as controller from "../controllers/friends.controller";

export async function friendsRoutes(server: FastifyInstance) {
  server.get("/users", controller.getAllUsersController);
  server.get("/invitations/:userId", controller.listInvitationsController);
  server.post("/invite", controller.sendInviteController);
  server.post("/invite/:id/accept", controller.acceptInviteController);
  server.post("/invite/:id/decline", controller.declineInviteController);
  server.post("/invite/:id/block", controller.blockUserController);
  server.delete("/invite/:id", controller.removeFriendController);
}



