/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   usersClient.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/25 09:35:34 by glions            #+#    #+#             */
/*   Updated: 2025/12/11 16:30:29 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import axios from "axios";

export const serviceUsersURL = 'http://service-users:4000';


export const usersClient = axios.create({
  baseURL: process.env.USER_SERVICE_URL,
  timeout: 1500,
  headers: { 'x-internal-key': process.env.INTERNAL_API_KEY }
});


// extract access token from cookies
export function extractAccessToken(cookies: string): string {
  // console.log("Extracting access token from cookies:", cookies);
  const accessToken = cookies
    .split("; ")
    .find((row: string) => row.startsWith("access_token="))
    ?.split("=")[1] || "";
  // console.log("Extracted access token:", accessToken);
  return accessToken;
}

// verify access token and return json object with userId and email type any  or null
export async function verifyAccessToken(token: string): Promise<any | null> {
  // console.log("Verifying access token:", token);
 if (!token) {
    console.error("No access token provided");
    return null;
  }
  const res = await usersClient.post(`${serviceUsersURL}/internal/verify-token`, { token });
  if (res.status !== 200) {
    console.error("Access token verification failed with status:", res.status, "and data:", res.data);
    return null;
  }
  // console.log("Access token verified successfully:", res.data);
  return (res.data.data);
}