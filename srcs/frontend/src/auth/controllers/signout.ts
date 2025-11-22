/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   signout.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: issad <issad@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 12:26:37 by tissad            #+#    #+#             */
/*   Updated: 2025/11/22 10:07:14 by issad            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// src/utils/logoutUser.ts


import { authFetch } from "../authFetch";

export async function logoutUser() {
  try {
    const requestOptions: RequestInit = {
      method: "POST",
      credentials: "include", // indispensable pour les cookies
    };
    const response = await authFetch("https://localhost:8443/api/user/auth/logout", requestOptions);


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
