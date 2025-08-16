import { NextRequest, NextResponse } from 'next/server';
import { getDebugLogs, createDebugSummary } from '@/lib/storage/debug-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { validationId: string } }
) {
  try {
    const { validationId } = params;

    if (!validationId) {
      return NextResponse.json({ error: 'Validation ID required' }, { status: 400 });
    }

    const summary = await createDebugSummary(validationId);
    
    return NextResponse.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve debug data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Get raw debug logs
export async function POST(
  request: NextRequest,
  { params }: { params: { validationId: string } }
) {
  try {
    const { validationId } = params;
    const body = await request.json();
    const { raw } = body;

    if (!validationId) {
      return NextResponse.json({ error: 'Validation ID required' }, { status: 400 });
    }

    if (raw) {
      const logs = await getDebugLogs(validationId);
      return NextResponse.json({
        success: true,
        data: logs
      });
    }

    const summary = await createDebugSummary(validationId);
    return NextResponse.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve debug data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}