import { PrismaClient, User } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const findUser = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

export const createUser = async (email: string, plaintextPassword: string) => {
  return await prisma.user.create({
    data: {
      email: email,
      password: await hashPassword(plaintextPassword),
    },
  });
};

export const isValidPassword = async (user: User, password: string) => {
  return await bcrypt.compare(password, user.password);
};

export const hashPassword = async (
  plaintextPassword: string
): Promise<string> => {
  return await bcrypt.hash(plaintextPassword, 16);
};
