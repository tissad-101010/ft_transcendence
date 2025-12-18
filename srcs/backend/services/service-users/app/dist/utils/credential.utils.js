"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialUtils = void 0;
class CredentialUtils {
    // Placeholder for credential utility methods
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
        return usernameRegex.test(username);
    }
    // policy for password complexity can be added here
    static isValidPassword(password) {
        return (password.length >= 8 && // minimum length
            /[a-z]/.test(password) && // at least one lowercase letter
            /[A-Z]/.test(password) && // at least one uppercase letter
            /[0-9]/.test(password) && // at least one digit
            /[!@#$%^&*(),.?":{}|<>]/.test(password) // at least one special character
        );
    }
    static validateCredentials(data) {
        const errors = {};
        const response = { isValid: true, errors: {} };
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
exports.CredentialUtils = CredentialUtils;
