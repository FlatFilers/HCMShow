-- CreateTable
CREATE TABLE "EmailAddress" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailAddress" TEXT,
    "emailComment" TEXT,
    "isPublic" BOOLEAN NOT NULL,
    "isPrimary" BOOLEAN NOT NULL,
    "typeId" UUID,
    "useForId" UUID,

    CONSTRAINT "EmailAddress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmailAddress" ADD CONSTRAINT "EmailAddress_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CommunicationUsageType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAddress" ADD CONSTRAINT "EmailAddress_useForId_fkey" FOREIGN KEY ("useForId") REFERENCES "CommunicationUsageBehaviorType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
