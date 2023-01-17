export { default } from "next-auth/middleware";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";


// export function middleware(request: NextRequest) {
//   
// }

// Able to set specific pages that the middleware will run on 
export const config = {
  matcher: [
    "/dashboard",
    "/employees",
    "/employees/:path*",
    "/imports",
  ],
};