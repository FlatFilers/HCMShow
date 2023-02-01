import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

// The authorized callback, when returning true, will hit the middleware. Returning false will redirect to the signin page.

export default withAuth(
  function middleware(req) {
    // console.log("requestNextAuthToken", req.nextauth.token);
    if (
      req.nextauth.token &&
      (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/signup")
    ) {
      console.log("middleware redirecting");

      return NextResponse.redirect(new URL("/employees", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname === "/signup" ||
          req.nextUrl.pathname === "api/health_check" ||
          req.nextUrl.pathname.includes("api/auth") ||
          req.nextUrl.pathname.includes("api/v1") ||
          req.nextUrl.pathname.includes("api/health_check")
        ) {
          return true;
        }

        return !!token;
      },
    },
  }
);
