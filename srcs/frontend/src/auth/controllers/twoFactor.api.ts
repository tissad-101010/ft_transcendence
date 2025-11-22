/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   twoFactor.api.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: issad <issad@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/22 12:58:29 by issad             #+#    #+#             */
/*   Updated: 2025/11/22 19:51:23 by issad            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */





import { authFetch } from '../authFetch';
// src/auth/controllers/twoFactor.api.ts
const BASE_URL = "https://localhost:8443/api/user/2fa";

/**
 * Envoie un OTP par e-mail.
 */
export async function sendEmailOtp(): Promise<boolean> {
  try {
    const requestOptions: RequestInit = {
      method: "POST",
      credentials: "include",
    };
    const res = await authFetch(`${BASE_URL}/email-sendOtp`, requestOptions); 
    return res.ok;
  } catch (err) {
    console.error("Error sending email OTP:", err);
    return false;
  }
}

// enable 2fa mail
export async function enable2faEmail(otp:string): Promise<boolean> {
  try { 
    const requestOptions: RequestInit = {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ code: otp }),
      headers: { "Content-Type": "application/json" },
    };
    const res = await authFetch(`${BASE_URL}/email-enable`, requestOptions); 
    return res.ok;
  }
  catch (err) {
    console.error("Error enabling 2FA email:", err);
    return false;
  }
}

/**
 * Vérifie le code OTP reçu par e-mail.
 */
export async function verifyEmailOtp(code: string): Promise<boolean> {
  try {
    const requestOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code }),
    };
    const res = await authFetch(`${BASE_URL}/email-verifyOtp`, requestOptions);
    const data = await res.json();
    return data?.success === true;
  } catch (err) {
    console.error("Error verifying email OTP:", err);
    return false;
  }
}

/**
 * Vérifie un code TOTP (Google Authenticator, etc.)
 */
export async function verifyTotp(code: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/verifyTotp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    return data?.success === true;
  } catch (err) {
    console.error("Error verifying TOTP:", err);
    return false;
  }
}
