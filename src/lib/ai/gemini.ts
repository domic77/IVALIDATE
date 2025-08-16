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
    
    // Clean and parse JSON response
    let cleanText = text.trim();
    
    // Remove markdown code blocks if present
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }
    
    console.log('🧹 Cleaned text for parsing:', cleanText.substring(0, 200));
    
    // Parse JSON response
    const analysis = JSON.parse(cleanText);
    
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
    
    // Return fallback analysis if AI fails
    return {
      recommendation: 'PASS',
      reasoning: `AI analysis temporarily unavailable (${errorMessage}). The collected data still provides valuable insights for your decision.`,
      nextSteps: [
        'Research your target market manually',
        'Validate demand through customer interviews',
        'Analyze competitor offerings',
        'Create a minimal viable product (MVP)'
      ],
      risks: [
        {
          type: 'TECHNICAL',
          level: 'MEDIUM',
          description: 'AI analysis service unavailable',
          mitigation: 'Manual market research required'
        }
      ],
      opportunities: [
        'Conduct manual market validation',
        'Direct customer feedback collection'
      ],
      marketSize: { tam: 0, sam: 0, som: 0 },
      confidence: 30,
    };
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