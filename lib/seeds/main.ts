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
import * as bcrypt from "bcrypt";
import * as fs from "fs";
import { parse } from "fast-csv";

const prisma = new PrismaClient();

const upsertJobFamilies = async () => {
  // [ 'ID', 'Effective Date', 'Name', 'Summary', 'Inactive', '', '' ]
  const parseCsv: Promise<Omit<JobFamily, "id" | "createdAt" | "updatedAt">[]> =
    new Promise((resolve, reject) => {
      const data: Omit<JobFamily, "id" | "createdAt" | "updatedAt">[] = [];

      fs.createReadStream("./lib/seeds/data/seed_job_family.csv")
        .pipe(parse())
        .on("error", reject)
        .on("data", (row: any) => {
          data.push({
            slug: row[0],
            effectiveDate: DateTime.fromFormat(row[1], "yyyy-MM-dd").toJSDate(),
            name: row[2],
            summary: row[3],
            isInactive: row[4] !== "n",
          });
        })
        .on("end", () => {
          resolve(data);
        });
    });

  const csvData = await Promise.resolve(parseCsv);

  const promises = csvData.map(async (data) => {
    const jobFamily: JobFamily = await prisma.jobFamily.upsert({
      where: {
        slug: data.slug,
      },
      create: data,
      update: {},
    });
  });

  await Promise.all(promises);
};

