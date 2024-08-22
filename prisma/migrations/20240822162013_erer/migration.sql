-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "pfpId" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pfpId" INTEGER;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_pfpId_fkey" FOREIGN KEY ("pfpId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_pfpId_fkey" FOREIGN KEY ("pfpId") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;
