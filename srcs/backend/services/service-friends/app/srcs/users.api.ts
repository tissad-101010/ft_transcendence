/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   users.api.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/20 14:35:35 by glions            #+#    #+#             */
/*   Updated: 2025/11/20 15:53:29 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import axios from "axios";

export class UsersApi
{
    private baseUrl: string;
    constructor (url: string)
    {
        this.baseUrl = url;
    }

    async getUserByLogin(login: string)
    {
        try {
            const res = await axios.get(`${this.baseUrl}/users/login/${login}`);
            if (!res.data.success) return null;
            return (res.data.data);
        } catch (err)
        {
            console.error("Error fetching user from User service", err);
            return (null);
        }
    }
};
