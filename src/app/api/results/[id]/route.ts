import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Redirect to the correct validation results endpoint
    const baseUrl = request.nextUrl.origin;
    const redirectUrl = `${baseUrl}/api/validate/results?id=${id}`;
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Invalid request',
      message: 'Failed to process results request'
    }, { status: 400 });
  }
}

export async function POST() {
  return NextResponse.json({ 
    message: 'Use GET method' 
  }, { status: 405 });
}