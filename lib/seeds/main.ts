import {
  PrismaClient,
  Employee,
  EmployeeType,
  HireReason,
  JobFamily,
  Location,
  Country,
  PositionTime,
  WorkShift,
  PayRate,
  AdditionalJobClassification,
  WorkerCompensationCode,
  User,
} from "@prisma/client";
import { DateTime } from "luxon";
import Email from "next-auth/providers/email";
import { getMaxListeners } from "process";

const prisma = new PrismaClient();

export const main = async () => {
  console.log("Seeding...");

  const employeeType: EmployeeType = await prisma.employeeType.create({
    data: {
      name: "Regular",
      slug: "Regular",
      description: "A person who works a regular schedule, year round.",
      isFixedTerm: false,
      isSeasonal: false,
      isTrainee: false,
      isInactive: false,
    },
  });

  const hireReason: HireReason = await prisma.hireReason.create({
    data: {
      slug: "Additional_Headcount_Request_Headcount_Request",
      category: "Headcount Request",
      isInactive: false,
      classificationName: "Additional Headcount Request",
      classificationSlug: "ADDITIONAL_HEADCOUNT_REQUEST",
      subcategorySlug:
        "Additional_Headcount_Request_Headcount_Request_New_Project",
      reason: "New Project",
      isManagerReason: true,
    },
  });

  const jobFamily: JobFamily = await prisma.jobFamily.create({
    data: {
      slug: "Sales_Direct_Sales",
      effectiveDate: DateTime.now().toJSDate(),
      name: "Sales-Direct Sales",
      summary: "Direct Sales",
      isInactive: false,
    },
  });

  const country: Country = await prisma.country.create({
    data: {
      name: "California",
      type: "Country_Region_ID",
      code: "USA-CA",
    },
  });

  const location: Location = await prisma.location.create({
    data: {
      name: "HQ",
      slug: "HQ",
      effectiveDate: DateTime.now().toJSDate(),
      // location usage id req rel
      isInactive: false,
      latitude: 123.12,
      longitude: 65.4,
      altitude: 8456.22,

      // time profile id
      // locale id
      // time zone id
      // currency id

      countryId: country.id,
    },
  });

  const workspace: Location = await prisma.location.create({
    data: {
      name: "Front desk",
      slug: "Front desk",
      effectiveDate: DateTime.now().toJSDate(),
      // location usage id req rel
      isInactive: false,
      latitude: 123.12,
      longitude: 65.4,
      altitude: 8456.22,

      // time profile id
      // locale id
      // time zone id
      // currency id

      countryId: country.id,
    },
  });

  const positionTime: PositionTime = await prisma.positionTime.create({
    data: {
      slug: "Part_time",
      name: "Part time",
    },
  });

  const workShift: WorkShift = await prisma.workShift.create({
    data: {
      slug: "Day_United_States_of_America",
      name: "Day",
      description: "Day	US",
      countryId: country.id,
      isInactive: false,
    },
  });

  const payRate: PayRate = await prisma.payRate.create({
    data: {
      name: "Hourly",
      slug: "Hourly",
      isInactive: false,
      frequency: "Hourly",
    },
  });

  const additionalJobClassification: AdditionalJobClassification =
    await prisma.additionalJobClassification.create({
      data: {},
    });

  const workerCompensationCode: WorkerCompensationCode =
    await prisma.workerCompensationCode.create({
      data: {},
    });

  const manager: Employee = await prisma.employee.create({
    data: {
      managerId: null,
      employeeTypeId: employeeType.id,
      hireReasonId: hireReason.id,
      hireDate: DateTime.now().toJSDate(),
      endEmploymentDate: null,
      jobFamilyId: jobFamily.id,
      positionTitle: "Sales Director",
      businessTitle: "Sales Director",
      locationId: location.id,
      workspaceId: workspace.id,
      positionTimeId: positionTime.id,
      workShiftId: workShift.id,
      defaultWeeklyHours: 40,
      scheduledWeeklyHours: 40,
      payRateId: payRate.id,
      additionalJobClassificationId: additionalJobClassification.id,
      workerCompensationCodeId: workerCompensationCode.id,
    },
  });

  const directReport: Employee = await prisma.employee.create({
    data: {
      managerId: manager.id,
      employeeTypeId: employeeType.id,
      hireReasonId: hireReason.id,
      hireDate: DateTime.now().toJSDate(),
      endEmploymentDate: null,
      jobFamilyId: jobFamily.id,
      positionTitle: "Sales Rep",
      businessTitle: "Sales Rep",
      locationId: location.id,
      workspaceId: workspace.id,
      positionTimeId: positionTime.id,
      workShiftId: workShift.id,
      defaultWeeklyHours: 40,
      scheduledWeeklyHours: 40,
      payRateId: payRate.id,
      additionalJobClassificationId: additionalJobClassification.id,
      workerCompensationCodeId: workerCompensationCode.id,
    },
  });

  const firstUser: User = await prisma.user.create({
    data: {
      email: "user@email.com",
      password: "badpassword"
    }
  })
};
