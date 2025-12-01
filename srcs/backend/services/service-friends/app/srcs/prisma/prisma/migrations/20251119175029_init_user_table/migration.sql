/*
  Warnings:

  - You are about to drop the `Freinds` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Freinds";

-- CreateTable
CREATE TABLE "FriendInvitation" (
    "id" SERIAL NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FriendInvitation_fromUserId_toUserId_key" ON "FriendInvitation"("fromUserId", "toUserId");
