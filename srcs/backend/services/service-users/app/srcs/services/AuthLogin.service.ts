/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AuthLogin.service.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 11:38:09 by tissad            #+#    #+#             */
/*   Updated: 2025/10/23 14:56:02 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { SignupUserInput } from '../types/user.type'
import { SigninUserInput } from '../types/user.type'
import { SigninResponse } from '../types/user.type'
import { SignupResponse } from '../types/user.type'
import { Pool } from 'pg'
//in the next ligne import jwt
import jwt from 'jsonwebtoken'


export class UserService {
  constructor(private db: Pool) {}

  
  // signup method to create a new user (insert into db) and return user data if successful
  async signup(signupInfo: SignupUserInput): Promise<{ data: SignupResponse }> {
    console.log(`Signup for: ${signupInfo.username}, ${signupInfo.email}`)
    const result = await this.db.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id`,
      [signupInfo.username, signupInfo.email, signupInfo.password]
    )
    if (result.rows.length === 0) {
      console.log('User creation failed')
        return { data: { message: 'User creation failed', id: -1, username: '', email: '' }}
    }
    else 
    {
      const id = result.rows[0].id
      console.log(`Creating user: ${signupInfo.username}`)
      return {
        data: {
          message: 'User signed up successfully',
          id: id, 
          username: signupInfo.username,
          email: signupInfo.email,
        }
      }
    }
  }
  


  
  // signin method to verify user credentials (query to db) and return user data if valid
  async signin(SigninInfo: SigninUserInput): Promise<{ data: SigninResponse }> {
    console.log(`Signin for: ${SigninInfo.username}`)
    const result = await this.db.query(
      `SELECT * FROM users WHERE username = $1 AND password = $2`,
      [SigninInfo.username, SigninInfo.password]
    )
    if (result.rows.length > 0) {
      // generate an acss token (JWT) and refresh token (JWT)
      const accessToken = jwt.sign(
        { userId: result.rows[0].id, username: result.rows[0].username },
        'your_access_token_secret',
        { expiresIn: '15m' }
      )
      const refreshToken = jwt.sign(
        { userId: result.rows[0].id, username: result.rows[0].username },
        'your_refresh_token_secret', 
        { expiresIn: '7d' }
      )
      // You might want to store the refresh token in the database or a secure cookie
      console.log(`User found: ${result.rows[0].username}`)
      return {
        data: {
          message: 'User signed in successfully',
          id: result.rows[0].id,
          username: result.rows[0].username,
          accessToken: accessToken,
          refreshToken: refreshToken  
        }
      }
    } else {
      console.log('Invalid credentials')
      return {  
        data: {
          message: 'Invalid username or password',
          id: -1,
          username: '',
          accessToken: '',
          refreshToken: ''
        }
      }
    }
  }
  
  
  async getAllUsers() {
    const result = await this.db.query('SELECT * FROM users')
    return result.rows
  }

  async getUserById(id: number) {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id])
    return result.rows[0]
  }

  async getByEmail(email: string) {
    const result = await this.db.query('SELECT * FROM users WHERE email = $1', [email])
    return result.rows[0]
  }

  async getByUsername(username: string) {
    const result = await this.db.query('SELECT * FROM users WHERE username = $1', [username])
    return result.rows[0]
  }
}