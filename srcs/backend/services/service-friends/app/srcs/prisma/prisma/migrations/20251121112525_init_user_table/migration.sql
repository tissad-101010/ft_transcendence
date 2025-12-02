/*
  Warnings:

  - Added the required column `fromUserUsername` to the `FriendInvitation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toUserUsername` to the `FriendInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FriendInvitation" ADD COLUMN     "fromUserUsername" TEXT NOT NULL,
ADD COLUMN     "toUserUsername" TEXT NOT NULL;
