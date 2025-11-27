/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   storage.utils.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/27 15:15:50 by tissad            #+#    #+#             */
/*   Updated: 2025/11/27 15:53:10 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  keyFilename: process.env.GCP_STORAGE_KEY_PATH,
});

const bucket = storage.bucket("pong-avatars");

export async function uploadAvatar(buffer: Buffer, dest: string, mimetype: string) {
  const file = bucket.file(dest);

  await file.save(buffer, {
    resumable: false,
    //public: true,
    contentType: mimetype,
  });

  return dest;
}

export async function generateSignedUrl(filename: string, expiresInSeconds = 3600) {
  const expires = Date.now() + expiresInSeconds * 1000;

  const [url] = await bucket.file(filename).getSignedUrl({
    version: "v4",
    action: "read",
    expires,
  });

  return url;
}

export async function deleteAvatar(fileName: string) {
    await bucket.file(fileName).delete();
}