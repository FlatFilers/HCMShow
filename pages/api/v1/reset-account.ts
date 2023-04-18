import type { NextApiRequest, NextApiResponse } from "next";
import { prismaClient } from "../../../lib/prisma-client";
import { getToken } from "next-auth/jwt";
import { main } from "../../../lib/seeds/main";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("/reset-account", req.body);

  const token = await getToken({
    req: req,
  });
  // console.log("gSSP token", token);

  if (!token?.sub) {
    throw new Error("No session");
  }

  const deleteSpaces = await prismaClient.space.deleteMany({
    where: {
      userId: token.sub,
    },
  });

  const deleteActions = await prismaClient.action.deleteMany({
    where: {
      userId: token.sub,
    },
  });

  const user = await prismaClient.user.findUnique({
    where: { id: token.sub },
    include: { organization: true },
  });
  const organizationId = user?.organizationId;
  const employees = await prismaClient.employee.findMany({
    where: { organizationId },
  });

  const deleteEmployeeBenefitPlan =
    await prismaClient.employeeBenefitPlan.deleteMany({
      where: {
        employeeId: {
          in: employees.map((e) => e.id),
        },
      },
    });

  const deleteEmployees = await prismaClient.employee.deleteMany({
    where: {
      organizationId,
    },
  });

  const deleteJobs = await prismaClient.job.deleteMany({
    where: {
      organizationId,
    },
  });

  const deleteBenefits = await prismaClient.benefitPlan.deleteMany({
    where: {
      organizationId,
    },
  });

  // Reseed the database
  await main();

  res.redirect(`/activity-log?flash=success&message=Account Reset`);
}
