/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AuthLogin.routes.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 09:59:20 by tissad            #+#    #+#             */
/*   Updated: 2025/10/21 13:51:33 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { FastifyInstance } from 'fastify';
import { signupController } from '../controllers/AuthLogin.controller';
import { signinController } from '../controllers/AuthLogin.controller';
import { SignupUserInput } from '../types/user.type';
import { SigninUserInput } from '../types/user.type';

export async function userRoutes(server: FastifyInstance)
{
    // Register the POST route for user signup
    server.post<{ Body: SignupUserInput }>('/signup', signupController);
    server.post<{ Body: SigninUserInput }>('/signin', signinController);
}

// Note: Les routes OTP sont définies dans otp.routes.ts