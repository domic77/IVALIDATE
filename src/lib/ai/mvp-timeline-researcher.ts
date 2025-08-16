import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIMVPTimelineData {
  totalTimelineWeeks: number;
  developmentPhases: Array<{
    phase: string;
    duration: number; // weeks
    description: string;
    deliverables: string[];
    dependencies: string[];
    risks: Array<{
      risk: string;
      impact: 'high' | 'medium' | 'low';
      mitigation: string;
    }>;
    teamRequirements: string[];
    estimatedCost: string;
  }>;
  criticalPath: Array<{
    milestone: string;
    week: number;
    importance: 'critical' | 'important' | 'nice-to-have';
    blockers: string[];
  }>;
  resourceRequirements: {
    technical: string[];
    design: string[];
    business: string[];
    totalBudgetRange: string;
    teamSize: string;
  };
  timeToMarket: {
    mvpLaunch: number; // weeks
    betaTesting: number; // weeks  
    marketReady: number; // weeks
    scaleReady: number; // weeks
  };
  technicalComplexity: {
    score: number; // 1-10
    factors: string[];
    estimatedDevTime: string;
    scalingChallenges: string[];
  };
  launchStrategy: {
    goToMarketApproach: string;
    initialUserAcquisition: string[];
    validationMethods: string[];
    successMetrics: string[];
  };
  postMVPRoadmap: Array<{
    feature: string;
    priority: 'high' | 'medium' | 'low';
    timeframe: string;
    userValue: string;
  }>;
}

export async function researchMVPTimeline(
  oneLiner: string,
  targetAudience: string,
  problemSolved: string
): Promise<AIMVPTimelineData> {
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  console.log('⏰ AI researching MVP timeline for:', oneLiner.substring(0, 50) + '...');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are a lean startup expert specializing in FAST MVP development. Create an aggressive but realistic timeline for this startup idea:

STARTUP IDEA: "${oneLiner}"
TARGET AUDIENCE: "${targetAudience}"
PROBLEM SOLVED: "${problemSolved}"

MVP PHILOSOPHY: Build the absolute minimum viable product to test core assumptions QUICKLY.

COMPLEXITY ASSESSMENT:
- Simple web app/landing page: 2-4 weeks
- Basic SaaS tool: 4-8 weeks  
- Mobile app: 6-10 weeks
- AI/ML product: 8-12 weeks
- Complex platform: 10-16 weeks

KEY PRINCIPLES:
1. MAXIMUM 12 weeks for ANY MVP (most should be 4-8 weeks)
2. Cut features ruthlessly - only core functionality
3. Use no-code/low-code where possible
4. Prioritize speed over perfection
5. Focus on validation, not polish

BENCHMARKS:
- Figma MVP: 6 weeks (design tool)
- Canva MVP: 8 weeks (design platform)
- Notion MVP: 10 weeks (productivity tool)
- Slack MVP: 8 weeks (communication tool)

CRITICAL: Keep timeline UNDER 10 weeks for most ideas. Only complex technical products should exceed this.

Respond with ONLY valid JSON:

{
  "totalTimelineWeeks": 8,
  "developmentPhases": [
    {
      "phase": "phase name",
      "duration": 2,
      "description": "what happens in this phase",
      "deliverables": ["specific deliverables"],
      "dependencies": ["what this phase depends on"],
      "risks": [
        {
          "risk": "specific risk",
          "impact": "high|medium|low",
          "mitigation": "how to mitigate this risk"
        }
      ],
      "teamRequirements": ["team members needed"],
      "estimatedCost": "cost range for this phase"
    }
  ],
  "criticalPath": [
    {
      "milestone": "critical milestone",
      "week": 4,
      "importance": "critical|important|nice-to-have",
      "blockers": ["potential blockers"]
    }
  ],
  "resourceRequirements": {
    "technical": ["technical skills needed"],
    "design": ["design skills needed"],
    "business": ["business skills needed"],
    "totalBudgetRange": "total estimated budget",
    "teamSize": "recommended team size"
  },
  "timeToMarket": {
    "mvpLaunch": 8,
    "betaTesting": 6,
    "marketReady": 8,
    "scaleReady": 16
  },
  "technicalComplexity": {
    "score": 5,
    "factors": ["complexity factors"],
    "estimatedDevTime": "development time estimate",
    "scalingChallenges": ["scaling challenges"]
  },
  "launchStrategy": {
    "goToMarketApproach": "recommended go-to-market strategy",
    "initialUserAcquisition": ["user acquisition methods"],
    "validationMethods": ["how to validate MVP"],
    "successMetrics": ["key success metrics"]
  },
  "postMVPRoadmap": [
    {
      "feature": "feature name",
      "priority": "high|medium|low",
      "timeframe": "when to build this",
      "userValue": "value this provides to users"
    }
  ]
}

Research current development practices and provide realistic MVP timeline analysis based on proven development methodologies.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const aiText = response.text();

  console.log('🤖 AI MVP timeline response:', aiText.substring(0, 200) + '...');

  // Parse the JSON response
  const cleanText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const analysis: AIMVPTimelineData = JSON.parse(cleanText);

  // Validate the response structure
  if (!analysis.developmentPhases || !analysis.timeToMarket) {
    throw new Error('Invalid AI response: missing required MVP timeline data');
  }

  console.log(`✅ AI analyzed MVP timeline: ${analysis.totalTimelineWeeks} weeks total, ${analysis.developmentPhases.length} phases`);

  return analysis;
}