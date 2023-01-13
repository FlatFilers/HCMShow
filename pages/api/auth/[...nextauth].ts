import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient, User } from "@prisma/client";
import * as bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

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
        const user: User | null = await prisma.user.findUnique({
          where: {
            email: credentials!.email,
          },
        });

        if (!user) {
          throw new Error("Email address is not valid. Please try again.");
        }

        const pwIsValid = await bcrypt.compare(
          credentials!.password,
          user!.password
        );

        console.log(pwIsValid);
        

        if (!pwIsValid) {
          throw new Error("Password is invalid. Please try again.");
        }

        return user;
      },
    }),
  ],
  jwt: {
    // TODO
    secret: "boop",
  },
  pages: {
    error: "/",
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }: any) {
      // console.log("JWTJWTJWTJWTJWTJWTJWTJWTJWTJWTJWTJWTJWTJWT");
      // console.log("account", account);
      // console.log("token", token);
      // console.log("user", user);
      // console.log("account", account);
      // console.log("profile", profile);
      // console.log("isNewUser", isNewUser);
      const payload = {
        email: token.email,
      };
      const signOptions: any = {
        expiresIn: "30d",
      };
      token.alg = "HS256";
      const access_token = await jwt.sign(payload, "boop", signOptions);

      token.authenticationToken = access_token;
      
      return token;
    },
    async session({ session, user, token }: any) {
      // console.log("SESSIONSESSIONSESSIONSESSIONSESSIONSESSION");
      // console.log("user", user);
      // console.log("session", session);
      // console.log("token", token);
      // console.log('token',token);
      session.jwt = {
        email: token.email,
        iat: token.iat,
        exp: token.exp,
      };
      session.authenticationToken = token.authenticationToken;
      session.token = token
      
      return session;
    },
  },
};

export default NextAuth(authOptions);
