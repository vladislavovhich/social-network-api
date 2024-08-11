/*
  Warnings:

  - The primary key for the `CommentVote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `GroupCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `GroupImage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `GroupSub` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PostImage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PostTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PostVote` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserImage` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "CommentVote" DROP CONSTRAINT "CommentVote_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "CommentVote_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GroupCategory" DROP CONSTRAINT "GroupCategory_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "GroupCategory_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GroupImage" DROP CONSTRAINT "GroupImage_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "GroupImage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GroupSub" DROP CONSTRAINT "GroupSub_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "GroupSub_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PostImage" DROP CONSTRAINT "PostImage_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PostImage_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PostTag" DROP CONSTRAINT "PostTag_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PostTag_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "PostVote" DROP CONSTRAINT "PostVote_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PostVote_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserImage" DROP CONSTRAINT "UserImage_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "UserImage_pkey" PRIMARY KEY ("id");
