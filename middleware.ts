import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";
import { homeNavItem } from "./components/sidebar-layout";

// The authorized callback, when returning true, will hit the middleware. Returning false will redirect to the signin page.

export default withAuth(
  function middleware(req) {
    // console.log("requestNextAuthToken", req.nextauth.token);
    if (
      req.nextauth.token &&
      (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/signup")
    ) {
      console.log("middleware redirecting");

      const homeItem = homeNavItem();
      return NextResponse.redirect(new URL(homeItem.href, req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname === "/signup" ||
          req.nextUrl.pathname === "/api/health_check" ||
          req.nextUrl.pathname === "/api/seeds" ||
          req.nextUrl.pathname.includes("/images") ||
          req.nextUrl.pathname.includes("api/v1") ||
          req.nextUrl.pathname.includes("api/auth")
        ) {
          return true;
        }

        return !!token;
      },
    },
  }
);
