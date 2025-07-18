import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { envValidationMiddleware } from "./lib/env-validation-middleware";

export function middleware(request: NextRequest) {
  // Skip validation during build time
  if (process.env.NEXT_PHASE || process.env.VERCEL) {
    return NextResponse.next();
  }

  // First, validate environment variables
  const envValidationResult = envValidationMiddleware(request);
  if (envValidationResult) {
    return envValidationResult;
  }

  // If environment validation passes, continue with other middleware
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
