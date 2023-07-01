import { RecordWithLinks } from "@flatfile/api/api";
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
    update: { organizationId, slug, name },
  });

  return benefitPlan;
};

export const upsertBenefitPlanRecords = async (
  benefitPlans: RecordWithLinks[],
  { userId, organizationId }: { userId: string; organizationId: string }
) => {
  const upserts = benefitPlans.map(async (r) => {
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
