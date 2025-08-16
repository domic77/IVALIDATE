import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIMoatData {
  moatScore: number;
  defensibilityFactors: Array<{
    factor: string;
    category: 'network-effects' | 'switching-costs' | 'economies-of-scale' | 'brand' | 'regulatory' | 'technology' | 'data' | 'location';
    strength: 'high' | 'medium' | 'low';
    sustainability: 'long-term' | 'medium-term' | 'short-term';
    details: string;
    buildTime: string;
  }>;
  competitiveThreats: Array<{
    threat: string;
    likelihood: 'high' | 'medium' | 'low';
    impact: 'high' | 'medium' | 'low';
    timeframe: string;
    mitigation: string;
  }>;
  barriersToBuild: Array<{
    barrier: string;
    category: 'capital' | 'expertise' | 'network' | 'regulation' | 'time' | 'partnerships';
    difficulty: 'high' | 'medium' | 'low';
    timeline: string;
    cost: string;
  }>;
  moatStrategy: {
    primaryMoat: string;
    secondaryMoats: string[];
    buildingSequence: string[];
    timeline: string;
    keyMilestones: string[];
  };
  firstMoverAdvantages: Array<{
    advantage: string;
    duration: 'permanent' | 'long-term' | 'medium-term' | 'short-term';
    strength: string;
  }>;
  networkEffects: {
    potential: 'high' | 'medium' | 'low' | 'none';
    type: string;
    scalingFactor: string;
    criticalMass: string;
  };
  switchingCosts: {
    dataLock: 'high' | 'medium' | 'low';
    learningCurve: 'high' | 'medium' | 'low';
    integration: 'high' | 'medium' | 'low';
    financialCost: 'high' | 'medium' | 'low';
  };
}

export async function researchCompetitiveMoat(
  oneLiner: string,
  targetAudience: string,
  problemSolved: string
): Promise<AIMoatData> {
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log('🏰 AI researching competitive moat for:', oneLiner.substring(0, 50) + '...');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are a strategic business analyst with expertise in competitive moats and defensibility. Analyze the potential competitive moat and defensibility for this startup idea:

STARTUP IDEA: "${oneLiner}"
TARGET AUDIENCE: "${targetAudience}"
PROBLEM SOLVED: "${problemSolved}"

Research and analyze:
1. DEFENSIBILITY FACTORS: What competitive advantages could this business build?
2. BARRIERS TO ENTRY: What would make it hard for competitors to replicate?
3. NETWORK EFFECTS: Does this business have network effect potential?
4. SWITCHING COSTS: How sticky could this solution be for users?
5. FIRST MOVER ADVANTAGES: What advantages come from being early?
6. COMPETITIVE THREATS: What are the biggest risks to defensibility?

For each defensibility factor, analyze:
- Network effects potential (direct, indirect, data network effects)
- Switching costs (data lock-in, learning curve, integration complexity)
- Economies of scale opportunities
- Brand and trust advantages
- Regulatory or compliance barriers
- Technology or patent potential
- Data advantages and accumulation

Also identify:
- Time and cost barriers for competitors to build similar solutions
- Strategic moat-building sequence and timeline
- Key milestones that strengthen competitive position
- Vulnerabilities and mitigation strategies

MOAT SCORING (0-100):
- 80-100: Exceptional (Strong network effects, regulatory moats, patents)
- 60-79: Strong (Data advantages, high switching costs, brand moats)
- 40-59: Moderate (Some defensibility, moderate barriers to entry)
- 25-39: Weak (Basic differentiation, low switching costs)
- 10-24: Minimal (Easy to replicate, commodity-like)
- 0-9: None (No defensibility, pure commodity)

BENCHMARKS:
- Meta: 95 (Network effects + data)
- Salesforce: 75 (Switching costs + integration)
- Stripe: 70 (Integration + brand trust)
- Uber: 45 (Network effects offset by competition)
- Most SaaS: 40-60 (Some stickiness but replicable)
- Generic app: 15-25 (Easy to copy)

IMPORTANT: Most viable software businesses have 40-60 point moats. Score based on realistic defensibility. Respond with ONLY valid JSON:

{
  "moatScore": 45,
  "defensibilityFactors": [
    {
      "factor": "specific defensibility factor",
      "category": "network-effects|switching-costs|economies-of-scale|brand|regulatory|technology|data|location",
      "strength": "high|medium|low",
      "sustainability": "long-term|medium-term|short-term",
      "details": "detailed analysis of this factor",
      "buildTime": "estimated time to build this advantage"
    }
  ],
  "competitiveThreats": [
    {
      "threat": "specific competitive threat",
      "likelihood": "high|medium|low",
      "impact": "high|medium|low", 
      "timeframe": "when this threat might emerge",
      "mitigation": "strategy to mitigate this threat"
    }
  ],
  "barriersToBuild": [
    {
      "barrier": "barrier competitors would face",
      "category": "capital|expertise|network|regulation|time|partnerships",
      "difficulty": "high|medium|low",
      "timeline": "time required to overcome",
      "cost": "estimated cost to overcome"
    }
  ],
  "moatStrategy": {
    "primaryMoat": "main defensive strategy to focus on",
    "secondaryMoats": ["supporting defensive strategies"],
    "buildingSequence": ["order of moat-building activities"],
    "timeline": "overall timeline to build strong moat",
    "keyMilestones": ["critical milestones for moat strength"]
  },
  "firstMoverAdvantages": [
    {
      "advantage": "specific first mover advantage",
      "duration": "permanent|long-term|medium-term|short-term",
      "strength": "analysis of advantage strength"
    }
  ],
  "networkEffects": {
    "potential": "high|medium|low|none",
    "type": "type of network effects possible",
    "scalingFactor": "how network effects would scale",
    "criticalMass": "estimated users needed for network effects"
  },
  "switchingCosts": {
    "dataLock": "high|medium|low",
    "learningCurve": "high|medium|low", 
    "integration": "high|medium|low",
    "financialCost": "high|medium|low"
  }
}

Research current business models and provide realistic defensibility analysis based on proven moat-building strategies.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiText = response.text();

  console.log('🤖 AI moat analysis response:', aiText.substring(0, 200) + '...');

  // Parse the JSON response
  const cleanText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const analysis: AIMoatData = JSON.parse(cleanText);

  // Validate the response structure
  if (!analysis.defensibilityFactors || !analysis.moatStrategy) {
    throw new Error('Invalid AI response: missing required moat data');
  }

  console.log(`✅ AI analyzed moat: ${analysis.moatScore}/100 score, ${analysis.defensibilityFactors.length} factors identified`);

  return analysis;
}