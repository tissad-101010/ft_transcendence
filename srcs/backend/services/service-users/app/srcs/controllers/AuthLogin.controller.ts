/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AuthLogin.controller.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 11:19:58 by tissad            #+#    #+#             */
/*   Updated: 2025/10/24 16:47:10 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// this file receives the request from the frontend and call userservice 
// to handle the request response
import { FastifyReply, FastifyRequest } from 'fastify'
import { UserService } from '../services/AuthLogin.service'
// import the SignupUserInput and SigninUserInput types
import { SignupUserInput } from '../types/user.type'
import { SigninUserInput } from '../types/user.type'

export async function signupController(
  request: FastifyRequest,
  reply: FastifyReply
  
) {
  const signupInfo = request.body as SignupUserInput
  try {
    const userService = new UserService(request.server)
    console.log('====>Signup info received:', signupInfo)
    // Vérifie si l'utilisateur existe déjà
    const existingUser = await userService.getByUsername(signupInfo.username)
    console.log('====>Existing user check1111111111111111111111111:', existingUser)
    
    const existingEmail = await userService.getByEmail(signupInfo.email)
    console.log('====>Existing user check:', { existingUser, existingEmail })
    if (existingUser || existingEmail) {
      return reply.code(409).send({ message: 'Username or email already exists' })
    }
    console.log('====>No existing user found, proceeding to signup.')
    const result = await userService.signupUser(signupInfo) 

    console.log(`User created: ${result.username}`)
    return reply.code(201).send(result)
  } catch (error) {
    request.log.error('Error during signup:', undefined, error)
    return reply.code(500).send({ message: 'Internal Server Error' })
  }
}


// signin controller to handle signin requests  
export async function signinController(
  request: FastifyRequest,  
  reply: FastifyReply 
) { 
  const signinInfo = request.body as SigninUserInput
  try {
    const userService = new UserService(request.server)
    const result = await userService.signinUser(signinInfo)

    if (result) {
      console.log(`User signed in: ${result.username}`)
      return reply.code(200).send(result)
    } else {
      return reply.code(401).send({ message: 'Invalid username or password' })
    }
  } catch (error) {
    request.log.error('Error during signin:', undefined, error)
    return reply.code(500).send({ message: 'Internal Server Error' })
  }
}

/* ************************************************************************** */