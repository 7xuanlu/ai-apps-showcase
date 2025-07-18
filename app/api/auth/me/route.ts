import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth";
import type { Session } from "next-auth";

export async function GET() {
  try {
    const session = (await getServerSession(authConfig)) as Session | null;

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json(session.user);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
