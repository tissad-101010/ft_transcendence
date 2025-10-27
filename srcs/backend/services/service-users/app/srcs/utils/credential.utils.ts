/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   credential.utils.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 14:39:36 by tissad            #+#    #+#             */
/*   Updated: 2025/10/27 15:07:06 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// class to handle credential utilities

/***********************************/
/*    Credential Utility Class     */
/***********************************/

import { SignupUserDTO } from '../types/user.types';

export class CredentialUtils {
    // Placeholder for credential utility methods
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static isValidUsername(username: string): boolean {
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        return usernameRegex.test(username);
    }
    // policy for password complexity can be added here
    static isValidPassword(password: string): boolean {
        return (
            password.length >= 8 && // minimum length
            /[a-z]/.test(password) && // at least one lowercase letter
            /[A-Z]/.test(password) && // at least one uppercase letter
            /[0-9]/.test(password) && // at least one digit
            /[!@#$%^&*(),.?":{}|<>]/.test(password) // at least one special character
        );
    }
    static validateCredentials(data: SignupUserDTO): { isValid: boolean; response: string } {
        const errors: string[] = [];

        if (!this.isValidEmail(data.email)) {
            errors.push('Invalid email format.');
        }
        if (!this.isValidUsername(data.username)) {
            errors.push('Invalid username. It should be 3-30 characters long and can contain letters, numbers, and underscores.');
        }
        if (!this.isValidPassword(data.password)) {
            errors.push('8 characters minimum, 1 uppercase, 1 lowercase,1 digit, and 1 special character.');
        }
        return {
            isValid: errors.length === 0,
            response: errors.join(' '),
        };
    }        
}
