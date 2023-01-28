import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { seedNewAccount } from "./seeds/main";
import { faker } from "@faker-js/faker";
import { DateTime } from "luxon";
import { Field, Record } from "./flatfile";
import { inspect } from "util";
import { prismaClient } from "./prisma-client";
import { convertKeyToCamelCase, convertToCamelCase } from "./utils";

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
  const employeeType = await prismaClient.employeeType.findFirst();
  if (!employeeType) {
    throw "Error upsertEmployees(): no employeeType record";
  }
  const jobFamily = await prismaClient.jobFamily.findFirst();
  if (!jobFamily) {
    throw "Error upsertEmployees(): no jobFamily record";
  }
  const hireReason = await prismaClient.hireReason.findFirst();
  if (!hireReason) {
    throw "Error upsertEmployees(): no hireReason record";
  }
  const positionTime = await prismaClient.positionTime.findFirst();
  if (!positionTime) {
    throw "Error upsertEmployees(): no positionTime record";
  }
  const payRate = await prismaClient.payRate.findFirst();
  if (!payRate) {
    throw "Error upsertEmployees(): no payRate record";
  }
  const additionalJobClassification =
    await prismaClient.additionalJobClassification.findFirst();
  if (!additionalJobClassification) {
    throw "Error upsertEmployees(): no additionalJobClassification record";
  }
  const workerCompensationCode =
    await prismaClient.workerCompensationCode.findFirst();
  if (!workerCompensationCode) {
    throw "Error upsertEmployees(): no workerCompensationCode record";
  }
  const location = await prismaClient.location.findFirst();
  if (!location) {
    throw "Error upsertEmployees(): no location record";
  }

  return await prismaClient.employee.upsert({
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
    employee_id: "employeeId",
    manager_id: "managerId",
    // name_country: "nameCountry",
    name_title: "title",
    name_first_name: "firstName",
    name_middle_name: "middleName",
    name_last_name: "lastName",
    // name_social_suffix: "nameSocialSuffix",
    // employee_type: "employeeType",
    // hire_reason: "hireReason",
    hire_date: "hireDate",
    // end_employement_date: this is misspelled
    job_code: "endEmploymentDate",
    // position_title: "jobCode",
    business_title: "positionTitle",
    location: "businessTitle",
    // workspace: "location",
    // position_time_type: "workspace",
    // work_shift: "positionTimeType",
    // default_weekly_hours: "workShift",
    scheduled_weekly_hours: "defaultWeeklyHours",
    pay_rate_type: "scheduledWeeklyHours",
    // additional_job_classification: "payRateType",
    // worker_compensation_code: "additionalJobClassification",
    // address_effective_date: "workerCompensationCode",
    // address_country: "addressEffectiveDate",
    // address_line_1: "addressCountry",
    // address_line_2: "addressLine_1",
    // address_line_3: "addressLine_2",
    // address_line_4: "addressLine_3",
    // address_line_5: "addressLine_4",
    // address_line_6: "addressLine_5",
    // address_line_7: "addressLine_6",
    // address_line_8: "addressLine_7",
    // address_line_9: "addressLine_8",
    // address_line_1_local: "addressLine_9",
    // address_line_2_local: "addressLine_1Local",
    // address_line_3_local: "addressLine_2Local",
    // address_line_4_local: "addressLine_3Local",
    // address_line_5_local: "addressLine_4Local",
    // address_line_6_local: "addressLine_5Local",
    // address_line_7_local: "addressLine_6Local",
    // address_line_8_local: "addressLine_7Local",
    // address_line_9_local: "addressLine_8Local",
    // municipality: "addressLine_9Local",
    // city_subdivision_1: "municipality",
    // city_subdivision_2: "citySubdivision_1",
    // city_subdivision_1_local: "citySubdivision_2",
    // city_subdivision_2_local: "citySubdivision_1Local",
    // country_region: "citySubdivision_2Local",
    // regionsubdivision_1: "countryRegion",
    // region_subdivision_2: "regionsubdivision_1",
    // region_subdivision_1_local: "regionSubdivision_2",
    // region_subdivision_2_local: "regionSubdivision_1Local",
    // postal_code: "regionSubdivision_2Local",
    // address_public: "postalCode",
    // address_primary: "addressPublic",
    // address_type: "addressPrimary",
    // address_use_for: "addressType",
    // municipality_local: "addressUseFor",
    // phone_country: "municipalityLocal",
    // international_phone_code: "phoneCountry",
    // phone_number: "internationalPhoneCode",
    // phone_extension: "phoneNumber",
    // device_type: "phoneExtension",
    // phone_public: "deviceType",
    // phone_primary: "phonePublic",
    // phone_type: "phonePrimary",
    // phone_use_for: "phoneType",
    // email_address: "phoneUseFor",
    // email_comment: "emailAddress",
    // email_public: "emailComment",
    // email_primary: "emailPublic",
    // email_type: "emailPrimary",
    // email_use_for: "emailType",
    // emailUseFor: "emailUseFor",
  };

  return records.map((r) => {
    const requiredKeys = Object.keys(r.values).filter((key) =>
      mapping.hasOwnProperty(key)
    );

    const mappedValues = requiredKeys.reduce(
      (acc, key) => ({
        ...acc,
        [convertKeyToCamelCase(mapping[key])]: r.values[key],
      }),
      {}
    );

    const camelCaseValues = convertToCamelCase(r.values);

    return {
      ...r,
      values: mappedValues,
    } as Record;
  });
};

export const validRecords = async (records: Record[]) => {
  // Find required fields
  const result: { column_name: string }[] = await prismaClient.$queryRaw`
    SELECT column_name 
    FROM information_schema.columns
    WHERE table_name = 'Employee'
      AND is_nullable = 'NO'
      AND column_name NOT IN ('createdAt', 'updatedAt')
      AND (column_name = 'employeeId' OR column_name NOT ILIKE '%id')
  `;
  const requiredFields = result.map((r) => r.column_name);

  // Record is valid if every required field is valid
  return records.filter((r) => {
    return requiredFields.every((f) => r.values[f]?.valid);
  });
};
