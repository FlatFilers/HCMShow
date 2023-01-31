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
import * as fs from "fs";
import { parse } from "fast-csv";
import { faker } from "@faker-js/faker";
import { hashPassword } from "../user";
import crypto from "crypto";
import { upsertEmployee } from "../employee";

const prisma = new PrismaClient();

export const main = async () => {
  console.log("Seeding...");

  await upsertCountries();
  await upsertLocations();

  await upsertEmployeeTypes();
  await upsertJobFamilies();

  await upsertEmployeeTypes();
  await createOtherData();

  const user = await upsertUser();

  await seedNewAccount(user);
};

export const seedNewAccount = async (user: User) => {
  // TODO: Eventually as we migrate the models we'll need to tie more
  // into the specific organization
  await upsertEmployees(user.organizationId);
};

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
  type CsvType = Omit<
    EmployeeType & { countryCodes: string[] },
    "id" | "createdAt" | "updatedAt"
  >;

  // Employee Type Name,ID,Employee Type Description,Fixed Term Employee Type,Seasonal,Trainee,Inactive,Restricted to Countries
  const parseCsv: Promise<CsvType[]> = new Promise((resolve, reject) => {
    const data: CsvType[] = [];

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
          countryCodes: row[7].split(","),
        });
      })
      .on("end", () => {
        resolve(data);
      });
  });

  const csvData = await Promise.resolve(parseCsv);

  const dataWithCountries = await Promise.all(
    csvData.map(async (data) => {
      const countryIds = (
        await prisma.country.findMany({
          where: { code: { in: data.countryCodes } },
        })
      ).map((c) => {
        return { id: c.id };
      });

      return {
        ...data,
        countryIds,
      };
    })
  );

  const promises = dataWithCountries.map(async (data) => {
    const employeeType: EmployeeType = await prisma.employeeType.upsert({
      where: {
        slug: data.slug,
      },
      create: {
        ...data,
        countries: {
          connect: data.countryIds,
          // create: {
          //   country: {
          //     connect: {
          //       id: country.id,
          //     },
          //   },
          // },
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

// TODO: Eventually this needs to be scoped to the organization.
// Some of this may stay static.
const createOtherData = async () => {
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

  const payRateData = {
    name: "Hourly",
    slug: "Hourly",
    isInactive: false,
    frequency: "Hourly",
  };
  const payRate: PayRate = await prisma.payRate.upsert({
    where: {
      slug: "Hourly",
    },
    create: payRateData,
    update: {},
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
};

const upsertEmployees = async (organizationId: string) => {
  const manager: Employee = await upsertEmployee({
    organizationId,
    employeeId: crypto.randomBytes(16).toString("hex"),
  });

  const directReports = Array.from({ length: 10 }).map(async () => {
    await upsertEmployee({
      organizationId,
      employeeId: crypto.randomBytes(16).toString("hex"),
      managerId: manager.id,
    });
  });

  await Promise.all(directReports);
};

const upsertUser = async () => {
  const email = "user@email.com";

  const orgData = {
    email,
  };

  const organization = await prisma.organization.upsert({
    where: {
      email,
    },
    create: orgData,
    update: {},
  });

  const data = {
    email: email,
    password: await hashPassword("badpassword"),
    organization: {
      connect: {
        id: organization.id,
      },
    },
  };

  const user: User = await prisma.user.upsert({
    where: {
      email: data.email,
    },
    create: data,
    update: {},
  });

  return user;
};
