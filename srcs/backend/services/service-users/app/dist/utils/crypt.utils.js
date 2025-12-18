"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   crypt.utils.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/27 14:20:12 by tissad            #+#    #+#             */
/*   Updated: 2025/10/27 14:22:33 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptUtils = void 0;
// class to handle cryptographic utilities
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/***********************************/
/*     Cryptographic Utility       */
/***********************************/
function prehash(password) {
    const normalized = password.normalize('NFKC');
    return crypto_1.default.createHash('sha256').update(normalized, 'utf8').digest('hex');
}
async function hashLongPassword(password) {
    const ph = prehash(password);
    return await bcryptjs_1.default.hash(ph, 12);
}
async function verifyLongPassword(password, storedHash) {
    const ph = prehash(password);
    return await bcryptjs_1.default.compare(ph, storedHash);
}
exports.CryptUtils = {
    hashLongPassword,
    verifyLongPassword,
};
