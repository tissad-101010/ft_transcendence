/*
  Warnings:

  - Added the required column `receiverUsername` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderUsername` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "receiverUsername" TEXT NOT NULL,
ADD COLUMN     "senderUsername" TEXT NOT NULL;
