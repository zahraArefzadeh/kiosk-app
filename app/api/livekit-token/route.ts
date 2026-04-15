// src/app/api/livekit-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function POST(req: NextRequest) {
  try {
    // ✅ دریافت کلیدهای محرمانه از محیط (بدون NEXT_PUBLIC_)
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const LIVEKIT_URL = process.env.LIVEKIT_URL ;

    console.log('🔍 Environment check:', {
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      hasWsUrl: !!LIVEKIT_URL,
    });

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { 
          error: 'LiveKit configuration missing',
          details: 'LIVEKIT_API_KEY or LIVEKIT_API_SECRET not set'
        },
        { status: 500 }
      );
    }

    // ✅ دریافت body از request (اختیاری)
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    // 🆕 ایجاد room و participant یونیک
 
    
   const timestamp = Date.now();
const randomId = Math.random().toString(36).substr(2, 9);
const roomName = `room-${timestamp}-${randomId}`;   
    const participantName =  `user-${timestamp}`;
    const participantIdentity = body.participant_identity || participantName;

    console.log('🎫 Creating token for:', {
      roomName,
      participantName,
      participantIdentity,
    });

    // ✅ ساخت توکن با LiveKit SDK
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
      ttl: '15m',
    });

    // ✅ دادن دسترسی‌های لازم
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    // ✅ تولید JWT Token
    const token = await at.toJwt();

    console.log('✅ Token generated successfully:', {
      tokenPreview: token.substring(0, 20) + '...',
    });

    // ✅ برگرداندن اطلاعات اتصال
    return NextResponse.json({
      serverUrl: LIVEKIT_URL,
      participantToken: token,
      participantName,
      participantIdentity,
      roomName,
    });

  } catch (error) {
    console.error('❌ Token generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate token',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
