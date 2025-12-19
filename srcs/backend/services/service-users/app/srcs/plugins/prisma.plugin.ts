/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   prisma.plugin.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/24 10:31:21 by tissad            #+#    #+#             */
/*   Updated: 2025/12/12 16:53:46 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import fp from "fastify-plugin";
import { PrismaClient } from "../prisma/prisma/generated/client/client";//add file client.ts 

let prisma: PrismaClient | null = null;


const prismaPlugin = fp(async (fastify) => {
  if (!prisma) {
    // console.log("➡️ Initializing Prisma Client...");
    try {
        prisma = new PrismaClient();
        await prisma.$connect();
        // console.log("✅ Prisma Client connected successfully"); 
    } catch (error) {
        
        console.error("❌ Error connecting Prisma Client:", error);
        throw error; 
    }
  } else {
    console.log("⚠️ Prisma Client already initialized, reusing instance");
  }

  fastify.decorate("prisma", prisma);

  fastify.addHook("onClose", async () => {
    await prisma?.$disconnect();
  });
});

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export { prismaPlugin };