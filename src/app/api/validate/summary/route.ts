import { NextRequest, NextResponse } from 'next/server';
import { generateValidationSummary } from '@/lib/ai/validation-summarizer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required data
    if (!body.score && !body.realData) {
      return NextResponse.json(
        { success: false, error: 'Validation data required' },
        { status: 400 }
      );
    }

    console.log('🤖 Generating AI validation summary...');
    
    const summary = await generateValidationSummary({
      score: body.score,
      redditData: body.redditData,
      competitorData: body.competitorData,
      marketSizeData: body.marketSizeData,
      scalabilityData: body.scalabilityData,
      moatData: body.moatData,
      uvzData: body.uvzData,
      realData: body.realData
    });

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('❌ Summary generation failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate summary',
        details: 'AI summary service temporarily unavailable'
      },
      { status: 500 }
    );
  }
}