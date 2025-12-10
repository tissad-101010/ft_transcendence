/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   twoFactor.api.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/22 12:58:29 by issad             #+#    #+#             */
/*   Updated: 2025/11/27 19:11:08 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */





import { authFetch } from '../authFetch';
import { fetchUserProfile } from './auth.api';
// src/auth/controllers/twoFactor.api.ts
const BASE_URL = "https://localhost:8443/api/user/2fa";

/**
 * Send OTP to enable 2FA via email
 */
export async function sendEnableEmailOtp(): Promise<boolean> {
  try {
    const requestOptions: RequestInit = {
      method: "POST",
      credentials: "include",
    };
    const res = await authFetch(`${BASE_URL}/email-enable-sendOtp`, requestOptions); 
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
    if (res.ok) {
      // 
      await fetchUserProfile();
    }
    return res.ok;
  }
  catch (err) {
    console.error("Error enabling 2FA email:", err);
    return false;
  }
}


// disable 2fa mail
export async function disable2faEmail(): Promise<boolean> {
  try { 
    const requestOptions: RequestInit = {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ code: "" }),
      headers: { "Content-Type": "application/json" },
    };
    const res = await authFetch(`${BASE_URL}/email-disable`, requestOptions);
    if (res.ok) {
      // fetch updated user profile
      await fetchUserProfile();
    }
    return res.ok;
  }
  catch (err) {
    console.error("Error disabling 2FA email:", err);
    return false;
  }
}



// send otp email
export async function sendEmailOtp(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/email-sendOtp`, { 
      method: "POST", 
      credentials: "include",
    });
    return res.ok;
  } catch (err) {
    console.error("Error sending email OTP:", err);
    return false;
  }
}

/**
 * verify email otp
 */
export async function verifyEmailOtp(code: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/email-verifyOtp`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    console.log("verifyEmailOtp response data:", data);
    return data?.success === true;
  } catch (err) {
    console.error("Error verifying email OTP:", err);
    return false;
  } 
}


// get totp secret
export async function getTotpSecret(): Promise<{ qrCodeUrl: string, message:string} | null> {
  try {
    const requestOptions: RequestInit = {
      method: "GET",
      credentials: "include",
    };
    const res = await authFetch(`${BASE_URL}/totp-secret`, requestOptions);
    if (!res.ok) {
      console.error("Failed to get TOTP secret:", res.statusText);
      return null;
    }
    const data = await res.json();
    console.log("TOTP Secret data:", data);
    return { qrCodeUrl:data.qrCodeUrl , message: data.message };
  } catch (err) {
    console.error("Error getting TOTP secret:", err);
    return null;
  }
}

// enable totp
export async function enableTotp(code:string): Promise<boolean> {
  try {
    const requestOptions: RequestInit = {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({ code }),
      headers: { "Content-Type": "application/json" },
    };
    const res = await authFetch(`${BASE_URL}/totp-enable`, requestOptions);
    if (res.ok) {
      // fetch updated user profile
      await fetchUserProfile();
    }
    return res.ok;
  } catch (err) {
    console.error("Error enabling TOTP:", err);
    return false;
  }
}

// disable totp
export async function disableTotp(): Promise<boolean> {
  try {
    const requestOptions: RequestInit = {
      method: "POST",
      credentials: "include",
    };
    const res = await authFetch(`${BASE_URL}/totp-disable`, requestOptions);
    if (res.ok) {
      // fetch updated user profile
      await fetchUserProfile();
    }
    return res.ok;
  } catch (err) {
    console.error("Error disabling TOTP:", err);
    return false;
  }
}


/**
 * verify totp
 */
export async function verifyTotp(code: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/totp-verify`, {
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

// get 2fa methods
interface TwoFactorMethod {
  type: string;
  enabled: boolean;
}

export async function getTwoFactorMethods(): Promise<TwoFactorMethod[] | null> {
  try {
    const requestOptions: RequestInit = {
      method: "GET",
      credentials: "include",
    };
    const res = await authFetch(`${BASE_URL}/methods`, requestOptions);
    if (!res.ok) {
      console.error("Failed to get 2FA methods:", res.statusText);
      return null;
    }
    const data = await res.json();
    return data.methods as TwoFactorMethod[];
  } catch (err) {
    console.error("Error getting 2FA methods:", err);
    return null;
  } 
}

