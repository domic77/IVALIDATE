import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIAnalysis, Risk } from '@/types/validation';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface AnalysisData {
  idea: string;
  industry: string;
  targetMarket: string;
  redditInsights?: any;
  trendsData?: any;
  youtubeData?: any;
}

export async function analyzeStartupIdea(data: AnalysisData): Promise<AIAnalysis> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `
You are an expert startup advisor and market researcher. Analyze this startup idea and provide detailed insights.

STARTUP IDEA:
"${data.idea}"

INDUSTRY: ${data.industry}
TARGET MARKET: ${data.targetMarket}

${data.redditInsights ? `REDDIT INSIGHTS: ${JSON.stringify(data.redditInsights, null, 2)}` : ''}
${data.trendsData ? `TRENDS DATA: ${JSON.stringify(data.trendsData, null, 2)}` : ''}
${data.youtubeData ? `YOUTUBE DATA: ${JSON.stringify(data.youtubeData, null, 2)}` : ''}

Please provide a comprehensive analysis in the following JSON format:

{
  "recommendation": "BUILD" | "PIVOT" | "PASS",
  "reasoning": "Detailed explanation of why you made this recommendation",
  "confidence": 75, // 0-100 confidence score
  "risks": [
    {
      "type": "MARKET" | "TECHNICAL" | "COMPETITIVE" | "REGULATORY",
      "level": "LOW" | "MEDIUM" | "HIGH",
      "description": "Description of the risk",
      "mitigation": "How to address this risk"
    }
  ],
  "opportunities": [
    "List of market opportunities and advantages"
  ],
  "nextSteps": [
    "Specific actionable next steps for the entrepreneur"
  ],
  "marketSize": {
    "tam": 1000000000, // Total Addressable Market in USD
    "sam": 100000000,  // Serviceable Addressable Market in USD  
    "som": 10000000    // Serviceable Obtainable Market in USD
  }
}

Guidelines:
- Be honest and data-driven in your assessment
- Consider market demand, competition, trends, and feasibility
- Provide specific, actionable advice
- Include realistic market size estimates
- Identify the most critical risks and opportunities
- Consider the target market and industry context
- If data is limited, acknowledge it but still provide best judgment

Return only the JSON response, no additional text.
`;

  try {
    console.log('🤖 Starting Gemini analysis...');
    console.log('🔑 API Key available:', !!process.env.GEMINI_API_KEY);
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log('✅ Gemini API response received');
    console.log('📝 Raw response (first 200 chars):', text.substring(0, 200));
    
    // Clean and parse JSON response with robust handling
    let cleanText = text.trim();
    
    // Simple and reliable JSON extraction
    console.log('🔍 Original response length:', cleanText.length);
    
    // Remove markdown blocks - be very explicit
    if (cleanText.includes('```json')) {
      const startIndex = cleanText.indexOf('```json') + 7;
      const endIndex = cleanText.lastIndexOf('```');
      if (startIndex > 7 && endIndex > startIndex) {
        cleanText = cleanText.substring(startIndex, endIndex).trim();
      }
    } else if (cleanText.includes('```')) {
      const startIndex = cleanText.indexOf('```') + 3;
      const endIndex = cleanText.lastIndexOf('```');
      if (startIndex > 3 && endIndex > startIndex) {
        cleanText = cleanText.substring(startIndex, endIndex).trim();
      }
    }
    
    // Extract just the JSON object - find first { and last }
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }
    
    console.log('🔍 Extracted JSON length:', cleanText.length);
    console.log('🔍 First 100 chars:', cleanText.substring(0, 100));
    
    console.log('🧹 Cleaned text for parsing:', cleanText.substring(0, 200));
    
    // Parse JSON response - try direct parsing first, then fallbacks
    let analysis;
    try {
      // Attempt 1: Direct parse
      analysis = JSON.parse(cleanText);
      console.log('✅ Direct JSON parsing successful');
    } catch (parseError) {
      console.error('🔍 Direct JSON parse failed:', parseError instanceof Error ? parseError.message : 'Unknown');
      console.error('🔍 Problematic area:', cleanText.substring(0, 200));
      
      // Attempt 2: Try with minimal cleaning
      try {
        let minimalClean = cleanText
          .replace(/[\u0000-\u001F\u007F]/g, ' ') // Replace control chars with spaces
          .replace(/,(\s*[}\]])/g, '$1')          // Remove trailing commas
          .trim();
        
        analysis = JSON.parse(minimalClean);
        console.log('✅ Minimal cleaning JSON parsing successful');
      } catch (minimalError) {
        console.error('🔍 Minimal cleaning failed:', minimalError instanceof Error ? minimalError.message : 'Unknown');
        
        // Attempt 3: Manual parsing for key fields
        try {
          analysis = {
            recommendation: extractJsonValue(cleanText, 'recommendation') || 'PASS',
            reasoning: extractJsonValue(cleanText, 'reasoning') || 'AI parsing failed - analysis incomplete',
            nextSteps: extractJsonArray(cleanText, 'nextSteps') || ['Manual validation recommended'],
            risks: extractJsonArray(cleanText, 'risks') || [],
            opportunities: extractJsonArray(cleanText, 'opportunities') || [],
            marketSize: { tam: 0, sam: 0, som: 0 },
            confidence: 30
          };
          console.log('✅ Manual field extraction successful');
        } catch (manualError) {
          console.error('❌ All parsing attempts failed');
          console.error('📄 Full response for debugging:', text.substring(0, 1000));
          throw new Error(`JSON parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
        }
      }
    }
    
    // Validate and format the response
    return {
      recommendation: analysis.recommendation || 'PASS',
      reasoning: analysis.reasoning || 'Unable to determine recommendation.',
      nextSteps: Array.isArray(analysis.nextSteps) ? analysis.nextSteps : [],
      risks: Array.isArray(analysis.risks) ? analysis.risks.map(formatRisk) : [],
      opportunities: Array.isArray(analysis.opportunities) ? analysis.opportunities : [],
      marketSize: {
        tam: analysis.marketSize?.tam || 0,
        sam: analysis.marketSize?.sam || 0,
        som: analysis.marketSize?.som || 0,
      },
      confidence: Math.min(Math.max(analysis.confidence || 50, 0), 100),
    };
  } catch (error) {
    console.error('❌ Gemini AI analysis error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (error instanceof SyntaxError) {
      console.error('🔴 JSON Parse Error - AI returned invalid JSON');
    } else if (errorMessage.includes('API key')) {
      console.error('🔑 API Key Error');
    } else if (errorMessage.includes('quota')) {
      console.error('📊 Quota/Rate Limit Error');
    } else {
      console.error('⚠️ Unknown AI Error:', errorMessage);
    }
    
    // NO FALLBACK DATA - throw error so validation fails properly
    throw new Error(`Gemini AI analysis failed: ${errorMessage}`);
  }
}

function formatRisk(risk: any): Risk {
  return {
    type: ['MARKET', 'TECHNICAL', 'COMPETITIVE', 'REGULATORY'].includes(risk.type) 
      ? risk.type 
      : 'MARKET',
    level: ['LOW', 'MEDIUM', 'HIGH'].includes(risk.level) 
      ? risk.level 
      : 'MEDIUM',
    description: risk.description || 'Risk description not provided',
    mitigation: risk.mitigation || 'Mitigation strategy needed',
  };
}

// Helper functions for manual JSON field extraction
function extractJsonValue(text: string, field: string): string | null {
  const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`, 'i');
  const match = text.match(regex);
  return match ? match[1] : null;
}

function extractJsonArray(text: string, field: string): string[] {
  try {
    const regex = new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]*)\\]`, 'i');
    const match = text.match(regex);
    if (!match) return [];
    
    // Extract string values from the array
    const arrayContent = match[1];
    const stringMatches = arrayContent.match(/"([^"]*)"/g);
    return stringMatches ? stringMatches.map(s => s.slice(1, -1)) : [];
  } catch {
    return [];
  }
}

// Quick sentiment analysis for text
export async function analyzeSentiment(text: string): Promise<number> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `
Analyze the sentiment of this text and return a score from 0 to 10:
- 0-3: Very negative
- 4-5: Negative
- 6-7: Neutral  
- 8-9: Positive
- 10: Very positive

Text: "${text}"

Return only a number between 0 and 10, no explanation needed.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    const score = parseFloat(response);
    
    return isNaN(score) ? 5 : Math.min(Math.max(score, 0), 10);
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return 5; // Neutral fallback
  }
}

// Extract keywords from text using AI
export async function extractKeywordsAI(text: string): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `
Extract the most important keywords from this startup idea description. 
Return 5-10 keywords that would be useful for market research and trend analysis.

Text: "${text}"

Return only a JSON array of strings, like: ["keyword1", "keyword2", "keyword3"]
`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    const keywords = JSON.parse(response);
    
    return Array.isArray(keywords) ? keywords.slice(0, 10) : [];
  } catch (error) {
    console.error('Keyword extraction error:', error);
    // Fallback to simple keyword extraction
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
  }
}