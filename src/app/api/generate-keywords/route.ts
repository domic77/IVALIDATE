import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GenerateKeywordsRequest {
  refinedIdea: string;
  targetAudience: string;
  problemSolved: string;
}

interface RecommendedSubreddit {
  name: string;
  reason: string;
  memberCount?: string;
  activityLevel?: string;
}

interface GenerateKeywordsResponse {
  recommendedSubreddits: RecommendedSubreddit[];
  searchKeywords: string[];
  focusQueries: string[];
  painPointQueries: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { refinedIdea, targetAudience, problemSolved }: GenerateKeywordsRequest = await request.json();

    if (!refinedIdea || !targetAudience || !problemSolved) {
      return NextResponse.json(
        { error: 'Missing required fields: refinedIdea, targetAudience, problemSolved' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    console.log('🎯 Generating Reddit keywords for:', refinedIdea.substring(0, 50) + '...');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `Based on your knowledge of active Reddit communities, analyze this startup idea and recommend the best subreddits to search for user discussions:

STARTUP IDEA: "${refinedIdea}"
TARGET AUDIENCE: "${targetAudience}"  
PROBLEM SOLVED: "${problemSolved}"

Use your knowledge of Reddit to recommend 5-10 active subreddits where people likely discuss problems related to this idea. Focus on communities with good engagement and relevant discussions.

IMPORTANT: Respond with ONLY valid JSON in this exact format. No markdown, no additional text:

{
  "recommendedSubreddits": [
    {
      "name": "subreddit_name_without_r_slash",
      "reason": "Brief explanation of why this community is relevant",
      "memberCount": "estimated member count like '2.5M' or 'large' or 'medium'",
      "activityLevel": "high/medium/low activity level"
    }
  ],
  "searchKeywords": ["5-8 specific keywords that people use when discussing this problem"],
  "focusQueries": ["4-6 search queries that would find relevant discussions"],
  "painPointQueries": ["3-5 queries focused on finding frustrated users complaining about this problem"]
}

Focus on real, active subreddits that exist and have engaged communities discussing these topics.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    console.log('🤖 AI response for keywords:', aiText.substring(0, 200) + '...');

    // Parse the JSON response
    let parsedResponse: GenerateKeywordsResponse;
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
    if (!parsedResponse.recommendedSubreddits || !parsedResponse.searchKeywords || !parsedResponse.focusQueries) {
      console.error('❌ Missing required fields:', parsedResponse);
      return NextResponse.json({
        error: 'Incomplete response from AI',
        details: 'Missing required fields: recommendedSubreddits, searchKeywords, or focusQueries',
        received: Object.keys(parsedResponse)
      }, { status: 500 });
    }

    // Validate subreddits array
    if (!Array.isArray(parsedResponse.recommendedSubreddits) || parsedResponse.recommendedSubreddits.length === 0) {
      console.error('❌ Invalid subreddits array:', parsedResponse.recommendedSubreddits);
      return NextResponse.json({
        error: 'Invalid subreddits data',
        details: 'recommendedSubreddits must be a non-empty array'
      }, { status: 500 });
    }

    // Limit to 10 subreddits max
    if (parsedResponse.recommendedSubreddits.length > 10) {
      parsedResponse.recommendedSubreddits = parsedResponse.recommendedSubreddits.slice(0, 10);
    }

    console.log(`✅ Generated ${parsedResponse.recommendedSubreddits.length} subreddit recommendations`);
    console.log('📍 Recommended subreddits:', parsedResponse.recommendedSubreddits.map(s => s.name).join(', '));
    
    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('💥 Unexpected error generating keywords:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}