import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server'

// config determines which paths are authed by the [...nextauth].ts file.] 

// Then the authorized callback, when returning true, will hit the middleware. Returning false will redirect to the signin page.

export default withAuth(
  function middleware(req) {
    // return console.log("authhed", req.nextauth.token);
  },
  {
    callbacks: {
      authorized: ({ req,token }) => {
        if (req.nextUrl.pathname === "/") {

          return true;
        }

        return !!token;
      },
    },
  }
);

// matcher is a list of authed paths. 

// Added regex below that reverses that and says to auth all routes except these
// To add a route, add a standpipe to the end of the last path and add the new path
// ie ["/((?!auth/signin).*)"] -> ["/((?!auth/signin|NEW_ROUTE).*)"] 
export const config = {
  matcher: ["/((?!auth/signin).*)"],
};
