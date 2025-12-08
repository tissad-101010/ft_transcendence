/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   usersClient.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/25 09:35:34 by glions            #+#    #+#             */
/*   Updated: 2025/11/25 12:32:47 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import axios from "axios";

export const serviceUsersURL = 'http://service-users:4000';

export const usersClient = axios.create({
  baseURL: process.env.USER_SERVICE_URL,
  timeout: 1500,
  headers: { 'x-internal-key': process.env.INTERNAL_API_KEY }
});
