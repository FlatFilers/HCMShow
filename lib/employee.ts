import { Prisma, PrismaClient, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { seedNewAccount } from "./seeds/main";
import { faker } from "@faker-js/faker";
import { DateTime } from "luxon";
import { Field, Record } from "./flatfile";
import { inspect } from "util";

const prisma = new PrismaClient();

// TODO: Temp solution until we get more of the fields in the config
export const upsertEmployee = async ({
  organizationId,
  employeeId,
  managerId,
  flatfileRecordId,
}: {
  organizationId: string;
  employeeId: string;
  managerId?: string;
  flatfileRecordId?: string;
}) => {
  const prisma = new PrismaClient();

  const employeeType = await prisma.employeeType.findFirst();
  if (!employeeType) {
    throw "Error upsertEmployees(): no employeeType record";
  }
  const jobFamily = await prisma.jobFamily.findFirst();
  if (!jobFamily) {
    throw "Error upsertEmployees(): no jobFamily record";
  }
  const hireReason = await prisma.hireReason.findFirst();
  if (!hireReason) {
    throw "Error upsertEmployees(): no hireReason record";
  }
  const positionTime = await prisma.positionTime.findFirst();
  if (!positionTime) {
    throw "Error upsertEmployees(): no positionTime record";
  }
  const payRate = await prisma.payRate.findFirst();
  if (!payRate) {
    throw "Error upsertEmployees(): no payRate record";
  }
  const additionalJobClassification =
    await prisma.additionalJobClassification.findFirst();
  if (!additionalJobClassification) {
    throw "Error upsertEmployees(): no additionalJobClassification record";
  }
  const workerCompensationCode =
    await prisma.workerCompensationCode.findFirst();
  if (!workerCompensationCode) {
    throw "Error upsertEmployees(): no workerCompensationCode record";
  }
  const location = await prisma.location.findFirst();
  if (!location) {
    throw "Error upsertEmployees(): no location record";
  }

  return await prisma.employee.upsert({
    where: {
      employeeId,
    },
    create: {
      employeeId: employeeId,
      managerId: managerId,
      organizationId: organizationId,
      firstName: faker.name.firstName(),
      middleName: faker.name.middleName(),
      lastName: faker.name.lastName(),
      name: faker.name.fullName(),
      employeeTypeId: employeeType.id,
      hireReasonId: hireReason.id,
      hireDate: DateTime.now().toJSDate(),
      endEmploymentDate: null,
      jobFamilyId: jobFamily.id,
      positionTitle: "Sales Rep",
      businessTitle: "Sales Rep",
      locationId: location.id,
      // workspaceId: workspace.id,
      positionTimeId: positionTime.id,
      // workShiftId: workShift.id,
      defaultWeeklyHours: 40,
      scheduledWeeklyHours: 40,
      payRateId: payRate.id,
      additionalJobClassificationId: additionalJobClassification.id,
      workerCompensationCodeId: workerCompensationCode.id,
      flatfileRecordId,
    },
    update: {},
  });
};

export const mapRecordFieldsForEmployee = async (records: Record[]) => {
  const mapping: { [key: string]: string } = {
    employeeId: "employeeId",
    managerId: "managerId",
    // nameCountry: "nameCountry",
    nameTitle: "title",
    nameFirstName: "firstName",
    nameMiddleName: "middleName",
    nameLastName: "lastName",
    // nameSocialSuffix: "nameSocialSuffix",
    // employeeType: "employeeType",
    // hireReason: "hireReason",
    hireDate: "hireDate",
    // Note: this is misspelled
    endEmployementDate: "endEmploymentDate",
    // jobCode: "jobCode",
    positionTitle: "positionTitle",
    businessTitle: "businessTitle",
    // location: "location",
    // workspace: "workspace",
    // positionTimeType: "positionTimeType",
    // workShift: "workShift",
    defaultWeeklyHours: "defaultWeeklyHours",
    scheduledWeeklyHours: "scheduledWeeklyHours",
    // payRateType: "payRateType",
    // additionalJobClassification: "additionalJobClassification",
    // workerCompensationCode: "workerCompensationCode",
    // addressEffectiveDate: "addressEffectiveDate",
    // addressCountry: "addressCountry",
    // addressLine_1: "addressLine_1",
    // addressLine_2: "addressLine_2",
    // addressLine_3: "addressLine_3",
    // addressLine_4: "addressLine_4",
    // addressLine_5: "addressLine_5",
    // addressLine_6: "addressLine_6",
    // addressLine_7: "addressLine_7",
    // addressLine_8: "addressLine_8",
    // addressLine_9: "addressLine_9",
    // addressLine_1Local: "addressLine_1Local",
    // addressLine_2Local: "addressLine_2Local",
    // addressLine_3Local: "addressLine_3Local",
    // addressLine_4Local: "addressLine_4Local",
    // addressLine_5Local: "addressLine_5Local",
    // addressLine_6Local: "addressLine_6Local",
    // addressLine_7Local: "addressLine_7Local",
    // addressLine_8Local: "addressLine_8Local",
    // addressLine_9Local: "addressLine_9Local",
    // municipality: "municipality",
    // citySubdivision_1: "citySubdivision_1",
    // citySubdivision_2: "citySubdivision_2",
    // citySubdivision_1Local: "citySubdivision_1Local",
    // citySubdivision_2Local: "citySubdivision_2Local",
    // countryRegion: "countryRegion",
    // regionsubdivision_1: "regionsubdivision_1",
    // regionSubdivision_2: "regionSubdivision_2",
    // regionSubdivision_1Local: "regionSubdivision_1Local",
    // regionSubdivision_2Local: "regionSubdivision_2Local",
    // postalCode: "postalCode",
    // addressPublic: "addressPublic",
    // addressPrimary: "addressPrimary",
    // addressType: "addressType",
    // addressUseFor: "addressUseFor",
    // municipalityLocal: "municipalityLocal",
    // phoneCountry: "phoneCountry",
    // internationalPhoneCode: "internationalPhoneCode",
    // phoneNumber: "phoneNumber",
    // phoneExtension: "phoneExtension",
    // deviceType: "deviceType",
    // phonePublic: "phonePublic",
    // phonePrimary: "phonePrimary",
    // phoneType: "phoneType",
    // phoneUseFor: "phoneUseFor",
    // emailAddress: "emailAddress",
    // emailComment: "emailComment",
    // emailPublic: "emailPublic",
    // emailPrimary: "emailPrimary",
    // emailType: "emailType",
    // emailUseFor: "emailUseFor",
  };

  return records.map((r) => {
    const camelCaseValues = convertToCamelCase(r.values);

    const requiredKeys = Object.keys(camelCaseValues).filter((key) =>
      mapping.hasOwnProperty(key)
    );

    console.log("keys to take", requiredKeys);

    const mappedValues = requiredKeys.reduce(
      (acc, key) => ({ ...acc, [mapping[key]]: camelCaseValues[key] }),
      {}
    );
    console.log("mappedValues", inspect(mappedValues, { depth: null }));

    return {
      ...r,
      values: mappedValues,
    } as Record;
  });
};

const convertToCamelCase = (obj: { [key: string]: any }) => {
  const newObj: { [key: string]: any } = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = key.replace(/_([a-z])/g, (match) =>
        match[1].toUpperCase()
      );
      newObj[newKey] = obj[key];
    }
  }
  return newObj;
};

export const validRecords = async (records: Record[]) => {
  // Find required fields
  const prisma = new PrismaClient();
  const result: { column_name: string }[] = await prisma.$queryRaw`
    SELECT column_name 
    FROM information_schema.columns
    WHERE table_name = 'Employee'
      AND is_nullable = 'NO'
      AND column_name NOT IN ('createdAt', 'updatedAt')
      AND (column_name = 'employeeId' OR column_name NOT ILIKE '%id')
  `;
  const requiredFields = result.map((r) => r.column_name);

  return records.filter((r) => {
    return requiredFields.every((f) => r.values[f]?.valid);
  });
};
