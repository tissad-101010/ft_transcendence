"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   verifyToken.service.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/21 12:43:37 by tissad            #+#    #+#             */
/*   Updated: 2025/11/21 14:24:09 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenService = verifyTokenService;
const jwt_utils_1 = require("../../utils/jwt.utils");
// fuction to verify token returns the payload if the token is valid
async function verifyTokenService(tocken) {
    try {
        const payload = jwt_utils_1.JwtUtils.verifyAccessToken(tocken);
        return payload;
    }
    catch (error) {
        return null;
    }
}
