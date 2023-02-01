import { prismaClient } from '../../lib/prisma-client';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  
  const countries = await prismaClient.country.findMany();  

  const validCountries = countries.reduce((acc, country) => {
    req.body.countries.includes(country.name) ? acc.push(country.name) : null;

    return acc;
  }, [] as string[]);

  res.send({validCountries})
}
