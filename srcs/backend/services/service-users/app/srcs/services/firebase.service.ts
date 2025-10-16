/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   firebase.service.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/14 14:37:46 by tissad            #+#    #+#             */
/*   Updated: 2025/10/16 21:25:46 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as admin from "firebase-admin";
import path from "path";

import fetch from "node-fetch";

const serviceAccountPath = path.resolve(__dirname, "./pong-2fa-firebase-adminsdk-fbsvc-ddc57e9e2a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

export const firebaseAdmin = admin;


interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number; // utile pour reCAPTCHA v3
  action?: string;
  "error-codes"?: string[];
}

/**
 * Vérifie le token reCAPTCHA auprès de l'API Google
 * @param token - Le jeton reCAPTCHA envoyé par le client
 * @returns true si le CAPTCHA est valide, sinon false
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    console.error("❌ ERREUR : RECAPTCHA_SECRET_KEY manquant dans les variables d'environnement");
    return false;
  }

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });

    const data: RecaptchaResponse = await res.json();
    console.log("reCAPTCHA verification response:", data);
    if (!data.success) {
      console.warn("⚠️ Vérification reCAPTCHA échouée :", data["error-codes"]);
      return false;
    }
    console.log("✅ reCAPTCHA vérifié avec succès");
    return true;
  } catch (err) {
    console.error("❌ Erreur lors de la vérification du reCAPTCHA :", err);
    return false;
  }
}



// Vérifie un token Firebase JWT (retourné après vérif OTP)
export async function verifyFirebaseToken(idToken: string) {
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken); 
    console.log("Decoded Token:", decodedToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw error;
  } 
}


// Assurez-vous que firebaseAdmin est déjà initialisé avec votre projet
// firebaseAdmin.initializeApp({...});

export async function createUser(phone: string, email: string) {
  try {
    // 1️⃣ Créer l'utilisateur avec téléphone et e-mail
    const userRecord = await firebaseAdmin.auth().createUser({
      phoneNumber: phone,
      email: email,
      emailVerified: false, // L'email n'est pas encore vérifié
      disabled: false,
    });

    console.log("Successfully created new user:", userRecord.uid);

    // 2️⃣ Générer un lien de vérification d'email
    const emailVerificationLink = await firebaseAdmin
      .auth()
      .generateEmailVerificationLink(email, {
        url: 'https://localhost:8443/signup', // URL de redirection après vérification
        handleCodeInApp: true,
      });

    console.log("===================================================>Email verification link:", emailVerificationLink);
    // Tu peux envoyer ce lien par email à l'utilisateur via ton service d'email

    // 3️⃣ Préparer l'utilisateur pour MFA (SMS)
    // Ici on configure un facteur secondaire (MFA) via Admin SDK
    // Exemple : on crée un facteur pour l'utilisateur, mais il faut que l'utilisateur confirme le numéro via l'app
    await firebaseAdmin.auth().updateUser(userRecord.uid, {
      multiFactor: {
        enrolledFactors: [
          {
            uid: phone, // Identifiant du facteur (unique pour le MFA)
            displayName: "Téléphone principal",
            factorId: "phone",
            phoneNumber: phone,
          },
        ],
      },
    });

    console.log("MFA factor initialized for user (needs verification in app)");

    return { userRecord, emailVerificationLink };
  } catch (error) {
    console.error("Error creating new user:", error);
    throw error;
  }
}


// delete a user with uid
export async function deleteUserByUid(uid: string) {
  try {
    await firebaseAdmin.auth().deleteUser(uid);
    console.log("Successfully deleted user");
    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    return false;
  }
}