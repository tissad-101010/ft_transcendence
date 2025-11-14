// src/auth/controllers/twoFactor.api.ts
const BASE_URL = "https://localhost:8443/api/user/2fa";

/**
 * Envoie un OTP par e-mail.
 */
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
 * Vérifie le code OTP reçu par e-mail.
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
