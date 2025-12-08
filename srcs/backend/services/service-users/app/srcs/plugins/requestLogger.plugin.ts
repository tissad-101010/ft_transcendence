/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   requestLogger.plugin.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/12/08 14:39:54 by tissad            #+#    #+#             */
/*   Updated: 2025/12/08 17:01:31 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";

const requestLoggerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", async (req) => {
    fastify.log.info({
      origin: req.headers.origin,
      method: req.method,
      url: req.url,
      headers: req.headers
    }, "Incoming Request");
    if (req.method === "POST" || req.method === "PUT") {
      fastify.log.info({
        body: req.body
      }, "Request Body");
    }
    if (req.method === "GET") {
      fastify.log.info({
        query: req.query
      }, "Request Query Parameters");
    }
  });
};

export default fp(requestLoggerPlugin);
