/*
  Warnings:

  - Added the required column `firstName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `middleName` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "countryId" UUID,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "socialSuffixId" UUID,
ADD COLUMN     "titleId" UUID;

UPDATE "Employee" SET "firstName" = '', "middleName" = '', "lastName" = '';

ALTER TABLE "Employee" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "middleName" SET NOT NULL;
ALTER TABLE "Employee" ALTER COLUMN "lastName" SET NOT NULL;

-- CreateTable
CREATE TABLE "CountryRegion" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "CountryRegion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Title" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "countryId" UUID,
    "slug" TEXT NOT NULL,
    "titleTypeId" UUID,
    "value" TEXT NOT NULL,

    CONSTRAINT "Title_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TitleType" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "TitleType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "effectiveDate" TIMESTAMP(3),
    "countryId" UUID,
    "addressLineTypeId" UUID,
    "addressLineData" TEXT,
    "municipality" TEXT,
    "submunicipalityTypeId" UUID,
    "submunicipalityData" TEXT,
    "countryRegionId" UUID,
    "subregionTypeId" UUID,
    "subregionData" TEXT,
    "postalCode" TEXT,
    "isPublic" BOOLEAN NOT NULL,
    "isPrimary" BOOLEAN NOT NULL,
    "typeId" UUID,
    "useForId" UUID,
    "municipalityLocal" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddressLineType" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AddressLineType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationUsageType" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "CommunicationUsageType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationUsageBehaviorType" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "CommunicationUsageBehaviorType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneNumber" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "countryId" UUID,
    "internationalPhoneCode" TEXT,
    "phoneNumber" TEXT,
    "phoneExtension" TEXT,
    "isPublic" BOOLEAN NOT NULL,
    "isPrimary" BOOLEAN NOT NULL,
    "phoneDeviceTypeId" UUID,
    "typeId" UUID,
    "useForId" UUID,

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneDeviceType" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mapsToCode" TEXT,
    "isDefaultPhoneDeviceType" BOOLEAN NOT NULL,
    "shouldHideForRecruiting" BOOLEAN NOT NULL,
    "isInactive" BOOLEAN NOT NULL,

    CONSTRAINT "PhoneDeviceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AddressToEmployee" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CountryRegion_code_key" ON "CountryRegion"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Title_slug_key" ON "Title"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TitleType_slug_key" ON "TitleType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AddressLineType_slug_key" ON "AddressLineType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationUsageType_slug_key" ON "CommunicationUsageType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationUsageBehaviorType_slug_key" ON "CommunicationUsageBehaviorType"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_AddressToEmployee_AB_unique" ON "_AddressToEmployee"("A", "B");

-- CreateIndex
CREATE INDEX "_AddressToEmployee_B_index" ON "_AddressToEmployee"("B");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_titleId_fkey" FOREIGN KEY ("titleId") REFERENCES "Title"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_socialSuffixId_fkey" FOREIGN KEY ("socialSuffixId") REFERENCES "Title"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Title" ADD CONSTRAINT "Title_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Title" ADD CONSTRAINT "Title_titleTypeId_fkey" FOREIGN KEY ("titleTypeId") REFERENCES "TitleType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_addressLineTypeId_fkey" FOREIGN KEY ("addressLineTypeId") REFERENCES "AddressLineType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_submunicipalityTypeId_fkey" FOREIGN KEY ("submunicipalityTypeId") REFERENCES "AddressLineType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_countryRegionId_fkey" FOREIGN KEY ("countryRegionId") REFERENCES "CountryRegion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_subregionTypeId_fkey" FOREIGN KEY ("subregionTypeId") REFERENCES "AddressLineType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CommunicationUsageType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_useForId_fkey" FOREIGN KEY ("useForId") REFERENCES "CommunicationUsageBehaviorType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_phoneDeviceTypeId_fkey" FOREIGN KEY ("phoneDeviceTypeId") REFERENCES "PhoneDeviceType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CommunicationUsageType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_useForId_fkey" FOREIGN KEY ("useForId") REFERENCES "CommunicationUsageBehaviorType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddressToEmployee" ADD CONSTRAINT "_AddressToEmployee_A_fkey" FOREIGN KEY ("A") REFERENCES "Address"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AddressToEmployee" ADD CONSTRAINT "_AddressToEmployee_B_fkey" FOREIGN KEY ("B") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
