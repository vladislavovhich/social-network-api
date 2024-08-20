/*
  Warnings:

  - Added the required column `dialog_between` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "dialog_between" TEXT NOT NULL;
