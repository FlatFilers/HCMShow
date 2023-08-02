import { prismaClient } from "../../../lib/prisma-client";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const countries = await prismaClient.country.findMany();

  const listCountries = countries.map((country) => {
    return {
      name: country.name,
      type: country.type,
      code: country.code,
    };
  });

  res.send({ listCountries });
}
