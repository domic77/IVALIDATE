import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIMarketSizeData {
  totalAddressableMarket: {
    value: number;
    currency: string;
    timeframe: string;
    source: string;
  };
  serviceableAddressableMarket: {
    value: number;
    currency: string;
    description: string;
  };
  serviceableObtainableMarket: {
    value: number;
    currency: string;
    description: string;
  };
  marketGrowthRate: {
    annual: number;
    trend: 'growing' | 'stable' | 'declining';
    drivers: string[];
  };
  marketSegments: Array<{
    segment: string;
    size: number;
    growthPotential: 'high' | 'medium' | 'low';
  }>;
  industryTrends: string[];
  marketMaturity: 'emerging' | 'growing' | 'mature' | 'declining';
  keyInsights: string[];
}

export async function researchMarketSize(
  oneLiner: string,
  targetAudience: string,
  problemSolved: string
): Promise<AIMarketSizeData> {
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log('📊 AI researching market size for:', oneLiner.substring(0, 50) + '...');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are a seasoned market research analyst. Calculate realistic market sizing for this startup idea using industry data and comparable markets:

STARTUP IDEA: "${oneLiner}"
TARGET AUDIENCE: "${targetAudience}"
PROBLEM SOLVED: "${problemSolved}"

Calculate market sizing using these approaches:
1. INDUSTRY APPROACH: Find the broader industry market size (e.g. design software, social media tools, productivity apps)
2. COMPARABLE APPROACH: Look at similar successful companies and their market sizes
3. BOTTOMS-UP APPROACH: Estimate based on target audience size and pricing

Market Sizing Framework:
- TAM: Broader industry/category market size (e.g. $50B design software market)
- SAM: Addressable portion for this specific solution (e.g. 10-20% of TAM)
- SOM: Realistic capture rate for a startup (e.g. 0.1-1% of SAM in 5 years)

GROWTH RATE RESEARCH:
- Software/SaaS markets typically grow 15-25% annually
- Design tools: Canva grew 60% YoY, Figma grew 50% YoY
- Productivity apps: Notion grew 100% YoY, Slack grew 30% YoY
- AI tools: Growing 40-80% annually
- Mobile apps: Generally 10-20% growth

MARKET SIZING PRINCIPLES:
- Use bottoms-up analysis: Count potential users × willingness to pay
- Cross-check with top-down industry data
- Consider geographic and demographic constraints
- Factor in market maturity and competitive landscape
- Be conservative with penetration rates for new concepts

Growth rates should reflect industry benchmarks and market dynamics, not wishful thinking. Respond with ONLY valid JSON:

{
  "totalAddressableMarket": {
    "value": 15000000000,
    "currency": "USD",
    "timeframe": "annual",
    "source": "Industry analysis and comparable market research"
  },
  "serviceableAddressableMarket": {
    "value": 1500000000,
    "currency": "USD", 
    "description": "Realistic addressable portion based on target audience and geographic reach"
  },
  "serviceableObtainableMarket": {
    "value": 30000000,
    "currency": "USD",
    "description": "Conservative 5-year market capture estimate for a successful startup"
  },
  "marketGrowthRate": {
    "annual": 22,
    "trend": "growing",
    "drivers": ["Digital transformation", "Remote work trends", "AI adoption", "Mobile-first design"]
  },
  "marketSegments": [
    {
      "segment": "Small Business/SME",
      "size": 2000000000,
      "growthPotential": "high"
    },
    {
      "segment": "Enterprise",
      "size": 1500000000,
      "growthPotential": "medium"
    },
    {
      "segment": "Individual Users",
      "size": 500000000,
      "growthPotential": "medium"
    }
  ],
  "industryTrends": ["current industry trends"],
  "marketMaturity": "emerging|growing|mature|declining",
  "keyInsights": ["important market insights and opportunities"]
}

Research current market conditions and provide accurate market sizing based on real data sources.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiText = response.text();

  console.log('🤖 AI market size analysis response:', aiText.substring(0, 200) + '...');

  // Parse the JSON response with better error handling
  let analysis: AIMarketSizeData;
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
  if (!analysis.totalAddressableMarket || !analysis.serviceableAddressableMarket) {
    throw new Error('Invalid AI response: missing required market size data');
  }



  console.log(`✅ AI researched market size: TAM $${(analysis.totalAddressableMarket.value / 1000000).toFixed(1)}M, SAM $${(analysis.serviceableAddressableMarket.value / 1000000).toFixed(1)}M`);

  return analysis;
}