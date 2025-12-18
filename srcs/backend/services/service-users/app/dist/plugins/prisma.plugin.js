"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaPlugin = void 0;
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const client_1 = require("../prisma/prisma/generated/client/client"); //add file client.ts 
let prisma = null;
const prismaPlugin = (0, fastify_plugin_1.default)(async (fastify) => {
    if (!prisma) {
        console.log("➡️ Initializing Prisma Client...");
        try {
            prisma = new client_1.PrismaClient();
            await prisma.$connect();
            console.log("✅ Prisma Client connected successfully");
        }
        catch (error) {
            console.error("❌ Error connecting Prisma Client:", error);
            throw error;
        }
    }
    else {
        console.log("⚠️ Prisma Client already initialized, reusing instance");
    }
    fastify.decorate("prisma", prisma);
    fastify.addHook("onClose", async () => {
        await prisma?.$disconnect();
    });
});
exports.prismaPlugin = prismaPlugin;
