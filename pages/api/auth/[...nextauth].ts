import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createUser, findUser, isValidPassword } from "../../../lib/user";

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
        isSignup: { label: "isSignup", type: "hidden" },
      },

      // @ts-ignore This requires some await call that we are bypassing
      async authorize(credentials, req) {
        if (!credentials) {
          throw new Error("Enter an email and password");
        }

        if (credentials?.isSignup === "true") {
          console.log("signup flow");

          return await createUser(credentials.email, credentials.password);
        } else {
          console.log("login flow");
          const user = await findUser(credentials.email);

          if (!user) {
            throw new Error("Email address is not valid. Please try again.");
          }

          if (!isValidPassword(user, credentials.password)) {
            throw new Error("Password is invalid. Please try again.");
          }

          return user;
        }
      },
    }),
  ],
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  callbacks: {
    async jwt({ token, user, account, profile, isNewUser }: any) {
      // console.log("token", token);
      // console.log("user", user);
      // console.log("account", account);
      // console.log("profile", profile);
      // console.log("isNewUser", isNewUser);

      return token;
    },
    async session({ session, user, token }: any) {
      // console.log("user", user);
      // console.log("session", session);
      // console.log("token", token);
      // console.log('token',token);

      session.user = {
        sub: token.sub,
        email: token.email,
      };

      return session;
    },
  },
};

export default NextAuth(authOptions);
