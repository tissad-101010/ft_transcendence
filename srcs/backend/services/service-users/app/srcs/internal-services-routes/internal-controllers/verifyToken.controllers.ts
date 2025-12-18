/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   verifyToken.controllers.ts                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 14:29:49 by tissad            #+#    #+#             */
/*   Updated: 2025/12/16 14:03:50 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// srcs/<...>/controllers/verifyToken.controller.ts
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { internalVerifyTokenService } from "../internal-services/internalVerifyToken.service";

type VerifyTokenBody = {
  token: string;
};

export async function verifyTokenController(
  req: FastifyRequest<{ Body: VerifyTokenBody }>,
  reply: FastifyReply
) {
  console.log("--------------------- VERIFIY TOKEN APPELEE");
  const { token } = req.body;
  try {
    const result = await internalVerifyTokenService(token);
    if (!result) {
      console.log("JE SORS ICI 1");
      return reply.status(401).send({ success: false, data:null });
    }
      console.log("JE SORS ICI 2");
    return reply.send({success:true, data: result});
  } catch (err) {
      console.log("JE SORS ICI 3");
    return reply.status(401).send({ error: "Invalid token" });
  }
}
