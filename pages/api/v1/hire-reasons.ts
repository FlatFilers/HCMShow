import { prismaClient } from "../../../lib/prisma-client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = JSON.parse(req.body) as string[];
  const hireReasonStrings = Array.from(new Set(body));

  const hireReasons = await prismaClient.hireReason.findMany();

  const result = hireReasonStrings.map((s) => {
    const [classificationName, category, reason] = s.split(" > ");

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
