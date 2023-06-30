import { EmployeeBenefitPlan } from "@prisma/client";
import { prismaClient } from "./prisma-client";
import { DateTime } from "luxon";
import { upsertBenefitPlan } from "./benefit-plan";
import { RecordsWithLinks } from "@flatfile/api/api";

const stringToSlug = (s: string) => {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove non-word, non-space, non-hyphen characters
    .replace(/[\s]+/g, "-") // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading and trailing hyphens
};

export const upsertEmployeeBenefitPlanRecords = async (
  benefitPlans: RecordsWithLinks,
  { userId, organizationId }: { userId: string; organizationId: string }
) => {
  const upserts = benefitPlans.map(async (r) => {
    try {
      // Upsert benefit plan
      const benefitPlan = await upsertBenefitPlan({
        organizationId,
        slug: stringToSlug(r.values.benefitPlan.value as string),
        name: r.values.benefitPlan.value as string,
      });

      const employee = await prismaClient.employee.findUnique({
        where: {
          organizationId_employeeId: {
            organizationId,
            employeeId: r.values.employeeId.value as string,
          },
        },
      });

      if (!employee) {
        throw new Error(
          `Employee ${r.values.employeeId.value} not found in organization ${organizationId}`
        );
      }

      let data: Parameters<typeof upsertEmployeeBenefitPlan>[0] = {
        employeeId: employee.id,
        benefitPlanId: benefitPlan.id,
        currentlyEnrolled: r.values.currentlyEnrolled.value as boolean,
        coverageBeginDate: DateTime.fromISO(
          r.values.coverageStartDate.value as string
        ).toJSDate(),
        employeerContribution: parseFloat(
          r.values.employerContribution.value as string
        ),
        benefitCoverageType: r.values.benefitCoverageType.value as string,
      };

      return await upsertEmployeeBenefitPlan(data);
    } catch (error) {
      console.error(
        `Error syncing employee benefit plan for user ${userId}, record ${r.id}: `,
        error
      );
    }
  });

  const result = await Promise.all(upserts);

  return result.filter((r) => r !== undefined).length;
};

export const upsertEmployeeBenefitPlan = async (
  data: Omit<EmployeeBenefitPlan, "createdAt" | "updatedAt">
) => {
  const { employeeId, benefitPlanId } = data;

  const benefitPlan = await prismaClient.employeeBenefitPlan.upsert({
    where: {
      employeeId_benefitPlanId: {
        employeeId,
        benefitPlanId,
      },
    },
    create: data,
    update: {},
  });

  return benefitPlan;
};
