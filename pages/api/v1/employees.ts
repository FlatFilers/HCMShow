import { prismaClient } from "../../../lib/prisma-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSpaceForFlatfileSpaceId } from "../../../lib/space";

/**
 * @swagger
 * /employees:
 *   get:
 *     tags: [/api/v1/]
 *     summary: Returns a list of employee IDs for a space. Used to validate employee IDs in the Flatfile config.
 *     parameters:
 *       - name: spaceId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           description: Identifier of the space
 *     responses:
 *       200:
 *         description: List of employee IDs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const serverAuthToken = req.headers["x-server-auth"];

  if (!serverAuthToken || serverAuthToken !== process.env.SERVER_AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const spaceId = req.query.spaceId as string;

  const space = await getSpaceForFlatfileSpaceId(spaceId);

  const user = await prismaClient.user.findUnique({
    where: {
      id: space.userId,
    },
  });

  if (!user) {
    throw new Error(`No user found for space ${spaceId}`);
  }

  const employees = await prismaClient.employee.findMany({
    where: {
      organizationId: user.organizationId,
    },
    select: { employeeId: true },
  });

  const result = employees.map((e) => e.employeeId);

  res.send(result);
}
