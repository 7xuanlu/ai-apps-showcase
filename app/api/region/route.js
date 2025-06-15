import { NextResponse } from 'next/server';

export async function GET() {
  const region = process.env.SPEECH_SERVICE_SUBSCRIPTION_REGION;
  return new NextResponse(region, { status: 200 });
} 