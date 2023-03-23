import { prismaClient } from "../../lib/prisma-client";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  status: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  let flash;
  try {
    await prismaClient.employee.deleteMany();
    await prismaClient.job.deleteMany();

    console.log("Database cleared");
    flash = "success";
  } catch (error) {
    console.error(error);
    flash = "failure";
  }

  const message =
    flash === "success" ? "Database cleared" : "Failed to clear database";

  res.redirect(`/activity-log?flash=${flash}&message=${message}`);
}
