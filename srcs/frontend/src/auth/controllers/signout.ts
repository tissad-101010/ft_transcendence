/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   signout.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 12:26:37 by tissad            #+#    #+#             */
/*   Updated: 2025/11/20 14:16:09 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// src/utils/logoutUser.ts




export async function logoutUser() {
  try {
    const response = await fetch("https://localhost:8443/api/user/auth/logout", {
      method: "POST",
      credentials: "include", // indispensable pour les cookies
    });

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
