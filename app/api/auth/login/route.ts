import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// NextAuth.js handles login automatically at /api/auth/signin
// This endpoint redirects to the NextAuth signin page
export async function GET(request: NextRequest) {
  const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/';
  const signinUrl = new URL('/api/auth/signin', request.url);
  signinUrl.searchParams.set('callbackUrl', callbackUrl);
  
  return NextResponse.redirect(signinUrl);
} 