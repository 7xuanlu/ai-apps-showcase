import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import xmlbuilder from 'xmlbuilder';

export async function POST(request) {
  try {
    const { text, lang = 'en-US', voice = 'en-US-JennyNeural', style = 'neutral' } = await request.json();

    // Get Azure Speech Service credentials from environment variables
    const subscriptionKey = process.env.SPEECH_SERVICE_SUBSCRIPTION_KEY;
    const region = process.env.SPEECH_SERVICE_SUBSCRIPTION_REGION;

    if (!subscriptionKey || !region) {
      return NextResponse.json(
        { error: 'Azure Speech Service credentials not configured' },
        { status: 500 }
      );
    }

    // Get access token
    const tokenResponse = await fetch(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const accessToken = await tokenResponse.text();

    // Create SSML with style
    const ssml = xmlbuilder.create('speak')
      .att('version', '1.0')
      .att('xmlns', 'http://www.w3.org/2001/10/synthesis')
      .att('xmlns:mstts', 'https://www.w3.org/2001/mstts')
      .att('xml:lang', lang)
      .ele('voice')
      .att('name', voice)
      .ele('mstts:express-as')
      .att('style', style)
      .txt(text)
      .end();

    // Convert text to speech
    const ttsResponse = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
          'User-Agent': 'AzureSpeechServiceSuite',
        },
        body: ssml,
      }
    );

    if (!ttsResponse.ok) {
      throw new Error('Failed to convert text to speech');
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to convert text to speech' },
      { status: 500 }
    );
  }
} 