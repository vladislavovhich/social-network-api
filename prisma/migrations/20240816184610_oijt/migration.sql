-- CreateTable
CREATE TABLE "GroupBan" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "groupId" INTEGER NOT NULL,
    "bannedId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupBan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupModerator" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "moderatorId" INTEGER NOT NULL,

    CONSTRAINT "GroupModerator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupRule" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "groupId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupModerator_moderatorId_groupId_key" ON "GroupModerator"("moderatorId", "groupId");

-- AddForeignKey
ALTER TABLE "GroupBan" ADD CONSTRAINT "GroupBan_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupBan" ADD CONSTRAINT "GroupBan_bannedId_fkey" FOREIGN KEY ("bannedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupModerator" ADD CONSTRAINT "GroupModerator_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupModerator" ADD CONSTRAINT "GroupModerator_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupRule" ADD CONSTRAINT "GroupRule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
