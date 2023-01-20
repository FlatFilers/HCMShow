import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// The authorized callback, when returning true, will hit the middleware. Returning false will redirect to the signin page.

export default withAuth(
  function middleware(req) {
    // return console.log("authhed", req.nextauth.token);
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname === "/signup" ||
          req.nextUrl.pathname.includes("api/auth")
        ) {
          return true;
        }

        return !!token;
      },
    },
  }
);
