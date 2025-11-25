/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   friends.model.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: glions <glions@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/25 11:32:05 by tissad            #+#    #+#             */
/*   Updated: 2025/11/25 14:42:06 by glions           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
});

