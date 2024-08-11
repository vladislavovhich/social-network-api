/*
  Warnings:

  - A unique constraint covering the columns `[categoryId,groupId]` on the table `GroupCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId,imageId]` on the table `GroupImage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,groupId]` on the table `GroupSub` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[postId,imageId]` on the table `PostImage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[postId,tagId]` on the table `PostTag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,imageId]` on the table `UserImage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GroupCategory_categoryId_groupId_key" ON "GroupCategory"("categoryId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupImage_groupId_imageId_key" ON "GroupImage"("groupId", "imageId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupSub_userId_groupId_key" ON "GroupSub"("userId", "groupId");

-- CreateIndex
CREATE UNIQUE INDEX "PostImage_postId_imageId_key" ON "PostImage"("postId", "imageId");

-- CreateIndex
CREATE UNIQUE INDEX "PostTag_postId_tagId_key" ON "PostTag"("postId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "UserImage_userId_imageId_key" ON "UserImage"("userId", "imageId");
