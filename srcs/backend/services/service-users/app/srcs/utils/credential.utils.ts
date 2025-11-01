/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   credential.utils.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 14:39:36 by tissad            #+#    #+#             */
/*   Updated: 2025/10/31 10:12:08 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// class to handle credential utilities

/***********************************/
/*    Credential Utility Class     */
/***********************************/

import { promises } from 'dns';
import { SignupUserDTO } from '../types/user.types';

interface Errors {
    emailFormat?: string;
    usernameFormat?: string;
    passwordFormat?: string;
}

interface Response {
    isValid: boolean;
    errors: Errors;
}


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
    static validateCredentials(data: SignupUserDTO):Response { 
        const errors: Errors = {};
        const response: Response = { isValid: true, errors: {} };
        if (!this.isValidEmail(data.email)) {
            errors.emailFormat = 'Invalid email format.';
            response.isValid = false;
        }
        if (!this.isValidUsername(data.username)) {
            errors.usernameFormat = 'Username must be 3-30 characters long and can only contain letters, numbers, and underscores.';
            response.isValid = false;
        }
        if (!this.isValidPassword(data.password)) {
            errors.passwordFormat = 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.';
            response.isValid = false;
        }
        response.errors = errors;
        return response;
    }        
}
