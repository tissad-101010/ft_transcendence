/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   verifyToken.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/25 09:41:41 by glions            #+#    #+#             */
/*   Updated: 2025/12/16 14:49:17 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// UTILS FOR USER-SERVICE
import {
  usersClient,
  serviceUsersURL
} from "./usersClient";

export async function verifyToken(token: string) {
  const res = await usersClient.post(`${serviceUsersURL}/internal/verify-token`,{ token });
  console.log("------------- RES VAUT", res.data);
  return (res.data);
}