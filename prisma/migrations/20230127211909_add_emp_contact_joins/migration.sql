/*
  Warnings:

  - You are about to drop the `_AddressToEmployee` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AddressToEmployee" DROP CONSTRAINT "_AddressToEmployee_A_fkey";

-- DropForeignKey
ALTER TABLE "_AddressToEmployee" DROP CONSTRAINT "_AddressToEmployee_B_fkey";

-- DropTable
DROP TABLE "_AddressToEmployee";

-- CreateTable
CREATE TABLE "AddressEmployee" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "addressId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,

    CONSTRAINT "AddressEmployee_pkey" PRIMARY KEY ("addressId","employeeId")
);

-- CreateTable
CREATE TABLE "PhoneNumberEmployee" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phoneNumberId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,

    CONSTRAINT "PhoneNumberEmployee_pkey" PRIMARY KEY ("phoneNumberId","employeeId")
);

-- CreateTable
CREATE TABLE "EmailAddressEmployee" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailAddressId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,

    CONSTRAINT "EmailAddressEmployee_pkey" PRIMARY KEY ("emailAddressId","employeeId")
);

-- AddForeignKey
ALTER TABLE "AddressEmployee" ADD CONSTRAINT "AddressEmployee_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddressEmployee" ADD CONSTRAINT "AddressEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumberEmployee" ADD CONSTRAINT "PhoneNumberEmployee_phoneNumberId_fkey" FOREIGN KEY ("phoneNumberId") REFERENCES "PhoneNumber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumberEmployee" ADD CONSTRAINT "PhoneNumberEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAddressEmployee" ADD CONSTRAINT "EmailAddressEmployee_emailAddressId_fkey" FOREIGN KEY ("emailAddressId") REFERENCES "EmailAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailAddressEmployee" ADD CONSTRAINT "EmailAddressEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
