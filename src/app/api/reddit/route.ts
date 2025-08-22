import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Reddit API endpoint - use other endpoints for validation' 
  }, { status: 200 });
}

export async function POST() {
  return NextResponse.json({ 
    message: 'Use GET method' 
  }, { status: 405 });
}