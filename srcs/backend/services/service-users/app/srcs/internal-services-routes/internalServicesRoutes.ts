/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   internalServicesRoutes.ts                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 12:20:39 by tissad            #+#    #+#             */
/*   Updated: 2025/11/21 16:49:29 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";

export  async function internalServicesRoutes(app: FastifyInstance) {
  // Vérification pour toutes les routes internes
  app.addHook("onRequest", async (req, reply) => {
    const internalKey = req.headers["x-internal-key"];

    if (!internalKey || internalKey !== process.env.INTERNAL_API_KEY) {
      return reply.status(401).send({ error: "Unauthorized internal access" });
    }
  });
  
}
