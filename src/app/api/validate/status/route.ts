import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ApiResponse } from '@/types/api';
import { loadValidation } from '@/lib/storage/json';

// Validation schema for query params
const StatusQuerySchema = z.object({
  id: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      id: searchParams.get('id'),
    };

    const { id } = StatusQuerySchema.parse(queryParams);

    // Load validation data with retry logic
    let validation;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        validation = await loadValidation(id);
        if (validation) {
          break; // Successfully loaded
        }
        
        // If validation is null, check if it's because file doesn't exist or is incomplete
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`Validation ${id} not found or incomplete, retrying... (${attempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms before retry
        }
      } catch (error) {
        console.error(`Error loading validation ${id} on attempt ${attempts + 1}:`, error);
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms before retry
        } else {
          throw error; // Re-throw on final attempt
        }
      }
    }
    
    if (!validation) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation not found',
        message: `No validation found with ID: ${id}`,
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Calculate estimated time remaining
    let estimatedTimeRemaining: number | undefined;
    if (validation.status === 'PROCESSING') {
      // Rough estimation based on progress
      const timePerPercent = 0.15; // ~0.15 minutes per percent (15 minutes total)
      const remainingProgress = 100 - validation.progress;
      estimatedTimeRemaining = Math.ceil(remainingProgress * timePerPercent);
    }

    const response: ApiResponse = {
      success: true,
      data: {
        validationId: validation.id,
        status: validation.status,
        progress: validation.progress,
        currentStep: validation.currentStep,
        estimatedTimeRemaining,
        // Include error message if failed
        ...(validation.status === 'FAILED' && validation.errorMessage && {
          errorMessage: validation.errorMessage,
        }),
        // Include completion timestamp if completed
        ...(validation.status === 'COMPLETED' && validation.completedAt && {
          completedAt: validation.completedAt,
        }),
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Status check error:', error);

    if (error instanceof z.ZodError) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid request parameters',
        message: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Handle specific JSON parsing errors
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      console.error('JSON parsing error in status endpoint:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Data parsing error',
        message: 'Validation data is temporarily unavailable. Please try again in a moment.',
      };
      return NextResponse.json(response, { status: 503 }); // Service Unavailable
    }

    // Handle file system errors
    if (error instanceof Error && error.message.includes('Failed to load validation data')) {
      const response: ApiResponse = {
        success: false,
        error: 'Data loading error',
        message: 'Unable to load validation status. Please try again.',
      };
      return NextResponse.json(response, { status: 503 }); // Service Unavailable
    }

    const response: ApiResponse = {
      success: false,
      error: 'Internal server error',
      message: 'Failed to check validation status',
    };

    return NextResponse.json(response, { status: 500 });
  }
}

// POST method for updating status (internal use)
export async function POST(request: NextRequest) {
  // This could be used for webhooks or manual status updates
  return NextResponse.json({ message: 'Status updates should use the internal update functions' }, { status: 405 });
}