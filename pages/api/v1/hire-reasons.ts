import { prismaClient } from "../../../lib/prisma-client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("validate hirereasons");
  console.log("req.body", req.body);
  const hireReasonStrings = JSON.parse(req.body) as string[];

  console.log("hireReasonStrings", hireReasonStrings);

  const hireReasons = await prismaClient.hireReason.findMany();

  const result = hireReasonStrings.map((s) => {
    const d = "Hire Employee > New Hire > New Position";

    const [classificationName, category, reason] = d.split(" > ");

    return {
      originalString: s,
      id: hireReasons.find(
        (h) =>
          h.classificationName === classificationName &&
          h.category === category &&
          h.reason === reason
      )?.id,
    };
  });

  res.send(result);
}
