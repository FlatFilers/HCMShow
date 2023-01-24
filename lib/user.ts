import { Prisma, PrismaClient, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { seedNewAccount } from "./seeds/main";

const prisma = new PrismaClient();

export const findUser = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
};

const createUser = async (email: string, plaintextPassword: string) => {
  try {
    const organization = await prisma.organization.create({
      data: {
        email: email,
      },
    });

    return await prisma.user.create({
      data: {
        email: email,
        password: await hashPassword(plaintextPassword),
        organization: {
          connect: {
            id: organization.id,
          },
        },
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (e.code === "P2002") {
        console.log("Unique constraint violation", e);

        throw new Error("Email already exists");
      }
    }
    throw e;
  }
};

export const setupNewAccount = async (
  email: string,
  plaintextPassword: string
) => {
  const user = await createUser(email, plaintextPassword);

  await seedNewAccount(user);

  return user;
};

export const isValidPassword = async (user: User, password: string) => {
  return await bcrypt.compare(password, user.password);
};

export const hashPassword = async (
  plaintextPassword: string
): Promise<string> => {
  return await bcrypt.hash(plaintextPassword, 16);
};
