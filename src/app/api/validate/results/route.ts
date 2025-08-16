import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiResponse } from '@/types/api';
import { loadValidation } from '@/lib/storage/json';

// Validation schema for query params
const ResultsQuerySchema = z.object({
  id: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      id: searchParams.get('id'),
    };

    const { id } = ResultsQuerySchema.parse(queryParams);

    // Load validation data
    const validation = await loadValidation(id);
    
    if (!validation) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation not found',
        message: `No validation found with ID: ${id}`,
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if validation is completed
    if (validation.status !== 'COMPLETED') {
      const response: ApiResponse = {
        success: false,
        error: 'Validation not completed',
        message: `Validation is still ${validation.status.toLowerCase()}. Current progress: ${validation.progress}%`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Prepare comprehensive results with safe property access
    const response: ApiResponse = {
      success: true,
      data: {
        validationId: validation.id,
        validation: {
          id: validation.id,
          createdAt: validation.createdAt,
          completedAt: validation.completedAt,
          idea: validation.idea,
          status: validation.status,
          // Add the data that dashboard expects
          redditData: validation.redditData || null,
          aiAnalysis: validation.aiAnalysis || null,
          totalDataPoints: validation.totalDataPoints || 0,
        },
        score: validation.finalScore || null,
        // Add the new AI research data from pipeline with safe access
        competitorData: validation.competitorData || null,
        marketSizeData: validation.marketSizeData || null,
        scalabilityData: validation.scalabilityData || null,
        moatData: validation.moatData || null,
        uvzData: validation.uvzData || null,
        insights: {
          // Market Demand Intelligence
          marketDemand: {
            overall: validation.redditData || null,
            summary: safeGenerateMarketDemandSummary(validation.redditData),
          },
          
          // Search Trend Analytics
          trends: {
            overall: validation.trendsData || null,
            summary: safeGenerateTrendsSummary(validation.trendsData),
          },
          
          // AI Analysis Results
          aiAnalysis: {
            overall: validation.aiAnalysis || null,
            summary: safeGenerateAISummary(validation.aiAnalysis),
          },
          
          // Competition Analysis
          competition: {
            summary: validation.competitorData ? 
              `Found ${validation.competitorData.totalCompetitors || 0} competitors with ${validation.competitorData.complaints?.length || 0} user complaints` : 
              'Competition analysis not available',
            level: 'MODERATE',
          },
          
          // Risk Assessment
          risks: validation.aiAnalysis?.risks || [],
          
          // Opportunities
          opportunities: validation.aiAnalysis?.opportunities || [],
          
          // Action Plan
          actionPlan: {
            recommendation: validation.aiAnalysis?.recommendation || 'PASS',
            nextSteps: validation.aiAnalysis?.nextSteps || [],
            confidence: validation.aiAnalysis?.confidence || 50,
            marketSize: validation.aiAnalysis?.marketSize || { tam: 0, sam: 0, som: 0 },
          },
        },
      },
    };

    // Add cache-control headers to prevent caching
    const headers = {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    return NextResponse.json(response, { status: 200, headers });

  } catch (error) {
    console.error('Results fetch error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    if (error instanceof z.ZodError) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid request parameters',
        message: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
      message: `Failed to fetch validation results: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };

    return NextResponse.json(response, { status: 500 });
  }
}

function safeGenerateMarketDemandSummary(redditData: any): string {
  try {
    if (!redditData) {
      return 'Market demand analysis not available.';
    }

    // Handle both old and new data structures
    const posts = redditData.posts || [];
    const sentiment = redditData.sentiment || 5;
    const discussionVolume = redditData.discussionVolume || redditData.realData?.totalMentions || 0;
    const score = redditData.score || 0;
    
    if (discussionVolume === 0) {
      return 'No relevant market discussions found.';
    }
    
    const sentimentText = sentiment > 7 ? 'very positive' : sentiment > 5 ? 'positive' : sentiment < 3 ? 'negative' : 'neutral';
    
    return `Found ${discussionVolume} relevant discussions with ${sentimentText} sentiment (${sentiment.toFixed(1)}/10). Market demand score: ${score}/100.`;
  } catch (error) {
    console.error('Error generating market demand summary:', error);
    return 'Error analyzing market demand data.';
  }
}

function safeGenerateTrendsSummary(trendsData: any): string {
  try {
    if (!trendsData || trendsData === null) {
      return 'Google Trends analysis unavailable - using Reddit-based market analysis instead.';
    }

    // Check if trendsData has the expected properties
    if (!trendsData.hasOwnProperty('growthRate') || !trendsData.hasOwnProperty('keyword')) {
      return 'Search trends data incomplete - relying on user discussion analysis.';
    }

    const { keyword, growthRate, score } = trendsData;
    const growthText = growthRate > 25 ? 'strong growth' : growthRate > 0 ? 'moderate growth' : growthRate > -10 ? 'slight decline' : 'significant decline';
    
    return `Search interest for "${keyword}" shows ${growthText} (${growthRate.toFixed(1)}%) over the past year. Trends score: ${score}/100.`;
  } catch (error) {
    console.error('Error generating trends summary:', error);
    return 'Error analyzing trends data.';
  }
}

function safeGenerateAISummary(aiAnalysis: any): string {
  try {
    if (!aiAnalysis) {
      return 'AI analysis not available.';
    }

    const recommendation = aiAnalysis.recommendation || 'No recommendation';
    const confidence = aiAnalysis.confidence || 0;
    const reasoning = aiAnalysis.reasoning || 'No reasoning provided';
    
    return `AI recommendation: ${recommendation} (${confidence}% confidence). ${reasoning}`;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return 'Error analyzing AI data.';
  }
}

// Health check endpoint
export async function POST() {
  return NextResponse.json({ message: 'Use GET method to fetch results' }, { status: 405 });
}