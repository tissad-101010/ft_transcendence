"use strict";
/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   storage.utils.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tissad <tissad@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/11/27 15:15:50 by tissad            #+#    #+#             */
/*   Updated: 2025/11/27 18:49:18 by tissad           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = uploadAvatar;
exports.generateSignedUrl = generateSignedUrl;
exports.deleteAvatar = deleteAvatar;
const storage_1 = require("@google-cloud/storage");
const storage = new storage_1.Storage({
    keyFilename: process.env.GCP_STORAGE_KEY_PATH,
});
const bucket = storage.bucket("pong-avatars");
async function uploadAvatar(buffer, dest, mimetype) {
    const file = bucket.file(dest);
    //   await file.save(buffer, {
    //     resumable: false,
    //     //public: true,
    //     contentType: mimetype,
    //   });
    //   return dest;
    await file.save(buffer, {
        resumable: false,
        contentType: mimetype,
    });
    return `https://storage.googleapis.com/pong-avatars/${dest}`;
}
async function generateSignedUrl(filename, expiresInSeconds = 3600) {
    const expires = Date.now() + expiresInSeconds * 1000;
    const [url] = await bucket.file(filename).getSignedUrl({
        version: "v4",
        action: "read",
        expires,
    });
    return url;
}
async function deleteAvatar(fileName) {
    await bucket.file(fileName).delete();
}
