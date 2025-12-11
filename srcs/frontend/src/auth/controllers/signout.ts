/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   signout.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 12:26:37 by tissad            #+#    #+#             */
/*   Updated: 2025/12/11 19:15:12 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// src/utils/logoutUser.ts
import { authFetch } from "../authFetch";


const API_URL = window.__ENV__.BACKEND_URL;

export async function logoutUser() : Promise<boolean> {
  try {
    const requestOptions: RequestInit = {
      method: "POST",
      credentials: "include", // indispensable pour les cookies
    };
    const response = await authFetch(`${API_URL}/api/user/auth/logout`, requestOptions);


    if (!response.ok) {
      console.error("[logoutUser] Erreur lors de la déconnexion");
      return false;
    }

    // // Notifier React d'effacer l'état utilisateur
    window.dispatchEvent(new CustomEvent("app-logout"));


    return true;
  } catch (error) {
    console.error("[logoutUser] Erreur réseau:", error);
    return false;
  }
}
