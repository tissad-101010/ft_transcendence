"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const requestLoggerPlugin = async (fastify) => {
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
exports.default = (0, fastify_plugin_1.default)(requestLoggerPlugin);
