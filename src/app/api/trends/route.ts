import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Trends API endpoint - use validation endpoints for trend analysis' 
  }, { status: 200 });
}

export async function POST() {
  return NextResponse.json({ 
    message: 'Use GET method' 
  }, { status: 405 });
}