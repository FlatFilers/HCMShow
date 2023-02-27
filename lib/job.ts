import { faker } from "@faker-js/faker";
import { Record } from "./flatfile";
import { prismaClient } from "./prisma-client";
import { JobFamily } from "@prisma/client";
import { Job } from "@prisma/client";
import { DateTime } from "luxon";
import { JWT } from "next-auth/jwt";

// TODO: Temp solution until we get more of the fields in the config
const jobSheetMapping = {
  slug: "jobCode",
  effectiveDate: "effectiveDate",
  isInactive: "inactive",
  name: "jobName",
  includeJobCodeInName: "includeJobCodeInName",
  title: "privateTitle",
  summary: "jobSummary",
  description: "jobDescription",
  additionalDescription: "additionalJobDescription",
  workShift: "workShiftRequired",
  jobPublic: "publicJob",
  jobFamily: "jobFamily",
};

export const upsertJob = async ({
  slug,
  name,
  effectiveDate,
  isInactive,
  includeJobCodeInName,
  title,
  summary,
  description,
  additionalDescription,
  workShift,
  jobPublic,
  jobFamilyId,
}: {
  slug: string;
  name: string;
  effectiveDate: Date;
  isInactive: boolean;
  includeJobCodeInName?: boolean;
  title: string | undefined;
  summary: string;
  description: string;
  additionalDescription?: string;
  workShift?: boolean;
  jobPublic: boolean;
  jobFamilyId?: string;
}) => {
  const job = await prismaClient.job.upsert({
    where: {
      slug,
    },
    create: {
      slug,
      name,
      effectiveDate,
      isInactive,
      includeJobCodeInName,
      title,
      summary,
      description,
      additionalDescription,
      workShift,
      jobPublic,
      jobFamilyId,
    },
    update: {},
  });

  // await prismaClient.job.update({
  //   where: {
  //     jobId,
  //   },
  //   data: {
  //     addresses: {
  //       connectOrCreate: addresses.map((a) => {
  //         return {
  //           where: {
  //             addressId_employeeId: {
  //               addressId: a.id,
  //               employeeId: employee.id,
  //             },
  //           },
  //           create: {
  //             addressId: a.id,
  //           },
  //         };
  //       }),
  //     },
  //   },
  // });

  return job;
};

export const validJobRecords = async (records: Record[]) => {
  // Find required fields
  const result: { column_name: string }[] = await prismaClient.$queryRaw`
    SELECT column_name 
    FROM information_schema.columns
    WHERE table_name = 'Job'
      AND is_nullable = 'NO'
      AND column_name NOT IN ('createdAt', 'updatedAt', 'slug')
      AND (column_name = 'name' OR column_name NOT ILIKE '%id')
  `;

  const requiredFields = result.map((r) => r.column_name);
  requiredFields.push("jobFamily");

  // Record is valid if every required field is valid
  return records.filter((r) => {
    return requiredFields.every((f) => {
      const field = jobSheetMapping[f as keyof typeof jobSheetMapping];

      return r.values[field]?.valid;
    });
  });
};

export const upsertJobRecords = async (validJobs: Record[], token: JWT) => {
  const upserts = validJobs.map(async (r) => {
    try {
      let jobFamilyId;
      jobFamilyId = (
        (await prismaClient.jobFamily.findUnique({
          where: { slug: r.values.jobFamily.value as string },
        })) as JobFamily
      ).id;

      let data: Parameters<typeof upsertJob>[0] = {
        slug: r.values.jobCode.value as string,
        name: r.values.jobName.value as string,
        effectiveDate: new Date(r.values.effectiveDate.value as string),
        isInactive: r.values.inactive.value === "y",
        includeJobCodeInName: r.values.includeJobCodeInName?.value === "y",
        title: r.values.privateTitle?.value as string,
        summary: r.values.jobSummary.value as string,
        description: r.values.jobDescription.value as string,
        additionalDescription: r.values.additionalJobDescription
          ?.value as string,
        workShift: r.values.workShiftRequired?.value === "y",
        jobPublic: r.values.publicJob.value === "y",
        jobFamilyId: jobFamilyId,
      };

      await upsertJob(data);
    } catch (error) {
      console.error(
        `Error: syncing record for user ${token.sub}, record ${r.id}`,
        error
      );
    }
  });

  await Promise.all(upserts);
};
