import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Redirect to the correct validation status endpoint
    const baseUrl = request.nextUrl.origin;
    const redirectUrl = `${baseUrl}/api/validate/status?id=${id}`;
    
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Invalid request',
      message: 'Failed to process status request'
    }, { status: 400 });
  }
}

export async function POST() {
  return NextResponse.json({ 
    message: 'Use GET method' 
  }, { status: 405 });
}