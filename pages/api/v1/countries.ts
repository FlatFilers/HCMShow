import { prismaClient } from '../../../lib/prisma-client';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  
  const countries = await prismaClient.country.findMany();  

  res.send({countries})
}
