// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { prismaClient } from "../../lib/prisma-client";
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  status: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  await prismaClient.$queryRaw`SELECT 1;`;

  res.status(200).json({
    status: 'Healthy',
  })
}
