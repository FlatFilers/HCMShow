-- CreateTable
CREATE TABLE "Action" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "actionType" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
