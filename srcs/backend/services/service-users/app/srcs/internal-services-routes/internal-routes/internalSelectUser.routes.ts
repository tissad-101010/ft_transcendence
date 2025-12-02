/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   internalSelectUser.routes.ts                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/22 01:44:54 by glions            #+#    #+#             */
/*   Updated: 2025/12/01 11:52:14 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from "fastify";
import { internalSelectUserController } from "../internal-controllers/internalSelectUser.controllers";

export async function internalSelectUserRoutes(app: FastifyInstance)
{
    app.get('/user', internalSelectUserController);
};
