/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   redis.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/09/16 11:29:10 by tissad            #+#    #+#             */
/*   Updated: 2025/10/07 15:36:37 by tissad           ###   ########.fr       */
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



  fastify.addHook("onReady", async () => {
    await fastify.testRedisConnection();
  });
});

export default redisPlugin;






/* ************************************************************************** */