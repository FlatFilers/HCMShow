import { prismaClient } from "../prisma-client";
import {
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
  Title,
  TitleType,
} from "@prisma/client";
import { DateTime } from "luxon";
import * as fs from "fs";
import { parse } from "fast-csv";
import { hashPassword } from "../user";
import crypto from "crypto";
import { upsertEmployee } from "../employee";

export const main = async () => {
  console.log("Seeding...");

  await upsertCountries();
  await upsertLocations();
  await upsertEmployeeTypes();
  await upsertJobFamilies();
  await upsertHireReasons();
  await upsertTitleTypes();
  await upsertTitles();

  await createOtherData();

  const user = await upsertUser();

  await seedNewAccount(user);
};

export const seedNewAccount = async (user: User) => {
  const existingEmployees = await prismaClient.employee.findMany({
    where: {
      organizationId: user.organizationId,
    },
  });

  if (existingEmployees.length === 0) {
    // TODO: Eventually as we migrate the models we'll need to tie more
    // into the specific organization
    await upsertEmployees(user.organizationId);
  }
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
            isInactive: row[4] !== "y",
          });
        })
        .on("end", () => {
          resolve(data);
        });
    });

  const csvData = await Promise.resolve(parseCsv);

  const promises = csvData.map(async (data) => {
    const jobFamily: JobFamily = await prismaClient.jobFamily.upsert({
      where: {
        slug: data.slug,
      },
      create: data,
      update: {},
    });
  });

  await Promise.all(promises);
};

const upsertTitleTypes = async () => {
  const data: {
    [key: string]: string;
  } = {
    Title: "TITLE",
    Social: "SOCIAL",
    Royal: "ROYAL",
    Religious: "RELIGIOUS",
    Professional: "PROFESSIONAL",
    Honorary: "HONORARY",
    Hereditary: "HEREDITARY",
    Academic: "ACADEMIC",
    Salutation: "SALUTATION",
  };

  await Promise.all(
    Object.keys(data).map(async (key) => {
      await prisma.titleType.upsert({
        where: {
          slug: data[key],
        },
        create: {
          name: key,
          slug: data[key],
        },
        update: {},
      });
    })
  );
};

const upsertTitles = async () => {
  type CsvType = Omit<
    Title,
    "id" | "createdAt" | "updatedAt" | "titleTypeId" | "countryId"
  > & { countryCode: string; titleTypeSlug: string };

  const parseCsv: Promise<CsvType[]> = new Promise((resolve, reject) => {
    const data: CsvType[] = [];

    fs.createReadStream("./lib/seeds/data/seed_titles.csv")
      .pipe(parse({ skipRows: 1 }))
      .on("error", reject)
      .on("data", (row: any) => {
        data.push({
          countryCode: row[0],
          titleTypeSlug: row[1],
          value: row[2],
          slug: row[3],
        });
      })
      .on("end", () => {
        resolve(data);
      });
  });

  const csvData = await Promise.resolve(parseCsv);

  const dataWithCountries = await Promise.all(
    csvData.map(async (data) => {
      const { countryCode, titleTypeSlug, ...rest } = data;

      let mappedData: Omit<CsvType, "countryCode" | "titleTypeSlug"> & {
        country?: any;
        titleType?: any;
      } = {
        ...rest,
      };

      const country = (await prisma.country.findUnique({
        where: {
          code: data.countryCode,
        },
      })) as Country;

      const titleType = (await prisma.titleType.findUnique({
        where: {
          slug: data.titleTypeSlug,
        },
      })) as TitleType;

      mappedData = {
        ...mappedData,
        country: {
          connect: {
            id: country.id,
          },
        },
        titleType: {
          connect: {
            id: titleType.id,
          },
        },
      };

      return {
        ...mappedData,
      };
    })
  );

  await Promise.all(
    dataWithCountries.map(async (data) => {
      await prisma.title.upsert({
        where: {
          slug: data.slug,
        },
        create: data,
        update: {},
      });
    })
  );
};

const upsertCountries = async () => {
  // [Name,Type,ID]
  const parseCsv: Promise<Omit<Country, "id" | "createdAt" | "updatedAt">[]> =
    new Promise((resolve, reject) => {
      const data: Omit<Country, "id" | "createdAt" | "updatedAt">[] = [];

      fs.createReadStream("./lib/seeds/data/seed_countries.csv")
        .pipe(parse({ skipRows: 1 }))
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
    const country: Country = await prismaClient.country.upsert({
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
      .pipe(parse({ skipRows: 1 }))
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
          countryCodes: row[7]
            ?.split(",")
            ?.filter((c: string) => c.trim() !== ""),
        });
      })
      .on("end", () => {
        resolve(data);
      });
  });

  const csvData = await Promise.resolve(parseCsv);

  // Tried to make the upsert/connect query all in one, but wasn't able to figure it out.
  const employeeTypesUpserts = csvData.map(async (data) => {
    const { countryCodes, ...employeeTypeData } = data;

    return await prismaClient.employeeType.upsert({
      where: {
        slug: data.slug,
      },
      create: employeeTypeData,
      update: {},
    });
  });

  const employeeTypes = await Promise.all(employeeTypesUpserts);

  const updates = employeeTypes.map(async (e) => {
    const countryCodes =
      csvData.find((row) => e.slug === row.slug)?.countryCodes || [];

    const countryUpdates = countryCodes.map(async (code) => {
      const country = (await prismaClient.country.findUnique({
        where: { code },
      })) as Country;

      await prismaClient.employeeType.update({
        where: { id: e.id },
        data: {
          countries: {
            connectOrCreate: {
              where: {
                employeeTypeId_countryId: {
                  employeeTypeId: e.id,
                  countryId: country.id,
                },
              },
              create: {
                countryId: country.id,
              },
            },
          },
        },
      });
    });

    await Promise.all(countryUpdates);
  });

  await Promise.all(updates);
};

