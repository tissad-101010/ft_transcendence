/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.routes.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 09:59:20 by tissad            #+#    #+#             */
/*   Updated: 2025/07/25 15:29:28 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from 'fastify';
import { signupController } from '../controllers/users.controller';
import { SignupUserInput } from '../types/user.type';
export async function userRoutes(server: FastifyInstance)
{
    // Register the POST route for user signup
    server.post<{ Body: SignupUserInput }>('/signup', signupController);
}