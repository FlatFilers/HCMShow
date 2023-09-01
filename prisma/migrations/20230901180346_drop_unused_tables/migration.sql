/*
  Warnings:

  - You are about to drop the `AdditionalJobClassification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AddressEmployee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AddressLineType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommunicationUsageBehaviorType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommunicationUsageType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Country` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CountryRegion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailAddressEmployee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmployeeTypeCountry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HireReason` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PayRate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhoneDeviceType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhoneNumber` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhoneNumberEmployee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PositionTime` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Title` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TitleType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkShift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkerCompensationCode` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdditionalJobClassification" DROP CONSTRAINT "AdditionalJobClassification_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_addressLineTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_countryRegionId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_submunicipalityTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_subregionTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_typeId_fkey";

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_useForId_fkey";

-- DropForeignKey
ALTER TABLE "AddressEmployee" DROP CONSTRAINT "AddressEmployee_addressId_fkey";

-- DropForeignKey
ALTER TABLE "EmailAddress" DROP CONSTRAINT "EmailAddress_typeId_fkey";

-- DropForeignKey
ALTER TABLE "EmailAddress" DROP CONSTRAINT "EmailAddress_useForId_fkey";

-- DropForeignKey
ALTER TABLE "EmailAddressEmployee" DROP CONSTRAINT "EmailAddressEmployee_emailAddressId_fkey";

-- DropForeignKey
ALTER TABLE "EmailAddressEmployee" DROP CONSTRAINT "EmailAddressEmployee_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeTypeCountry" DROP CONSTRAINT "EmployeeTypeCountry_countryId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeTypeCountry" DROP CONSTRAINT "EmployeeTypeCountry_employeeTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_countryId_fkey";

-- DropForeignKey
ALTER TABLE "PhoneNumber" DROP CONSTRAINT "PhoneNumber_countryId_fkey";

-- DropForeignKey
ALTER TABLE "PhoneNumber" DROP CONSTRAINT "PhoneNumber_phoneDeviceTypeId_fkey";

-- DropForeignKey
ALTER TABLE "PhoneNumber" DROP CONSTRAINT "PhoneNumber_typeId_fkey";

-- DropForeignKey
ALTER TABLE "PhoneNumber" DROP CONSTRAINT "PhoneNumber_useForId_fkey";

-- DropForeignKey
ALTER TABLE "PhoneNumberEmployee" DROP CONSTRAINT "PhoneNumberEmployee_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "PhoneNumberEmployee" DROP CONSTRAINT "PhoneNumberEmployee_phoneNumberId_fkey";

-- DropForeignKey
ALTER TABLE "Title" DROP CONSTRAINT "Title_countryId_fkey";

-- DropForeignKey
ALTER TABLE "Title" DROP CONSTRAINT "Title_titleTypeId_fkey";

-- DropForeignKey
ALTER TABLE "WorkShift" DROP CONSTRAINT "WorkShift_countryId_fkey";

-- DropTable
DROP TABLE "AdditionalJobClassification";

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "AddressEmployee";

-- DropTable
DROP TABLE "AddressLineType";

-- DropTable
DROP TABLE "CommunicationUsageBehaviorType";

-- DropTable
DROP TABLE "CommunicationUsageType";

-- DropTable
DROP TABLE "Country";

-- DropTable
DROP TABLE "CountryRegion";

-- DropTable
DROP TABLE "EmailAddress";

-- DropTable
DROP TABLE "EmailAddressEmployee";

-- DropTable
DROP TABLE "EmployeeTypeCountry";

-- DropTable
DROP TABLE "HireReason";

-- DropTable
DROP TABLE "Location";

-- DropTable
DROP TABLE "PayRate";

-- DropTable
DROP TABLE "PhoneDeviceType";

-- DropTable
DROP TABLE "PhoneNumber";

-- DropTable
DROP TABLE "PhoneNumberEmployee";

-- DropTable
DROP TABLE "PositionTime";

-- DropTable
DROP TABLE "Title";

-- DropTable
DROP TABLE "TitleType";

-- DropTable
DROP TABLE "WorkShift";

-- DropTable
DROP TABLE "WorkerCompensationCode";
