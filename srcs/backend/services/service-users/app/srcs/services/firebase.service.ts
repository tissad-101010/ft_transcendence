/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   firebase.service.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/14 14:37:46 by tissad            #+#    #+#             */
/*   Updated: 2025/10/14 16:54:50 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as admin from "firebase-admin";
import path from "path";



const serviceAccountPath = path.resolve(__dirname, "./secrets/pong-2fa-firebase-adminsdk-fbsvc-ddc57e9e2a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

export const firebaseAdmin = admin;

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

// create a user with phone number
export async function createUserWithPhone(phone: string) {
  try {
    const userRecord = await firebaseAdmin.auth().createUser({
      phoneNumber: phone, 
    }); 
    console.log("Successfully created new user:", userRecord.uid);
    return userRecord;
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