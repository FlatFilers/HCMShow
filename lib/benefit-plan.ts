import { Record } from "./flatfile-legacy";
import { prismaClient } from "./prisma-client";

const benefitPlanSheetMapping = {
  slug: "benefitPlanId",
  name: "benefitPlanName",
};

export const upsertBenefitPlan = async ({
  organizationId,
  slug,
  name,
}: {
  organizationId: string;
  slug: string;
  name: string;
}) => {
  const benefitPlan = await prismaClient.benefitPlan.upsert({
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
    },
    update: {},
  });

  return benefitPlan;
};

export const validBenefitPlanRecords = async (records: Record[]) => {
  // Find required fields
  const result: { column_name: string }[] = await prismaClient.$queryRaw`
    SELECT column_name 
    FROM information_schema.columns
    WHERE table_name = 'BenefitPlan'
      AND is_nullable = 'NO'
      AND column_name NOT IN ('createdAt', 'updatedAt')
      AND column_name NOT ILIKE '%id'
  `;

  const requiredFields = result.map((r) => r.column_name);

  console.log("requiredFields", requiredFields);

  // Record is valid if every required field is valid
  return records.filter((r) => {
    console.log("r", r);
    return requiredFields.every((f) => {
      const field =
        benefitPlanSheetMapping[f as keyof typeof benefitPlanSheetMapping];

      return r.values[field]?.valid;
    });
  });
};

export const upsertBenefitPlanRecords = async (
  validBenefitPlans: Record[],
  { userId, organizationId }: { userId: string; organizationId: string }
) => {
  const upserts = validBenefitPlans.map(async (r) => {
    try {
      let data: Parameters<typeof upsertBenefitPlan>[0] = {
        organizationId: organizationId,
        slug: r.values.benefitPlanId.value as string,
        name: r.values.benefitPlanName.value as string,
      };

      await upsertBenefitPlan(data);
    } catch (error) {
      console.error(
        `Error: syncing benefit plan record for user ${userId}, record ${r.id}`,
        error
      );
    }
  });

  await Promise.all(upserts);
};
