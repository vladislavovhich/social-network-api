/*
  Warnings:

  - The primary key for the `PostVote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `PostVote` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `PostVote` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PostVote` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `PostVote` table. All the data in the column will be lost.
  - You are about to drop the column `voterId` on the `PostVote` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[voteId,postId]` on the table `PostVote` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `voteId` to the `PostVote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PostVote" DROP CONSTRAINT "PostVote_voterId_fkey";

-- AlterTable
ALTER TABLE "PostVote" DROP CONSTRAINT "PostVote_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
DROP COLUMN "value",
DROP COLUMN "voterId",
ADD COLUMN     "voteId" INTEGER NOT NULL,
ADD CONSTRAINT "PostVote_pkey" PRIMARY KEY ("voteId", "postId");

-- CreateTable
CREATE TABLE "CommentVote" (
    "voteId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,

    CONSTRAINT "CommentVote_pkey" PRIMARY KEY ("voteId","commentId")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "value" INTEGER NOT NULL,
    "voterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommentVote_voteId_commentId_key" ON "CommentVote"("voteId", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "PostVote_voteId_postId_key" ON "PostVote"("voteId", "postId");

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentVote" ADD CONSTRAINT "CommentVote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostVote" ADD CONSTRAINT "PostVote_voteId_fkey" FOREIGN KEY ("voteId") REFERENCES "Vote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
