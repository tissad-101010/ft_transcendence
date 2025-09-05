/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 11:38:09 by tissad            #+#    #+#             */
/*   Updated: 2025/09/05 14:42:03 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { SignupUserInput } from '../types/user.type'
import { SigninUserInput } from '../types/user.type'
import { Pool } from 'pg'

export class UserService {
  constructor(private db: Pool) {}

  async signup(signupInfo: SignupUserInput): Promise<{ message: string; id: number; data: SignupUserInput }> {
    console.log(`Signup for: ${signupInfo.username}, ${signupInfo.email}`)
    const result = await this.db.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id`,
      [signupInfo.username, signupInfo.email, signupInfo.password]
    )
    const id = result.rows[0].id
    console.log(`Creating user: ${signupInfo.username}`)

    return {
      message: 'User created successfully',
      id,
      data: signupInfo
    }
  }
  
  // signin method to verify user credentials (query to db) and return user data if valid
  async signin(SigninInfo: SigninUserInput): Promise<{ message: string; data: SigninUserInput | null }> {
    console.log(`Signin for: ${SigninInfo.username}`)
    const result = await this.db.query(
      `SELECT * FROM users WHERE username = $1 AND password = $2`,
      [SigninInfo.username, SigninInfo.password]
    )
    if (result.rows.length > 0) {
      console.log(`User found: ${result.rows[0].username}`)
      return {
        message: 'User signed in successfully',
        data: SigninInfo
      }
    } else {
      console.log('Invalid credentials')
      return {  
        message: 'Invalid username or password',
        data: null
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





// export async function signupUser(signupInfo: SignupUserInput): Promise<{ message: string; data: SignupUserInput }> {
//     const { username, password, email} = signupInfo;
//     // Log the received data
//     console.log(`Signup for: ${username}, ${password}`);
//     // Here you would typically handle the signup logic, such as saving the user to a database
//     // For now, we will just return a success message

//     return {
//         message: 'User signed up successfully',
//         data: signupInfo,
//     };
// }