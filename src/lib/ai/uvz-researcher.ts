import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIUVZData {
  uniqueValueProposition: {
    primaryValue: string;
    secondaryValues: string[];
    targetDifferentiator: string;
  };
  competitiveAdvantages: Array<{
    advantage: string;
    category: 'technology' | 'business-model' | 'user-experience' | 'pricing' | 'market-positioning';
    strength: 'high' | 'medium' | 'low';
    evidence: string;
    defensibility: 'high' | 'medium' | 'low';
  }>;
  marketGaps: Array<{
    gap: string;
    opportunity: string;
    marketSize: 'large' | 'medium' | 'niche';
    timingAdvantage: boolean;
  }>;
  differentiationStrategy: {
    primaryDifferentiator: string;
    supportingDifferentiators: string[];
    positioningStatement: string;
    targetWeakness: string;
  };
  uniquenessScore: number;
  riskFactors: Array<{
    risk: string;
    impact: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
}

export async function researchUniqueValueZone(
  oneLiner: string,
  targetAudience: string,
  problemSolved: string
): Promise<AIUVZData> {
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log('🎯 AI researching Unique Value Zone for:', oneLiner.substring(0, 50) + '...');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are a strategic business analyst with access to current market information. Analyze the unique value zone and competitive differentiation for this startup idea:

STARTUP IDEA: "${oneLiner}"
TARGET AUDIENCE: "${targetAudience}"
PROBLEM SOLVED: "${problemSolved}"

Research and analyze:
1. UNIQUE VALUE PROPOSITION: What makes this solution uniquely valuable?
2. COMPETITIVE ADVANTAGES: Search for current competitors and identify gaps this startup could exploit
3. MARKET POSITIONING: How should this startup position itself differently?
4. DIFFERENTIATION OPPORTUNITIES: What specific advantages could this startup develop?
5. TIMING ADVANTAGES: Are there current market conditions that favor this approach?

For each competitive advantage, research:
- Current solutions and their limitations
- User complaints about existing alternatives  
- Technological or business model opportunities
- Barriers competitors would face copying this approach

Also identify:
- Market gaps that aren't being addressed
- Weaknesses in current market leaders
- Opportunities for better user experience
- Potential risks to uniqueness

UNIQUENESS SCORING (0-100):
Evaluate uniqueness based on:
- Market differentiation: How different is this from existing solutions?
- Competitive barriers: How hard would this be for others to copy?
- Value proposition: Does the differentiation create meaningful value?
- Market timing: Is this uniqueness relevant to current market needs?
- Implementation difficulty: Technical or business model innovations

Consider both the innovation level and market viability. Revolutionary technology in a tiny market may score lower than modest innovation in a large market. Respond with ONLY valid JSON:

{
  "uniqueValueProposition": {
    "primaryValue": "main unique value this startup provides",
    "secondaryValues": ["supporting value propositions"],
    "targetDifferentiator": "key way this differs from competitors"
  },
  "competitiveAdvantages": [
    {
      "advantage": "specific competitive advantage",
      "category": "technology|business-model|user-experience|pricing|market-positioning",
      "strength": "high|medium|low",
      "evidence": "evidence supporting this advantage",
      "defensibility": "high|medium|low"
    }
  ],
  "marketGaps": [
    {
      "gap": "identified market gap",
      "opportunity": "opportunity this gap represents",
      "marketSize": "large|medium|niche",
      "timingAdvantage": true
    }
  ],
  "differentiationStrategy": {
    "primaryDifferentiator": "main way to differentiate",
    "supportingDifferentiators": ["additional differentiation methods"],
    "positioningStatement": "suggested market positioning",
    "targetWeakness": "competitor weakness to exploit"
  },
  "uniquenessScore": 35,
  "riskFactors": [
    {
      "risk": "risk to maintaining uniqueness",
      "impact": "high|medium|low", 
      "mitigation": "how to mitigate this risk"
    }
  ]
}

Research current market conditions and provide strategic differentiation analysis based on real competitive landscape.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiText = response.text();

  console.log('🤖 AI UVZ analysis response:', aiText.substring(0, 200) + '...');

  // Parse the JSON response with better error handling
  let analysis: AIUVZData;
  try {
    // Clean the response text more thoroughly
    let cleanText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Try to extract JSON if it's embedded in other text
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanText = jsonMatch[0];
    }
    
    analysis = JSON.parse(cleanText);
  } catch (parseError) {
    console.error('❌ JSON parse error:', parseError);
    console.error('Raw AI response:', aiText);
    throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
  }

  // Validate the response structure
  if (!analysis.uniqueValueProposition || !analysis.competitiveAdvantages) {
    throw new Error('Invalid AI response: missing required UVZ data');
  }

  console.log(`✅ AI found ${analysis.competitiveAdvantages.length} competitive advantages, uniqueness score: ${analysis.uniquenessScore}`);

  return analysis;
}