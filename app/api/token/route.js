import { NextResponse } from 'next/server';
import fetch from 'node-fetch';

export async function POST() {
  try {
    const key = process.env.SPEECH_SERVICE_SUBSCRIPTION_KEY;
    const region = process.env.SPEECH_SERVICE_SUBSCRIPTION_REGION;
    const url = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
    const options = {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
      },
    };
    const tokenRes = await fetch(url, options);
    const token = await tokenRes.text();
    return new NextResponse(token, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get token' }, { status: 500 });
  }
} 