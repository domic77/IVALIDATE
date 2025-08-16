import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AICompetitorData {
  competitors: Array<{
    name: string;
    description: string;
    category: 'direct' | 'indirect' | 'substitute';
    fundingStatus: string;
    userComplaints: string[];
    strengths: string[];
    weaknesses: string[];
    pricing: string;
    marketPosition: 'leader' | 'challenger' | 'niche' | 'startup';
  }>;
  marketGaps: string[];
  opportunities: string[];
  competitiveLandscape: string;
  totalCompetitors: number;
}

export async function researchCompetitors(
  oneLiner: string,
  targetAudience: string,
  problemSolved: string
): Promise<AICompetitorData> {
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log('🔍 AI researching competitors for:', oneLiner.substring(0, 50) + '...');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are a market research expert with access to current web information. Research the competitive landscape for this startup idea:

STARTUP IDEA: "${oneLiner}"
TARGET AUDIENCE: "${targetAudience}"
PROBLEM SOLVED: "${problemSolved}"

Search the web to find:
1. DIRECT COMPETITORS: Companies solving the exact same problem for the same audience
2. INDIRECT COMPETITORS: Companies solving similar problems or serving the same audience differently
3. SUBSTITUTE SOLUTIONS: Current alternatives people use instead

For each competitor, research:
- Company name and what they do
- Funding status and company size
- Common user complaints (from reviews, forums, social media)
- Their main strengths and weaknesses
- Pricing model if available
- Market position

Also identify:
- Market gaps and unmet needs
- Opportunities for differentiation
- Overall competitive landscape assessment

IMPORTANT: Search for CURRENT information and provide REAL companies that exist today. Respond with ONLY valid JSON:

{
  "competitors": [
    {
      "name": "Company Name",
      "description": "Brief description of what they do",
      "category": "direct|indirect|substitute",
      "fundingStatus": "bootstrapped|seed|series-a|series-b|public|unknown",
      "userComplaints": ["specific complaints users mention"],
      "strengths": ["what they do well"],
      "weaknesses": ["areas where they fall short"],
      "pricing": "pricing model or 'unknown'",
      "marketPosition": "leader|challenger|niche|startup"
    }
  ],
  "marketGaps": ["identified gaps in the current market"],
  "opportunities": ["opportunities for differentiation"],
  "competitiveLandscape": "overall assessment of competition level",
  "totalCompetitors": 0
}

Search for real, current companies and provide accurate information about the competitive landscape.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiText = response.text();

  console.log('🤖 AI competitor analysis response:', aiText.substring(0, 200) + '...');

  // Parse the JSON response
  const cleanText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const analysis: AICompetitorData = JSON.parse(cleanText);

  // Validate the response structure
  if (!analysis.competitors || !Array.isArray(analysis.competitors)) {
    throw new Error('Invalid AI response: missing competitors array');
  }

  // Update total competitors count
  analysis.totalCompetitors = analysis.competitors.length;

  console.log(`✅ AI found ${analysis.competitors.length} competitors in the competitive landscape`);

  return analysis;
}