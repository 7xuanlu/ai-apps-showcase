import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// NextAuth.js handles logout automatically at /api/auth/signout
// This endpoint redirects to the NextAuth signout page
export async function GET(request: NextRequest) {
  const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/';
  const signoutUrl = new URL('/api/auth/signout', request.url);
  signoutUrl.searchParams.set('callbackUrl', callbackUrl);
  
  return NextResponse.redirect(signoutUrl);
} 