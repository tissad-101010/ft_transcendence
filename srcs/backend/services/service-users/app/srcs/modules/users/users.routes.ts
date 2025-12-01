/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.routes.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 15:27:31 by glions            #+#    #+#             */
/*   Updated: 2025/11/26 17:00:43 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/***********************************/
/*        Auth Routes Setup        */
/***********************************/
import { FastifyInstance } from 'fastify';

import * as controller from "./users.controllers";


// user routes
export async function infoFriendRoute(server: FastifyInstance)
{
    server.get('/infoFriend', controller.getInfoFriendController);
}