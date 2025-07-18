import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// NextAuth.js handles callbacks automatically at /api/auth/[...nextauth]
// This endpoint can be used for custom callback logic if needed
export async function GET(request: NextRequest) {
  // Custom callback logic can go here
  // For most cases, NextAuth.js handles this automatically
  return NextResponse.redirect(new URL("/", request.url));
}