const upsertCountries = async () => {
  // [Name,Type,ID]
  const parseCsv: Promise<Omit<Country, "id" | "createdAt" | "updatedAt">[]> =
    new Promise((resolve, reject) => {
      const data: Omit<Country, "id" | "createdAt" | "updatedAt">[] = [];

      fs.createReadStream("./lib/seeds/data/seed_countries.csv")
        .pipe(parse())
        .on("error", reject)
        .on("data", (row: any) => {
          data.push({
            name: row[0],
            type: row[1],
            code: row[2],
          });
        })
        .on("end", () => {
          resolve(data);
        });
    });

  const csvData = await Promise.resolve(parseCsv);

  const promises = csvData.map(async (data) => {
    const country: Country = await prisma.country.upsert({
      where: {
        code: data.code,
      },
      create: data,
      update: {},
    });
  });

  await Promise.all(promises);
};
export const main = async () => {
  console.log("Seeding...");

  await upsertJobFamilies();
  await upsertCountries();

  // const employeeTypeData = {
  //   name: "Regular",
  //   slug: "Regular",
  //   description: "A person who works a regular schedule, year round.",
  //   isFixedTerm: false,
  //   isSeasonal: false,
  //   isTrainee: false,
  //   isInactive: false,
  // };
  // const employeeType = await prisma.employeeType.upsert({
  //   where: {
  //     slug: "Regular",
  //   },
  //   create: employeeTypeData,
  //   update: employeeTypeData,
  // });

  // // TODO: need to define unique constraints here to do upsert
  // // const hireReasonData = {
  // //   slug: "Additional_Headcount_Request_Headcount_Request",
  // //   category: "Headcount Request",
  // //   isInactive: false,
  // //   classificationName: "Additional Headcount Request",
  // //   classificationSlug: "ADDITIONAL_HEADCOUNT_REQUEST",
  // //   subcategorySlug:
  // //     "Additional_Headcount_Request_Headcount_Request_New_Project",
  // //   reason: "New Project",
  // //   isManagerReason: true,
  // // };
  // // const hireReason = await prisma.hireReason.upsert({
  // //   where: {
  // //     slug: hireReasonData.slug,
  // //   },
  // //   create: hireReasonData,
  // //   update: {},
  // // });
  // const hireReason = await prisma.hireReason.create({
  //   data: {
  //     slug: "Additional_Headcount_Request_Headcount_Request",
  //     category: "Headcount Request",
  //     isInactive: false,
  //     classificationName: "Additional Headcount Request",
  //     classificationSlug: "ADDITIONAL_HEADCOUNT_REQUEST",
  //     subcategorySlug:
  //       "Additional_Headcount_Request_Headcount_Request_New_Project",
  //     reason: "New Project",
  //     isManagerReason: true,
  //   },
  // );

  // const jobFamily: JobFamily = await prisma.jobFamily.create({
  //   data: {
  //     slug: "Sales_Direct_Sales",
  //     effectiveDate: DateTime.now().toJSDate(),
  //     name: "Sales-Direct Sales",
  //     summary: "Direct Sales",
  //     isInactive: false,
  //   },
  // });

  // const country: Country = await prisma.country.create({
  //   data: {
  //     name: "California",
  //     type: "Country_Region_ID",
  //     code: "USA-CA",
  //   },
  // });

  // const location: Location = await prisma.location.create({
  //   data: {
  //     name: "HQ",
  //     slug: "HQ",
  //     effectiveDate: DateTime.now().toJSDate(),
  //     // location usage id req rel
  //     isInactive: false,
  //     latitude: 123.12,
  //     longitude: 65.4,
  //     altitude: 8456.22,

  //     // time profile id
  //     // locale id
  //     // time zone id
  //     // currency id

  //     countryId: country.id,
  //   },
  // });

  // const workspace: Location = await prisma.location.create({
  //   data: {
  //     name: "Front desk",
  //     slug: "Front desk",
  //     effectiveDate: DateTime.now().toJSDate(),
  //     // location usage id req rel
  //     isInactive: false,
  //     latitude: 123.12,
  //     longitude: 65.4,
  //     altitude: 8456.22,

  //     // time profile id
  //     // locale id
  //     // time zone id
  //     // currency id

  //     countryId: country.id,
  //   },
  // });

  // const positionTime: PositionTime = await prisma.positionTime.create({
  //   data: {
  //     slug: "Part_time",
  //     name: "Part time",
  //   },
  // });

  // const workShift: WorkShift = await prisma.workShift.create({
  //   data: {
  //     slug: "Day_United_States_of_America",
  //     name: "Day",
  //     description: "Day	US",
  //     countryId: country.id,
  //     isInactive: false,
  //   },
  // });

  // const payRate: PayRate = await prisma.payRate.create({
  //   data: {
  //     name: "Hourly",
  //     slug: "Hourly",
  //     isInactive: false,
  //     frequency: "Hourly",
  //   },
  // });

  // const additionalJobClassification: AdditionalJobClassification =
  //   await prisma.additionalJobClassification.create({
  //     data: {},
  //   });

  // const workerCompensationCode: WorkerCompensationCode =
  //   await prisma.workerCompensationCode.create({
  //     data: {},
  //   });

  // const manager: Employee = await prisma.employee.create({
  //   data: {
  //     managerId: null,
  //     employeeTypeId: employeeType.id,
  //     hireReasonId: hireReason.id,
  //     hireDate: DateTime.now().toJSDate(),
  //     endEmploymentDate: null,
  //     jobFamilyId: jobFamily.id,
  //     positionTitle: "Sales Director",
  //     businessTitle: "Sales Director",
  //     locationId: location.id,
  //     workspaceId: workspace.id,
  //     positionTimeId: positionTime.id,
  //     workShiftId: workShift.id,
  //     defaultWeeklyHours: 40,
  //     scheduledWeeklyHours: 40,
  //     payRateId: payRate.id,
  //     additionalJobClassificationId: additionalJobClassification.id,
  //     workerCompensationCodeId: workerCompensationCode.id,
  //   },
  // });

  // const directReports = Array.from({ length: 10 }).map(async () => {
  //   await prisma.employee.create({
  //     data: {
  //       managerId: manager.id,
  //       employeeTypeId: employeeType.id,
  //       hireReasonId: hireReason.id,
  //       hireDate: DateTime.now().toJSDate(),
  //       endEmploymentDate: null,
  //       jobFamilyId: jobFamily.id,
  //       positionTitle: "Sales Rep",
  //       businessTitle: "Sales Rep",
  //       locationId: location.id,
  //       workspaceId: workspace.id,
  //       positionTimeId: positionTime.id,
  //       workShiftId: workShift.id,
  //       defaultWeeklyHours: 40,
  //       scheduledWeeklyHours: 40,
  //       payRateId: payRate.id,
  //       additionalJobClassificationId: additionalJobClassification.id,
  //       workerCompensationCodeId: workerCompensationCode.id,
  //     },
  //   });
  // });

  // await Promise.all(directReports);

  // console.log("DR's", directReports);

  // const firstUser: User = await prisma.user.create({
  //   data: {
  //     email: "user@email.com",
  //     password: await bcrypt.hash("badpassword", 16),
  //   },
  // });
};
