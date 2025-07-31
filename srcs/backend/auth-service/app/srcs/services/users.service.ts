/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.service.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 11:38:09 by tissad            #+#    #+#             */
/*   Updated: 2025/07/25 16:09:43 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { SignupUserInput } from '../types/user.type';
import Database from 'better-sqlite3'



export class UserService {
    // This service can be used to handle user-related operations
    // such as signup, login, etc.
    constructor(private db: Database.Database) {
        // Initialize any necessary properties or dependencies here
    }
    signup(signupInfo: SignupUserInput): { message: string; id:number ; data: SignupUserInput } {
        // This method can be used to create a new user in the database
        // For now, we will just return a success message
        console.log(`Signup for: ${signupInfo.username}, ${signupInfo.email}`);
        const stmt = this.db.prepare(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
        )
        const result = stmt.run(signupInfo.username, signupInfo.email, signupInfo.password);
        console.log(`Creating user: ${signupInfo.username}`);
        
        return {
            message: 'User created successfully',
            id: Number(result.lastInsertRowid),
            data: signupInfo,
        };
    }
    
    getAllUsers() {
        return this.db.prepare('SELECT * FROM users').all()
    }

    getUserById(id: number) {
        return this.db.prepare('SELECT * FROM users WHERE id = ?').get(id)
    }

    getByEmail(email: string) {
        return this.db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    }
    
    getByUsername(username: string) {
        return this.db.prepare('SELECT * FROM users WHERE username = ?').get(username)
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