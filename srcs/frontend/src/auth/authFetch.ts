/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   authFetch.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/18 19:06:30 by tissad            #+#    #+#             */
/*   Updated: 2025/12/01 12:03:13 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// ==============================
//  fetchWrapper - gère le refresh auto
// ==============================

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken(): Promise<void> {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            try {
                isRefreshing = true;

                const res = await fetch("https://localhost:8443/api/user/auth/refresh", {
                    method: "POST",
                    credentials: "include",
                });

                if (!res.ok) {
                    console.warn("Refresh token invalid, logout required");
                    throw new Error("Refresh failed");
                }
            } finally {
                isRefreshing = false;
                refreshPromise = null;
            }
        })();
    }

    return refreshPromise;
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
    // Toujours envoyer les cookies (access_token + refresh_token)
    init.credentials = "include";

    let res = await fetch(input, init);

    if (res.status !== 401) {
        return res;
    }

    // 401 → essayer de refresh
    try {
        // Attends la fin du refresh en cours (ou initialise-en un)
        await refreshAccessToken();

        // Rejoue la requête originale
        return await fetch(input, init);
    } catch (err) {
        console.error("Refresh failed, redirect to login");
        throw err;
    }
}
