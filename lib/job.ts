import { RecordsWithLinks } from "@flatfile/api/api";
import { Record } from "./flatfile-legacy";
import { prismaClient } from "./prisma-client";
import { JobFamily } from "@prisma/client";
import { DateTime } from "luxon";

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
    update: {
      slug,
      name,
      department,
      effectiveDate,
      isInactive,
    },
  });

  return job;
};

export const upsertJobRecords = async (
  jobs: RecordsWithLinks,
  { userId, organizationId }: { userId: string; organizationId: string }
) => {
  const upserts = jobs.map(async (r) => {
    const isDateInYMDFormat = (dateStr: string) => {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      return regex.test(dateStr);
    };

    const effectiveDate = isDateInYMDFormat(
      r.values.effectiveDate.value as string
    )
      ? DateTime.fromFormat(
          r.values.effectiveDate.value as string,
          "yyyy-MM-dd"
        ).toJSDate()
      : DateTime.fromISO(r.values.effectiveDate.value as string).toJSDate();
    try {
      let data: Parameters<typeof upsertJob>[0] = {
        organizationId: organizationId,
        slug: r.values.jobCode.value as string,
        name: r.values.jobName.value as string,
        department: r.values.jobDept.value as string,
        effectiveDate: effectiveDate,
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
