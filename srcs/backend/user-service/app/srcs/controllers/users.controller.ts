/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.controller.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 11:19:58 by tissad            #+#    #+#             */
/*   Updated: 2025/08/05 15:43:44 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// this file receives the request from the frontend and call userservice 
// to handle the request response
import { FastifyReply, FastifyRequest } from 'fastify'
import { UserService } from '../services/users.service'

export async function signupController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const signupInfo = request.body as {
    username: string
    password: string
    email: string
  }
  try {
    const userService = new UserService(request.server.db)

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await userService.getByUsername(signupInfo.username)
    const existingEmail = await userService.getByEmail(signupInfo.email)

    if (existingUser || existingEmail) {
      return reply.code(409).send({ message: 'Username or email already exists' })
    }

    const result = await userService.signup(signupInfo)

    console.log(`User created: ${result.data.username} with ID: ${result.id}`)
    return reply.code(201).send(result)
  } catch (error) {
    request.log.error('Error during signup:', error)
    return reply.code(500).send({ message: 'Internal Server Error' })
  }
}

/* ************************************************************************** */