const upsertLocations = async () => {
  type CsvType = Omit<
    Location & { countryCode: string },
    "id" | "createdAt" | "updatedAt" | "countryId"
  >;

  const parseCsv: Promise<CsvType[]> = new Promise((resolve, reject) => {
    const data: CsvType[] = [];

    fs.createReadStream("./lib/seeds/data/seed_locations.csv")
      .pipe(parse({ skipRows: 1 }))
      .on("error", reject)
      .on("data", (row: any) => {
        data.push({
          slug: row[0],
          effectiveDate: DateTime.fromFormat(row[1], "yyyy-MM-dd").toJSDate(),
          name: row[2],
          isInactive: row[5] !== "y",
          latitude: Number.parseFloat(row[6]),
          longitude: Number.parseFloat(row[7]),
          altitude: Number.parseFloat(row[8]),
          countryCode: row[20],
        });
      })
      .on("end", () => {
        resolve(data);
      });
  });

  const csvData = await Promise.resolve(parseCsv);

  const dataWithCountries = await Promise.all(
    csvData.map(async (data) => {
      const { countryCode, ...rest } = data;

      let mappedData: Omit<CsvType, "countryCode"> & { country?: any } = {
        ...rest,
      };

      if (!data.countryCode) {
        return mappedData;
      }

      const country = await prismaClient.country.findUnique({
        where: {
          code: data.countryCode,
        },
      });

      if (!country) {
        return mappedData;
      }

      mappedData = {
        ...mappedData,
        country: {
          connect: {
            id: country.id,
          },
        },
      };

      return {
        ...mappedData,
      };
    })
  );

  const promises = await Promise.all(
    dataWithCountries.map(async (data) => {
      try {
        await prismaClient.location.upsert({
          where: {
            slug: data.slug,
          },
          create: data,
          update: {},
        });
      } catch (error) {
        // console.error("Error upserting location", data.slug, error);
      }
    })
  );
};

const upsertHireReasons = async () => {
  type CsvType = Omit<HireReason, "id" | "createdAt" | "updatedAt">;

  const parseCsv: Promise<CsvType[]> = new Promise((resolve, reject) => {
    const data: CsvType[] = [];

    fs.createReadStream("./lib/seeds/data/seed_hire_reasons.csv")
      .pipe(parse({ headers: true }))
      .on("error", reject)
      .on("data", (row: any) => {
        data.push({
          slug: row["ID"],
          category: row["Reason Category"],
          isInactive: row["Inactive"] === "y",
          classificationName: row["Event Classification Name"],
          classificationSlug: row["Event Classification ID"],
          subcategorySlug: row["General Event Subcategory ID"],
          reason: row["Reason"],
          isManagerReason: row["Manager Reason"] === "y",
        });
      })
      .on("end", () => {
        resolve(data);
      });
  });

  const csvData = await Promise.resolve(parseCsv);

  await Promise.all(
    csvData.map(async (data) => {
      await prismaClient.hireReason.upsert({
        where: {
          subcategorySlug: data.subcategorySlug,
        },
        create: data,
        update: {},
      });
    })
  );
};

// TODO: Eventually this needs to be scoped to the organization.
// Some of this may stay static.
const createOtherData = async () => {
  // const workspace: Location = await prismaClient.location.create({
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

  const positionTime: PositionTime = await prismaClient.positionTime.upsert({
    where: {
      slug: "Part_time",
    },
    create: {
      slug: "Part_time",
      name: "Part time",
    },
    update: {},
  });
  await prismaClient.positionTime.upsert({
    where: {
      slug: "Full_time",
    },
    create: {
      slug: "Full_time",
      name: "Full time",
    },
    update: {},
  });

  // const workShift: WorkShift = await prismaClient.workShift.create({
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
  const payRate: PayRate = await prismaClient.payRate.upsert({
    where: {
      slug: "Hourly",
    },
    create: payRateData,
    update: {},
  });

  const additionalJobClassification: AdditionalJobClassification =
    await prismaClient.additionalJobClassification.create({
      data: {},
    });

  const workerCompensationCode: WorkerCompensationCode =
    await prismaClient.workerCompensationCode.create({
      data: {},
    });

  const employeeType = await prismaClient.employeeType.findFirst();

  if (!employeeType) {
    throw "Error upsertEmployees(): no employeeType record";
  }

  const jobFamily = await prismaClient.jobFamily.findFirst();

  if (!jobFamily) {
    throw "Error upsertEmployees(): no jobFamily record";
  }

  const location = await prismaClient.location.findFirst();

  if (!location) {
    throw "Error upsertEmployees(): no location record";
  }
};

const upsertEmployees = async (organizationId: string) => {
  const employeeTypeId = (
    (await prismaClient.employeeType.findFirst()) as EmployeeType
  ).id;
  const locationId = ((await prismaClient.location.findFirst()) as Location).id;
  const jobFamilyId = ((await prismaClient.jobFamily.findFirst()) as JobFamily)
    .id;
  const positionTimeId = (
    (await prismaClient.positionTime.findFirst()) as PositionTime
  ).id;

  const data = {
    organizationId,
    employeeId: crypto.randomBytes(16).toString("hex"),
    locationId,
    employeeTypeId,
    jobFamilyId,
    positionTimeId,
  };
  const manager: Employee = await upsertEmployee(data);

  const directReports = Array.from({ length: 10 }).map(async () => {
    await upsertEmployee({
      ...data,
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

  const organization = await prismaClient.organization.upsert({
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

  const user: User = await prismaClient.user.upsert({
    where: {
      email: data.email,
    },
    create: data,
    update: {},
  });

  return user;
};
