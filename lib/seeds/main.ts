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
  BenefitPlan,
} from "@prisma/client";
import { DateTime } from "luxon";
import * as fs from "fs";
import { parse } from "fast-csv";
import { hashPassword } from "../user";
import crypto, { randomUUID } from "crypto";
import { upsertEmployee } from "../employee";
import { faker } from "@faker-js/faker";
import { SeedDepartments } from "./data/seed_departments";

export const main = async () => {
  console.log("Seeding...");

  // await upsertCountries();
  // await upsertLocations();
  await upsertEmployeeTypes();
  await upsertJobFamilies();
  await upsertDepartments();
  // await upsertHireReasons();
  // await upsertTitleTypes();
  // await upsertTitles();
  await upsertPositionTimes();
  // await upsertPayRates();
  // await upsertAdditionalJobClassifications();
  // await upsertAddresses();
  // await createOtherData();

  const user = await upsertUser();
  await upsertJobs(user.organizationId);
  await upsertBenefitPlans(user.organizationId);

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

const upsertDepartments = async () => {
  let promises = SeedDepartments.map(async (department) => {
    await prismaClient.department.upsert({
      where: {
        departmentCode: department.departmentCode,
      },
      create: {
        departmentCode: department.departmentCode,
        departmentName: department.departmentName,
      },
      update: {},
    });
  });

  await Promise.all(promises);
};

export const upsertJobFamilies = async () => {
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

export const upsertJobs = async (organizationId: string) => {
  type CsvJobType = Omit<
    Job,
    "id" | "createdAt" | "updatedAt" | "organizationId"
  >;
  const parseCsv: Promise<CsvJobType[]> = new Promise((resolve, reject) => {
    const data: CsvJobType[] = [];

    fs.createReadStream("./lib/seeds/data/seed_jobs.csv")
      .pipe(parse({ skipRows: 1 }))
      .on("error", reject)
      .on("data", (row: any) => {
        data.push({
          slug: row[0],
          name: row[1],
          department: "Seed Department",
          effectiveDate: DateTime.fromFormat(row[3], "M/d/yyyy").toJSDate(),
          isInactive: row[4] !== "y",
          jobFamilyId: row[5],
        });
      })
      .on("end", () => {
        resolve(data);
      });
  });

  const csvData = await Promise.resolve(parseCsv);

  const dataWithJobFamilyId = await Promise.all(
    csvData.map(async (data) => {
      const { jobFamilyId, ...rest } = data;

      let mappedData: Omit<CsvJobType, "jobFamilyId"> & {
        jobFamily?: any;
        organization: any;
      } = {
        ...rest,
        organization: {
          connect: {
            id: organizationId,
          },
        },
      };

      if (data.jobFamilyId && !data.jobFamilyId.includes("N/A")) {
        const jobFamily = (await prismaClient.jobFamily.findUnique({
          where: {
            slug: data.jobFamilyId,
          },
        })) as JobFamily;

        mappedData = {
          ...mappedData,
          jobFamily: {
            connect: {
              id: jobFamily.id,
            },
          },
        };
      }

      return {
        ...mappedData,
      };
    })
  );

  await Promise.all(
    dataWithJobFamilyId.map(async (data) => {
      await prismaClient.job.upsert({
        where: {
          organizationId_slug: {
            organizationId,
            slug: data.slug,
          },
        },
        create: data,
        update: {},
      });
    })
  );
};

export const upsertBenefitPlans = async (organizationId: string) => {
  type CsvBenefitPlanType = Omit<
    BenefitPlan,
    "id" | "createdAt" | "updatedAt" | "organizationId"
  >;
  const parseCsv: Promise<CsvBenefitPlanType[]> = new Promise(
    (resolve, reject) => {
      const data: CsvBenefitPlanType[] = [];

      fs.createReadStream("./lib/seeds/data/seed_benefit_plans.csv")
        .pipe(parse({ skipRows: 1 }))
        .on("error", reject)
        .on("data", (row: any) => {
          data.push({
            name: row[0],
            slug: row[1],
          });
        })

        .on("end", () => {
          resolve(data);
        });
    }
  );

  const csvData = await Promise.resolve(parseCsv);

  const dataWithOrg = await Promise.all(
    csvData.map(async (data) => {
      let mappedData = {
        ...data,
        organization: {
          connect: {
            id: organizationId,
          },
        },
      };

      return {
        ...mappedData,
      };
    })
  );

  const promises = dataWithOrg.map(async (data) => {
    const benefitPlan: BenefitPlan = await prismaClient.benefitPlan.upsert({
      where: {
        organizationId_slug: {
          organizationId,
          slug: data.slug,
        },
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
  const data: { [key: string]: string } = {
    ft: "Full-Time",
    pt: "Part-Time",
    tm: "Temporary",
    ct: "Contract",
  };

  Object.keys(data).map(async (key) => {
    await prismaClient.employeeType.upsert({
      where: {
        slug: key,
      },
      create: {
        name: data[key],
        slug: key,
      },
      update: {},
    });
  });
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
        const slug = row[0];
        const effectiveDate = DateTime.fromFormat(row[1], "M/d/yy");

        if (!slug || slug.trim() === "" || !effectiveDate.isValid) {
          return;
        }

        data.push({
          slug: row[0],
          effectiveDate: effectiveDate.toJSDate(),
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
        console.log("data", data);
        console.error("Error upserting location", data.slug, error);
        throw error;
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

// These are used to seed the account with valid employee IDs
// so the employees exist when we sync data from the filefeed flow.
const employeeIdsForBenefitsSchema = [
  19255, 19255, 19306, 19302, 19077, 19077, 19126, 19126, 19263, 19347, 19346,
  19345, 19131, 19129, 19266, 19332, 19168, 19299, 19244, 19254, 19239, 19305,
  19173, 19229, 19298, 19359, 19358, 19357, 19356, 19355, 19354, 19353, 19352,
  19205, 19351, 19350, 19349, 19348, 19135, 19135, 19135, 19135, 19134, 19134,
  19134, 19134, 19134, 19133, 19133, 19133, 19133, 19326, 19326, 19326, 19198,
  19198, 19198, 19198, 19198, 19132, 19132, 19132, 19132, 19132, 19387, 19387,
  19387, 19276, 19276, 19275, 19275, 19275, 19275, 19274, 19274, 19274, 19274,
  19274, 19381, 19381, 19381, 19312, 19311, 19310, 19310, 19242, 19242, 19242,
  19242, 19386, 19386, 19385, 19385, 19384, 19384, 19383, 19383, 19383, 19382,
  19079, 19079, 19079, 19079, 19079, 19296, 19295, 19293, 19293, 19293, 19292,
  19292, 19292, 19291, 19291, 19291, 19238, 19238, 19238, 19238, 19238, 19140,
  19140, 19140, 19140, 19140, 19139, 19139, 19139, 19139, 19139, 19231, 19231,
  19231, 19231, 19390, 19391, 19416, 19416, 19376, 19185, 19125, 19122, 19279,
  19378, 19428, 19429, 19432, 19433, 19284, 19127, 19180, 19435, 19444, 19169,
  19167, 19227, 19473, 19474, 19475, 19476, 19477, 19252, 19202, 19245, 19224,
  19236, 19228, 19183, 19203, 19160, 19380, 19131, 19129, 19266, 19332, 19168,
  19299, 19244, 19254, 19239, 19305, 19173, 19229, 19298, 19205, 19135, 19135,
  19134, 19133, 19133, 19326, 19326, 19198, 19198, 19132, 19132, 19387, 19387,
  19276, 19276, 19275, 19275, 19274, 19381, 19381, 19312, 19312, 19311, 19311,
  19310, 19310, 19242, 19386, 19386, 19385, 19384, 19384, 19383, 19383, 19079,
  19079, 19296, 19295, 19295, 19293, 19292, 19292, 19291, 19291, 19238, 19238,
  19140, 19140, 19139, 19139, 19231, 19393, 19393, 19392, 19392, 19392, 19374,
  19374, 19373, 19373, 19372, 19372, 19322, 19322, 19307, 19307, 19303, 19303,
  19301, 19301, 19300, 19300, 19409, 19409, 19408, 19408, 19407, 19407, 19407,
  19406, 19406, 19403, 19403, 19403, 19402, 19402, 19401, 19401, 19400, 19400,
  19399, 19399, 19398, 19398, 19397, 19397, 19395, 19395, 19394, 19394, 19396,
  19396, 19297, 19297, 19297, 19206, 19206, 19130, 19130, 19178, 19178, 19178,
  19405, 19405, 19404, 19429, 19404, 19404, 19284, 19127, 19180, 19444, 19169,
  19167, 19227, 19287, 19121, 19184, 19286, 19315, 19278, 19285, 19186, 19189,
  19196, 19138, 19208, 19187, 19136, 19076, 19137, 19489, 19491, 19492, 19288,
  19316, 19494, 19495, 19496, 19490, 19497, 19498, 19499, 19169, 19167, 19227,
  19019, 19020, 19038, 19021, 19041, 19008, 19050, 19016, 19035, 19013, 19063,
  19068, 19030, 19054, 19066, 19065, 19024, 19011, 19023, 19080, 19007, 19014,
  19046, 19026, 19025, 19018, 19056, 19036, 19039, 19051, 19074, 19034, 19047,
  19029, 19073, 19010, 19001, 19049, 19022, 19070, 19006, 19043, 19055, 19064,
  19058, 19048, 19045, 19071, 19027, 19012, 19059, 19031, 19062, 19044, 19033,
  19037, 19052, 19103, 19103, 19032, 19032, 19075, 19075, 19075, 19140, 19133,
  19198, 19134, 19142, 19225, 19237, 19242, 19243, 19241, 19002, 19002, 19002,
  19072, 19072, 19238, 19250, 19276, 19275, 19274, 19271, 19271, 19277, 19277,
  19257, 19257, 19104, 19104, 19247, 19247, 19248, 19248, 19249, 19003, 19003,
  19004, 19004, 19086, 19086, 19069, 19069, 19017, 19017, 19042, 19042, 19060,
  19060, 19009, 19009, 19040, 19040, 19040, 19028, 19028, 19028, 19061, 19061,
  19194, 19194, 19194, 19098, 19098, 19252, 19087, 19090, 19053, 19053, 19053,
  19005, 19005, 19005, 19290, 19157, 19082, 19084, 19092, 19092, 19293, 19289,
  19015, 19246, 19246, 19219, 19220, 19182, 19164, 19304, 19253, 19270, 19260,
  19139, 19132, 19295, 19311, 19310, 19135, 19292, 19291, 19079, 19231, 19326,
  19239, 19127, 19129, 19305, 19131, 19296, 19347, 19346, 19345, 19131, 19129,
  19266, 19332, 19168, 19299, 19244, 19254, 19239, 19305, 19173, 19229, 19298,
  19359, 19358, 19357, 19356, 19355, 19354, 19353, 19352, 19205, 19351, 19350,
  19349, 19348, 19153, 19147, 19152, 19152, 19155, 19151, 19156, 19156, 19150,
  19150, 19154, 19154, 19148, 19148, 19106, 19376, 19185, 19125, 19122, 19279,
  19378, 19284, 19127, 19180, 19077, 19444, 19169, 19167, 19227, 19476, 19481,
  19482, 19483, 19485, 19486, 19491, 19492, 19493, 19288, 19316, 19494, 19490,
  19497, 19498, 19499, 19387, 19386, 19385, 19384, 19383, 19296, 19020, 19117,
  19002, 19111, 19191, 19012, 19008, 19008, 19001, 19117, 19109, 19103, 19073,
  19072, 19075, 19020, 19119, 19119, 19030, 19108, 19017, 19112, 19112, 19118,
  19037, 19042, 19042, 19015, 19046, 19105, 19105, 19001, 19255, 19255, 19306,
  19306, 19302, 19302, 19077, 19077, 19126, 19126, 19263, 19263, 19390, 19390,
  19391, 19391, 19416, 19419, 19430, 19430, 19431, 19431, 19432, 19284, 19127,
  19180, 19303, 19403, 19405, 19404, 19297, 19407, 19178, 19396, 19401, 19374,
  19301, 19307, 19408, 19409, 19398, 19393, 19397, 19402, 19395, 19300, 19400,
  19392, 19394, 19435, 19427, 19167, 19333, 19333, 19448, 19448, 19448, 19452,
  19334, 19334, 19186, 19138, 19137, 19208, 19187, 19136,
];

export const upsertEmployees = async (organizationId: string) => {
  const employeeTypeId = (
    (await prismaClient.employeeType.findFirst()) as EmployeeType
  ).id;
  const hireDate = DateTime.now().toJSDate();
  const endEmploymentDate = null;
  const positionTitle = "Sales Rep";
  const defaultWeeklyHours = 40;
  const scheduledWeeklyHours = 40;
  const jobId = (await prismaClient.job.findFirst({
    where: {
      organizationId,
    },
  }))!.id;

  const managerEmployeeId = "20000";
  const startingEmployeeId = 20001;

  const data: Parameters<typeof upsertEmployee>[0] = {
    organizationId,
    // Want a realistic employee ID without taking one that is in the sample data.
    // Sample data starts at 21000
    employeeId: managerEmployeeId,
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    hireDate,
    endEmploymentDate,
    positionTitle,
    employeeTypeId,
    defaultWeeklyHours,
    scheduledWeeklyHours,
    jobId,
  };
  const manager: Employee = await upsertEmployee(data);

  const directReports = Array.from({ length: 5 }).map(
    async (_element, index) => {
      // Pre-seed a couple employees with employeeIDs we can validate against in the config.
      await upsertEmployee({
        ...data,
        employeeId: (startingEmployeeId + index).toString(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        managerId: manager.id,
      });
    }
  );

  await Promise.all(directReports);

  const uniqueBenefitEmployeeIds = [...new Set(employeeIdsForBenefitsSchema)];
  const benefitEmployees = uniqueBenefitEmployeeIds.map(async (employeeId) => {
    await upsertEmployee({
      ...data,
      employeeId: employeeId.toString(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      managerId: manager.id,
    });
  });

  await Promise.all(benefitEmployees);
};

const upsertUser = async () => {
  const companyName = "Company Name";

  const orgData = {
    companyName,
  };

  const organization = await prismaClient.organization.upsert({
    where: {
      id: randomUUID(),
      companyName,
    },
    create: orgData,
    update: {},
  });

  const data = {
    firstName: "First Name",
    lastName: "Last Name",
    email: "email@email.com",
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
