import { faker } from "@faker-js/faker";
import { Record } from "./flatfile";
import { prismaClient } from "./prisma-client";
import { JobFamily } from "@prisma/client";
import { Job } from "@prisma/client";
import { DateTime } from "luxon";
import { JWT } from "next-auth/jwt";

// TODO: Temp solution until we get more of the fields in the config
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
      AND column_name NOT IN ('createdAt', 'updatedAt')
      AND (column_name = 'jobId' OR column_name NOT ILIKE '%id')
  `;
  const requiredFields = result.map((r) => r.column_name);

  // Record is valid if every required field is valid
  return records.filter((r) => {
    return requiredFields.every((f) => r.values[f]?.valid);
  });
};

export const upsertJobRecords = async (validJobs: Record[], token: JWT) => {
  // const validsManagersFirst = validJobs.sort((a, b) => {
  //   return a.values.managerId.value ? 1 : -1;
  // });

  // // TODO - hacking this in to get seeds working then do this
  // const workerCompensationCodeId = (
  //   (await prismaClient.workerCompensationCode.findFirst(
  //     {}
  //   )) as WorkerCompensationCode
  // ).id;
  // const addresses = await prismaClient.address.findMany({
  //   take: 2,
  // });

  const upserts = validJobs.map(async (r) => {
    try {
      let jobFamilyId;
      jobFamilyId = (
        (await prismaClient.jobFamily.findUnique({
          where: { slug: r.values.jobFamily.value as string },
        })) as JobFamily
      ).id;

      let data: Parameters<typeof upsertJob>[0] = {
        slug: r.values.slug.value as string,
        name: r.values.name.value as string,
        effectiveDate: DateTime.fromFormat(
          r.values.effectiveDate.value as string,
          "L/d/yyyy"
        ).toJSDate(),
        isInactive: r.values.isInactive.value === "y",
        includeJobCodeInName: r.values.includeJobCodeInName.value === "y",
        title: r.values.title.value as string,
        summary: r.values.summary.value as string,
        description: r.values.description.value as string,
        additionalDescription: r.values.additionalDescription.value as string,
        workShift: r.values.workShift.value === "y",
        jobPublic: r.values.jobPublic.value === "y",
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
