/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   redis.plugin.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 11:29:10 by tissad            #+#    #+#             */
/*   Updated: 2025/11/04 11:17:14 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import fp from "fastify-plugin";
import fastifyRedis, { FastifyRedis } from "@fastify/redis";
import { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    redis: FastifyRedis;
    testRedisConnection: () => Promise<void>;
  }
}

const redisPlugin = fp(async (fastify: FastifyInstance) => {
  // Utilise la connexion via URL (standard redis://)
  await fastify.register(fastifyRedis, {
    host: "redis", // Nom du service Docker 
    port: 6379,
    // password: "password", // Décommentez si vous avez un mot de passe
    // url: "redis://:password@127.0.0.1:6379"  si auth
  });

  fastify.decorate("testRedisConnection", async () => {
    try {
      const result = await fastify.redis.ping();
      if (result === "PONG") {
        console.log("✅ Redis connection successful");
      } else {
        fastify.log.error("❌ Redis connection failed: Unexpected response");
      }
    } catch (err) {
      fastify.log.error(`❌ Redis connection failed: ${err}`);
      throw err;
    }
  });

  fastify.addHook("onReady", async () => {
    await fastify.testRedisConnection();
  });
});

export default redisPlugin;






/* ************************************************************************** */