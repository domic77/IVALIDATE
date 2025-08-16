import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface RefineIdeaRequest {
  idea: string;
}

interface RefineIdeaResponse {
  oneLiner: string;
  targetAudience: string;
  problem: string;
}

export async function POST(request: NextRequest) {
  try {
    const { idea }: RefineIdeaRequest = await request.json();

    if (!idea || !idea.trim()) {
      return NextResponse.json(
        { error: 'Idea is required' },
        { status: 400 }
      );
    }

    if (idea.length > 500) {
      return NextResponse.json(
        { error: 'Idea must be 500 characters or less' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log('🚀 Refining idea:', idea.substring(0, 50) + '...');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Refine this startup idea: "${idea}". 

IMPORTANT: Respond with ONLY valid JSON in this exact format. No markdown, no additional text:

{"oneLiner": "A clear, compelling one-sentence description of the refined idea", "targetAudience": "Specific target market and user demographics", "problem": "The main problem this startup solves"}

Ensure the JSON is properly formatted and contains all three fields.`;

    // Retry logic for API overload
    let result;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        result = await model.generateContent(prompt);
        break; // Success, exit retry loop
      } catch (apiError: any) {
        retryCount++;
        
        if (apiError.message?.includes('overloaded') || apiError.message?.includes('503')) {
          if (retryCount < maxRetries) {
            console.log(`⏳ API overloaded, retrying (${retryCount}/${maxRetries}) in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Exponential backoff
            continue;
          } else {
            return NextResponse.json({
              error: 'AI service temporarily unavailable',
              details: 'Google AI is currently overloaded. Please try again in a few minutes.',
              retryAfter: 60
            }, { status: 503 });
          }
        } else {
          throw apiError; // Re-throw non-overload errors
        }
      }
    }
    
    if (!result) {
      return NextResponse.json({
        error: 'AI service unavailable',
        details: 'Failed to get response after maximum retries'
      }, { status: 503 });
    }
    
    const response = await result.response;
    const aiText = response.text();

    console.log('🤖 AI response:', aiText);

    // Parse the JSON response
    let parsedResponse: RefineIdeaResponse;
    try {
      // Clean the response text (remove any markdown formatting)
      const cleanText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Raw AI response:', aiText);
      
      return NextResponse.json({
        error: 'Invalid response format from AI',
        details: 'The AI response could not be parsed as JSON',
        rawResponse: aiText.substring(0, 200) + '...'
      }, { status: 500 });
    }

    // Validate required fields
    if (!parsedResponse.oneLiner || !parsedResponse.targetAudience || !parsedResponse.problem) {
      console.error('❌ Missing required fields:', parsedResponse);
      return NextResponse.json({
        error: 'Incomplete response from AI',
        details: 'Missing required fields: oneLiner, targetAudience, or problem',
        received: Object.keys(parsedResponse)
      }, { status: 500 });
    }

    console.log('✅ Successfully refined idea');
    
    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}