import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options

export const authOptions: NextAuthOptions = {
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      // @ts-ignore This requires some await call that we are bypassing
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied

        const prisma = new PrismaClient();
        const res = await prisma.user.findUnique({
          where: {
            email: credentials!.email,
            password: credentials!.password,
            // TODO: Add password scheme to hash password
          },
        });
        const result = res.json();


        if (res.ok && result) {
          return result.response.user
        }

        return null;
      },
    }),
  ],
  jwt: {
    secret: "blah",
  },
};

export default NextAuth(authOptions);
