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