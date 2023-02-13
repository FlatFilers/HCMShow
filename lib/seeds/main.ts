import { prismaClient } from "../prisma-client";
import {
  Employee,
  EmployeeType,
  HireReason,
  Job,
  JobFamily,
  Location,
  Country,
  PositionTime,
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
import { faker } from "@faker-js/faker";

export const main = async () => {
  console.log("Seeding...");

  await upsertCountries();
  await upsertLocations();
  await upsertEmployeeTypes();
  await upsertJobFamilies();
  await upsertJobs();
  await upsertHireReasons();
  await upsertTitleTypes();
  await upsertTitles();
  await upsertPositionTimes();
  await upsertPayRates();
  await upsertAdditionalJobClassifications();
  await upsertAddresses();

  await createOtherData();

  const user = await upsertUser();

  await seedNewAccount(user);
};

const upsertAddresses = async () => {
  await Promise.all(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(async (element) => {
      const addressId = `todo-fake-id-${element}`;

      await prismaClient.address.upsert({
        where: {
          addressId,
        },
        create: {
          addressId,
          addressLineData: faker.address.streetAddress(),
          city: faker.address.city(),
          state: faker.address.state(),
          countryId: ((await prismaClient.country.findFirst()) as Country).id,
          isPublic: true,
          isPrimary: true,
          postalCode: "94105",
        },
        update: {},
      });
    })
  );
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
        .pipe(parse({ skipRows: 1 }))
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

const upsertJobs = async () => {
  // [ 'ID', 'Profile Name', 'Job Code', 'Effective Date', 'Inactive', 'Include Job Code In Name', 'Title', 'Summary', 'Description', 'Additional Description', 'Work Shift Required', 'Is Job Public', 'Job Family']
  const jobFamilyId = ((await prismaClient.jobFamily.findFirst()) as JobFamily)
    .id;
  const parseCsv: Promise<Omit<Job, "id" | "createdAt" | "updatedAt">[]> =
    new Promise((resolve, reject) => {
      const data: Omit<Job, "id" | "createdAt" | "updatedAt">[] = [];

      fs.createReadStream("./lib/seeds/data/seed_job.csv")
        .pipe(parse({ skipRows: 1 }))
        .on("error", reject)
        .on("data", (row: any) => {
          data.push({
            slug: row[0],
            name: row[1],
            jobCode: row[2],
            effectiveDate: DateTime.fromFormat(row[3], "yyyy-MM-dd").toJSDate(),
            isInactive: row[4] !== "Yes",
            includeJobCodeInName: row[5] === "" ? null : row[5] === "Yes",
            title: row[6],
            summary: row[7],
            description: row[8],
            additionalDescription: row[9],
            workShift: row[10] === "" ? null : row[10] === "Yes",
            jobPublic: row[11] !== "No",
            jobFamilyId,
          });
        })
        .on("end", () => {
          resolve(data);
        });
    });

  const csvData = await Promise.resolve(parseCsv);

  const promises = csvData.map(async (data) => {
    const job: Job = await prismaClient.job.upsert({
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
      await prismaClient.titleType.upsert({
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

      const country = (await prismaClient.country.findUnique({
        where: {
          code: data.countryCode,
        },
      })) as Country;

      const titleType = (await prismaClient.titleType.findUnique({
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
      await prismaClient.title.upsert({
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

const upsertPositionTimes = async () => {
  await prismaClient.positionTime.upsert({
    where: {
      slug: "PT",
    },
    create: {
      slug: "PT",
      name: "Part time",
    },
    update: {},
  });

  await prismaClient.positionTime.upsert({
    where: {
      slug: "FT",
    },
    create: {
      slug: "FT",
      name: "Full time",
    },
    update: {},
  });
};

const upsertPayRates = async () => {
  const data = [
    ["Hourly", "Hourly", "n", "Hourly"],
    ["Salaried", "Salaried", "n", ""],
    ["Daily", "Daily", "n", "Daily"],
    ["None", "None", "n", ""],
    ["Exception Hourly", "Exception_Hourly", "n", "Hourly"],
  ];

  type DataType = Omit<PayRate, "id" | "createdAt" | "updatedAt">;

  const mappedData: DataType[] = data.map((row) => {
    return {
      name: row[0],
      slug: row[1],
      isInactive: row[2] === "y",
      frequency: row[3] && row[3].trim() != "" ? row[3] : null,
    };
  });

  await Promise.all(
    mappedData.map(async (d) => {
      const { name, slug, isInactive, frequency } = d;

      await prismaClient.payRate.upsert({
        where: {
          slug: d.slug,
        },
        create: d,
        update: {},
      });
    })
  );
};

const upsertAdditionalJobClassifications = async () => {
  const data = [
    [
      "US",
      "1_1_Executive_Senior_Level_Officials_and_Managers_United_States_EEO_1_United_States_of_America",
      "1.1 Executive/Senior Level Officials and ",
      "Managers",
      "n",
    ],
    [
      "US",
      "1_2_First_Mid_Level_Officials_and_Managers_United_States_EEO_1_United_States_of_America",
      "1.2 First/Mid-Level Officials and ",
      "Managers",
      "n",
    ],
    [
      "US",
      "2_Professionals_United_States_EEO_1_United_States_of_America",
      "2 ",
      "Professionals",
      "n",
    ],
    [
      "US",
      "3_Techincians_United_States_EEO_1_United_States_of_America",
      "3 ",
      "Techincians",
      "n",
    ],
    [
      "US",
      "4_Sales_Workers_United_States_EEO_1_United_States_of_America",
      "4 Sales ",
      "Workers",
      "n",
    ],
    [
      "US",
      "5_Administrative_Support_Workers_United_States_EEO_1_United_States_of_America",
      "5 Administrative Support ",
      "Workers",
      "n",
    ],
    [
      "US",
      "6_Craft_Workers_United_States_EEO_1_United_States_of_America",
      "6 Craft ",
      "Workers",
      "n",
    ],
    [
      "US",
      "7_Operatives_United_States_EEO_1_United_States_of_America",
      "7 ",
      "Operatives",
      "n",
    ],
    [
      "US",
      "8_Laborers_and_Helpers_United_States_EEO_1_United_States_of_America",
      "8 Laborers and ",
      "Helpers",
      "n",
    ],
    [
      "US",
      "9_Service_Workers_United_States_EEO_1_United_States_of_America",
      "9 Service ",
      "Workers",
      "n",
    ],
  ];

  await Promise.all(
    data.map(async (d) => {
      const country = (await prismaClient.country.findUnique({
        where: {
          code: d[0],
        },
      })) as Country;

      await prismaClient.additionalJobClassification.upsert({
        where: {
          slug: d[1],
        },
        create: {
          slug: d[1],
          jobClassificationId: d[2],
          description: d[3],
          isInactive: d[4] === "y",
          country: {
            connect: {
              id: country.id,
            },
          },
        },
        update: {},
      });
    })
  );
};

// TODO: Eventually this needs to be scoped to the organization.
// Some of this may stay static.
const createOtherData = async () => {
  const workerCompensationCode: WorkerCompensationCode =
    await prismaClient.workerCompensationCode.create({
      data: {},
    });
};

const upsertEmployees = async (organizationId: string) => {
  const employeeTypeId = (
    (await prismaClient.employeeType.findFirst()) as EmployeeType
  ).id;
  const titleId = ((await prismaClient.title.findFirst()) as Title).id;
  const socialSuffixId = ((await prismaClient.title.findFirst()) as Title).id;
  const hireReasonId = (
    (await prismaClient.hireReason.findFirst()) as HireReason
  ).id;
  const hireDate = DateTime.now().toJSDate();
  const endEmploymentDate = null;
  const positionTitle = "Sales Rep";
  const businessTitle = "Sales Rep";
  const jobFamilyId = ((await prismaClient.jobFamily.findFirst()) as JobFamily)
    .id;
  const locationId = ((await prismaClient.location.findFirst()) as Location).id;
  const workspaceId = (
    (await prismaClient.location.findFirst({
      orderBy: { name: "desc" },
    })) as Location
  ).id;
  const positionTimeId = (
    (await prismaClient.positionTime.findFirst()) as PositionTime
  ).id;
  const defaultWeeklyHours = 40;
  const scheduledWeeklyHours = 40;
  const payRateId = ((await prismaClient.payRate.findFirst()) as PayRate).id;
  const additionalJobClassificationId = (
    (await prismaClient.additionalJobClassification.findFirst()) as AdditionalJobClassification
  ).id;
  const workerCompensationCodeId = (
    (await prismaClient.workerCompensationCode.findFirst()) as WorkerCompensationCode
  ).id;
  const addresses = await prismaClient.address.findMany({
    take: 2,
  });

  const data = {
    organizationId,
    employeeId: crypto.randomBytes(16).toString("hex"),
    titleId,
    socialSuffixId,
    hireReasonId,
    firstName: faker.name.firstName(),
    middleName: faker.name.middleName(),
    lastName: faker.name.lastName(),
    hireDate,
    endEmploymentDate,
    positionTitle,
    businessTitle,
    locationId,
    workspaceId,
    employeeTypeId,
    jobFamilyId,
    positionTimeId,
    defaultWeeklyHours,
    scheduledWeeklyHours,
    payRateId,
    additionalJobClassificationId,
    workerCompensationCodeId,
    addresses,
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
