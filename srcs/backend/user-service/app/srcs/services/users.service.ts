/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 11:38:09 by tissad            #+#    #+#             */
/*   Updated: 2025/08/05 15:43:10 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { SignupUserInput } from '../types/user.type'
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