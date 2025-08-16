import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIScalabilityData {
  scalabilityScore: number;
  businessModel: {
    type: 'saas' | 'marketplace' | 'product' | 'service' | 'hybrid';
    scalabilityRating: 'high' | 'medium' | 'low';
    revenueModel: string;
    unitEconomics: string;
  };
  scalingFactors: Array<{
    factor: string;
    category: 'technology' | 'operations' | 'market' | 'financial' | 'team';
    impact: 'high' | 'medium' | 'low';
    scalability: 'excellent' | 'good' | 'challenging';
    details: string;
  }>;
  growthPotential: {
    shortTerm: string;
    longTerm: string;
    globalPotential: boolean;
    marketExpansion: string[];
  };
  scalingChallenges: Array<{
    challenge: string;
    severity: 'high' | 'medium' | 'low';
    solution: string;
    timeframe: string;
  }>;
  revenueStreams: Array<{
    stream: string;
    scalability: 'high' | 'medium' | 'low';
    implementation: string;
  }>;
  infrastructureNeeds: {
    technology: string[];
    operations: string[];
    team: string[];
    funding: string;
  };
  benchmarkComparisons: Array<{
    company: string;
    similarity: string;
    scalingLessons: string;
  }>;
}

export async function researchScalability(
  oneLiner: string,
  targetAudience: string,
  problemSolved: string
): Promise<AIScalabilityData> {
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log('🚀 AI researching scalability for:', oneLiner.substring(0, 50) + '...');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are a business scaling expert with access to current market information. Analyze the scalability potential for this startup idea:

STARTUP IDEA: "${oneLiner}"
TARGET AUDIENCE: "${targetAudience}"
PROBLEM SOLVED: "${problemSolved}"

Research and analyze:
1. BUSINESS MODEL SCALABILITY: How scalable is this type of business model?
2. SCALING FACTORS: What factors will help or hinder scaling?
3. REVENUE SCALABILITY: How can revenue scale with growth?
4. OPERATIONAL SCALING: What operational challenges exist?
5. MARKET EXPANSION: How can this expand to new markets?
6. BENCHMARK ANALYSIS: Find similar companies and their scaling patterns

For each scaling factor, research:
- Technology scalability requirements
- Operational complexity as it grows
- Market size and expansion potential
- Financial scalability and unit economics
- Team and organizational scaling needs

Also identify:
- Revenue streams that scale well
- Potential scaling bottlenecks
- Infrastructure requirements
- Similar companies' scaling successes/failures

SCALABILITY SCORING (0-100):
Consider these core scalability factors:
- Market size: Larger addressable markets enable higher scalability
- Business model: Software/digital scales better than physical/manual services
- Network effects: Products that get better with more users
- Automation potential: Can operations be automated as you grow?
- Geographic constraints: Global reach vs local limitations
- Resource requirements: Linear vs exponential resource needs

Score based on fundamental scalability principles, not surface-level features. A business serving 10,000 people globally has inherent scaling limits regardless of technology used. Respond with ONLY valid JSON:

{
  "scalabilityScore": 0,
  "businessModel": {
    "type": "saas|marketplace|product|service|hybrid",
    "scalabilityRating": "high|medium|low",
    "revenueModel": "description of revenue model",
    "unitEconomics": "analysis of unit economics scalability"
  },
  "scalingFactors": [
    {
      "factor": "specific scaling factor",
      "category": "technology|operations|market|financial|team",
      "impact": "high|medium|low",
      "scalability": "excellent|good|challenging",
      "details": "detailed analysis of this factor"
    }
  ],
  "growthPotential": {
    "shortTerm": "1-2 year growth potential",
    "longTerm": "5+ year growth potential", 
    "globalPotential": true,
    "marketExpansion": ["potential new markets or segments"]
  },
  "scalingChallenges": [
    {
      "challenge": "specific scaling challenge",
      "severity": "high|medium|low",
      "solution": "recommended solution approach",
      "timeframe": "when this challenge typically appears"
    }
  ],
  "revenueStreams": [
    {
      "stream": "revenue stream name",
      "scalability": "high|medium|low",
      "implementation": "how to implement and scale this stream"
    }
  ],
  "infrastructureNeeds": {
    "technology": ["technology requirements"],
    "operations": ["operational requirements"],
    "team": ["team scaling needs"],
    "funding": "estimated funding needs for scaling"
  },
  "benchmarkComparisons": [
    {
      "company": "similar company name",
      "similarity": "how they are similar",
      "scalingLessons": "lessons from their scaling journey"
    }
  ]
}

Research current market examples and provide realistic scalability analysis based on real business scaling patterns.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiText = response.text();

  console.log('🤖 AI scalability analysis response:', aiText.substring(0, 200) + '...');

  // Parse the JSON response with better error handling
  let analysis: AIScalabilityData;
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
  if (!analysis.businessModel || !analysis.scalingFactors) {
    throw new Error('Invalid AI response: missing required scalability data');
  }

  console.log(`✅ AI analyzed scalability: ${analysis.scalabilityScore}/100 score, ${analysis.scalingFactors.length} factors identified`);

  return analysis;
}