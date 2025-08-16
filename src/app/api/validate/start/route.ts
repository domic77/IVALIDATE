import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ValidationRequest } from '@/types/validation';
import { ApiResponse } from '@/types/api';
import { saveValidation, updateValidation } from '@/lib/storage/json';
// import { extractKeywords } from '@/lib/utils'; // Not used - using AI provider instead
import { searchRedditDiscussions } from '@/lib/api/reddit';
import { ValidationPipeline } from '@/lib/processing/validation-pipeline';

// Validation schema for request body (relaxed for MVP testing)
const StartValidationSchema = z.object({
  validationId: z.string().min(1),
  idea: z.object({
    description: z.string().min(10).max(2000), // Reduced from 50 to 10
    industry: z.string().optional(), // Made optional
    targetMarket: z.string().optional(), // Made optional
    refinedIdeaData: z.object({
      oneLiner: z.string(),
      targetAudience: z.string(),
      problem: z.string()
    }).optional(), // AI-refined idea data
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { validationId, idea } = StartValidationSchema.parse(body);

    console.log('🚀 Starting REAL validation pipeline...');
    
    // Create initial validation record
    const validation: ValidationRequest = {
      id: validationId,
      createdAt: new Date().toISOString(),
      idea: {
        description: idea.description,
        keywords: [], // Will be filled by pipeline
        industry: idea.industry || 'Other',
        targetMarket: idea.targetMarket || 'General Market',
      },
      status: 'PROCESSING',
      progress: 0,
      currentStep: 'Initializing validation pipeline with real data sources...',
    };

    // Save initial validation
    await saveValidation(validation);

    // Start REAL validation pipeline (don't await - let it run async)
    runValidationPipelineAsync(validationId, idea.description, idea.refinedIdeaData);

    const response: ApiResponse = {
      success: true,
      data: {
        validationId,
        status: 'PROCESSING',
        estimatedTime: 12, // minutes
      },
      message: 'Validation started successfully',
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Start validation error:', error);

    if (error instanceof z.ZodError) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid request data',
        message: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to start validation process',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// REAL validation pipeline with transparent processing
async function runValidationPipelineAsync(
  validationId: string, 
  ideaDescription: string, 
  refinedIdeaData?: { oneLiner: string; targetAudience: string; problem: string }
) {
  try {
    console.log(`🚀 Starting REAL validation pipeline for: ${ideaDescription.substring(0, 50)}...`);
    if (refinedIdeaData) {
      console.log('🎯 Using refined idea data for AI-powered Reddit targeting');
    }

    // Initialize pipeline with refined idea data
    const pipeline = new ValidationPipeline(validationId, ideaDescription, refinedIdeaData);
    
    // Execute pipeline with real data sources
    const result = await pipeline.execute();
    
    if (result.success) {
      // Pipeline completed successfully
      await updateValidation(validationId, {
        status: 'COMPLETED',
        finalScore: result.finalScore,
        completedAt: new Date().toISOString(),
        processingSteps: result.steps,
        totalDataPoints: result.totalDataPoints,
        // Save all AI research data from pipeline
        competitorData: result.competitorData,
        marketSizeData: result.marketSizeData,
        scalabilityData: result.scalabilityData,
        moatData: result.moatData,
        uvzData: result.uvzData
      });

      console.log(`✅ Validation ${validationId} completed successfully with ${result.totalDataPoints} real data points`);
    } else {
      // Pipeline failed
      await updateValidation(validationId, {
        status: 'FAILED',
        currentStep: 'Pipeline execution failed',
        errorMessage: result.error || 'Unknown pipeline error',
        processingSteps: result.steps
      });

      console.log(`❌ Validation ${validationId} failed: ${result.error}`);
    }

  } catch (error) {
    console.error(`❌ Pipeline execution failed for validation ${validationId}:`, error);
    
    await updateValidation(validationId, {
      status: 'FAILED',
      currentStep: 'Critical pipeline error',
      errorMessage: error instanceof Error ? error.message : 'Critical pipeline failure',
    });
  }
}


// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'API is working' });
}