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


// class to handle cryptographic utilities

import crypto from 'crypto';
import bcrypt from 'bcryptjs';  

/***********************************/
/*     Cryptographic Utility       */
/***********************************/

function prehash(password: string): string {
  const normalized = password.normalize('NFKC');
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

async function hashLongPassword(password: string): Promise<string> {
  const ph = prehash(password);
  return await bcrypt.hash(ph, 12);
}

async function verifyLongPassword(password: string, storedHash: string): Promise<boolean> {
  const ph = prehash(password);
  return await bcrypt.compare(ph, storedHash);
}

export const CryptUtils = {
  hashLongPassword,
  verifyLongPassword,
};