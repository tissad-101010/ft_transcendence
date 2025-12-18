/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   auth.api.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/18 19:09:22 by tissad            #+#    #+#             */
/*   Updated: 2025/12/18 08:43:21 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { getApiUrl } from '../../utils';
import { authFetch } from '../authFetch';

const API_URL = window.__ENV__.BACKEND_URL;

export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; message?: string, data?: any }> {
  console.log("username ", username);
  console.log("email ", email);
  console.log("password ", password);
  try {
    const response = await fetch(`${getApiUrl()}/api/user/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include", // envoie les cookies si backend les utilise
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok && data.signupComplete) {
      return { success: true, data: data };
    } else {
      return { success: false, message: data.message || "Registration failed" };
    }
  } catch (err) {
    console.error(err);
    return { success: false, message: "An error occurred during registration" };
  }
}

export async function loginUser(
    username: string,
    password: string
): Promise<{ success: boolean; message?: string, data?: any }> {
    console.log("username ", username);
    console.log("password ", password);

    try {
        const response = await fetch(`${getApiUrl()}/api/user/auth/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            credentials: "include", // envoie les cookies si backend les utilise
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json(); 
        if (response.ok && data.signinComplete) {
            return { success: true, data: data };
        }
        else {
            return { success: false, message: data.message || "Login failed" };
        }
    } catch (err) {
        console.error(err);
        return { success: false, message: "An error occurred during login" };
    }
}


export async function fetchUserProfile(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
        const requestOptions: RequestInit = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                authorization: "Bearer cookie", // dummy value to trigger auth header check in backend
            },
            credentials: "include", // envoie les cookies si backend les utilise
        };
        const response = await authFetch(`${getApiUrl()}/api/user/profile`, requestOptions);
        const data = await response.json(); 
        if (response.ok) {
            return { success: true, data: data};
        }
        else {
            return { success: false, message: data.message || "Failed to fetch user profile" };
        }
    } catch (err) {
        console.error(err);
        return { success: false, message: "An error occurred while fetching user profile" };
    }
}





export async function logoutUser(): Promise<{ success: boolean; message?: string }> {
    try {
        const response = await fetch(`${getApiUrl()}/api/user/auth/signout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            credentials: "include", // envoie les cookies si backend les utilise
        });
        
        if (response.ok) {
            return { success: true };
        }
        else {
            const data = await response.json(); 
            return { success: false, message: data.message || "Logout failed" };
        }
    } catch (err) {
        console.error(err);
        return { success: false, message: "An error occurred during logout" };
    }
}

// change password
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await authFetch(`${getApiUrl()}/api/user/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, message: data.message || "Password changed successfully" };
    } else {
      return { success: false, message: data.message || "Password change failed" };
    }
  } catch (err) {
    console.error(err);
    return { success: false, message: "An error occurred during password change" };
  }
}