import { prismaClient } from '../../../lib/prisma-client';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  
  const countries = await prismaClient.country.findMany();  

  const listCountries = countries.map(country => {
    return {
      id: country.id,
      createdAt: country.createdAt,
      updatedAt: country.updatedAt,
      name: country.name
    }
  })

  res.send({listCountries})
}
