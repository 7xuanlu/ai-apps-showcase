import { getServerSession } from 'next-auth';
import { NextResponse } from "next/server";
import authConfig from "@/auth";
import type { Session } from 'next-auth';

export async function GET() {
  const session = await getServerSession(authConfig) as Session | null;
  
  return NextResponse.json({
    authenticated: !!session,
    user: session?.user || null,
    timestamp: new Date().toISOString()
  });
} 