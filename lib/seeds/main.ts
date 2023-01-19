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
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const upsertJobFamilies = async () => {
  // [ 'ID', 'Effective Date', 'Name', 'Summary', 'Inactive', '', '' ]
  const parseCsv: Promise<Omit<JobFamily, "id" | "createdAt" | "updatedAt">[]> =
    new Promise((resolve, reject) => {
      const data: Omit<JobFamily, "id" | "createdAt" | "updatedAt">[] = [];

      fs.createReadStream("./lib/seeds/data/seed_job_families.csv")
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

const upsertEmployeeTypes = async () => {
  // Employee Type Name,ID,Employee Type Description,Fixed Term Employee Type,Seasonal,Trainee,Inactive
  const parseCsv: Promise<
    Omit<EmployeeType, "id" | "createdAt" | "updatedAt">[]
  > = new Promise((resolve, reject) => {
    const data: Omit<EmployeeType, "id" | "createdAt" | "updatedAt">[] = [];

    fs.createReadStream("./lib/seeds/data/seed_employee_types.csv")
      .pipe(parse())
      .on("error", reject)
      .on("data", (row: any) => {
        data.push({
          name: row[0],
          slug: row[1],
          description: row[2],
          isFixedTerm: row[3] === "y",
          isSeasonal: row[4] === "y",
          isTrainee: row[5] === "y",
          isInactive: row[6] === "y",
        });
      })
      .on("end", () => {
        resolve(data);
      });
  });

  const csvData = await Promise.resolve(parseCsv);

  const country = await prisma.country.findUnique({
    where: { code: "USA" },
  });

  if (!country) {
    throw "Error in upsertLocations: no USA country record found, did you seed countries?";
  }

  const promises = csvData.map(async (data) => {
    const employeeType: EmployeeType = await prisma.employeeType.upsert({
      where: {
        slug: data.slug,
      },
      create: {
        ...data,
        countries: {
          create: {
            country: {
              connect: {
                id: country.id,
              },
            },
          },
        },
      },
      update: {},
    });
  });

  await Promise.all(promises);
};

const upsertLocations = async () => {
  const country = await prisma.country.findUnique({
    where: { code: "USA" },
  });

  if (!country) {
    throw "Error in upsertLocations: no USA country record found, did you seed countries?";
  }

  const promises = [...Array(10)].map(async () => {
    let city = faker.address.city();

    const data: Omit<Location, "id" | "createdAt" | "updatedAt"> = {
      name: city,
      slug: city.toLowerCase().replaceAll(" ", "_"),
      effectiveDate: DateTime.now().toJSDate(),
      isInactive: false,
      latitude: Math.random(),
      longitude: Math.random(),
      altitude: Math.random(),
      countryId: country.id,
    };

    console.log("data", data);

    await prisma.location.upsert({
      where: {
        slug: data.slug,
      },
      create: data,
      update: {},
    });
  });

  await Promise.all(promises);
};

const upsertEmployees = async () => {
  // // TODO: need to define unique constraints here to do upsert
  // const hireReasonData = {
  //   slug: "Additional_Headcount_Request_Headcount_Request",
  //   category: "Headcount Request",
  //   isInactive: false,
  //   classificationName: "Additional Headcount Request",
  //   classificationSlug: "ADDITIONAL_HEADCOUNT_REQUEST",
  //   subcategorySlug:
  //     "Additional_Headcount_Request_Headcount_Request_New_Project",
  //   reason: "New Project",
  //   isManagerReason: true,
  // };
  // const hireReason = await prisma.hireReason.upsert({
  //   where: {
  //     slug: hireReasonData.slug,
  //   },
  //   create: hireReasonData,
  //   update: {},
  // });

  const hireReason = await prisma.hireReason.create({
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

  const positionTime: PositionTime = await prisma.positionTime.create({
    data: {
      slug: "Part_time",
      name: "Part time",
    },
  });

  // const workShift: WorkShift = await prisma.workShift.create({
  //   data: {
  //     slug: "Day_United_States_of_America",
  //     name: "Day",
  //     description: "Day	US",
  //     countryId: country.id,
  //     isInactive: false,
  //   },
  // });

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

  const employeeType = await prisma.employeeType.findFirst();

  if (!employeeType) {
    throw "Error upsertEmployees(): no employeeType record";
  }

  const jobFamily = await prisma.jobFamily.findFirst();

  if (!jobFamily) {
    throw "Error upsertEmployees(): no jobFamily record";
  }

  const location = await prisma.location.findFirst();

  if (!location) {
    throw "Error upsertEmployees(): no location record";
  }

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
      // workspaceId: workspace.id,
      positionTimeId: positionTime.id,
      // workShiftId: workShift.id,
      defaultWeeklyHours: 40,
      scheduledWeeklyHours: 40,
      payRateId: payRate.id,
      additionalJobClassificationId: additionalJobClassification.id,
      workerCompensationCodeId: workerCompensationCode.id,
    },
  });

  const directReports = Array.from({ length: 10 }).map(async () => {
    await prisma.employee.create({
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
        // workspaceId: workspace.id,
        positionTimeId: positionTime.id,
        // workShiftId: workShift.id,
        defaultWeeklyHours: 40,
        scheduledWeeklyHours: 40,
        payRateId: payRate.id,
        additionalJobClassificationId: additionalJobClassification.id,
        workerCompensationCodeId: workerCompensationCode.id,
      },
    });
  });

  await Promise.all(directReports);

  console.log("DR's", directReports);

  const firstUser: User = await prisma.user.create({
    data: {
      email: "user@email.com",
      password: await bcrypt.hash("badpassword", 16),
    },
  });
};

export const main = async () => {
  console.log("Seeding...");

  await upsertCountries();
  await upsertLocations();

  await upsertEmployeeTypes();
  await upsertJobFamilies();

  await upsertEmployeeTypes();
  await upsertEmployees();
};
