import { Record } from "./flatfile-legacy";
import { prismaClient } from "./prisma-client";
import { JobFamily } from "@prisma/client";

// TODO: Temp solution until we get more of the fields in the config
const jobSheetMapping = {
  slug: "jobCode",
  name: "jobName",
  department: "jobDept",
  effectiveDate: "effectiveDate",
  isInactive: "inactive",
};

export const upsertJob = async ({
  organizationId,
  slug,
  name,
  department,
  effectiveDate,
  isInactive,
}: {
  organizationId: string;
  slug: string;
  name: string;
  department: string;
  effectiveDate: Date;
  isInactive: boolean;
}) => {
  const job = await prismaClient.job.upsert({
    where: {
      organizationId_slug: {
        organizationId,
        slug,
      },
    },
    create: {
      organizationId,
      slug,
      name,
      department,
      effectiveDate,
      isInactive,
    },
    update: {},
  });

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
      AND column_name NOT ILIKE '%id'
  `;

  const requiredFields = result.map((r) => r.column_name);

  // console.log("requiredFields", requiredFields);

  // Record is valid if every required field is valid
  return records.filter((r) => {
    // console.log("r", r);
    return requiredFields.every((f) => {
      const field = jobSheetMapping[f as keyof typeof jobSheetMapping];

      return r.values[field]?.valid;
    });
  });
};

export const upsertJobRecords = async (
  validJobs: Record[],
  { userId, organizationId }: { userId: string; organizationId: string }
) => {
  const upserts = validJobs.map(async (r) => {
    try {
      let data: Parameters<typeof upsertJob>[0] = {
        organizationId: organizationId,
        slug: r.values.jobCode.value as string,
        name: r.values.jobName.value as string,
        department: r.values.jobDept.value as string,
        effectiveDate: new Date(r.values.effectiveDate.value as string),
        isInactive: r.values.inactive.value === "y",
      };

      await upsertJob(data);
    } catch (error) {
      console.error(
        `Error: syncing job record for user ${userId}, record ${r.id}`,
        error
      );
    }
  });

  await Promise.all(upserts);
};
