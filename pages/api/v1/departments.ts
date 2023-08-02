import { prismaClient } from "../../../lib/prisma-client";
import type { NextApiRequest, NextApiResponse } from "next";
import { Department, PrismaClient } from "@prisma/client";
import { SerializeableDepartment } from "../../departments";

/**
 * @swagger
 * departments:
 *   get:
 *     tags: [/api/v1/]
 *     summary: Returns a list of departments. Used to pre-seed departments data in the Project Onboarding flow.
 *     parameters:
 *       - name: x-server-auth
 *         in: header
 *         required: true
 *         schema:
 *           type: string
 *           description: Server authentication token
 *     responses:
 *       200:
 *         description: List of departments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Department'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Department ID
 *         departmentName:
 *           type: string
 *           description: Name of the department
 *         departmentCode:
 *           type: string
 *           description: Code of the department
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const serverAuthToken = req.headers["x-server-auth"];

  if (!serverAuthToken || serverAuthToken !== process.env.SERVER_AUTH_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const dbDepartment: Department[] = await prismaClient.department.findMany();

  const departments: SerializeableDepartment[] = dbDepartment.map(
    (department) => {
      return {
        id: department.id,
        departmentName: department.departmentName,
        departmentCode: department.departmentCode,
      };
    }
  );

  return res.status(200).json(departments);
}
