import { GoogleGenerativeAI } from '@google/generative-ai';

interface ValidationSummaryData {
  score: any;
  redditData?: any;
  competitorData?: any;
  marketSizeData?: any;
  scalabilityData?: any;
  moatData?: any;
  uvzData?: any;
  realData?: any;
}

interface ValidationSummary {
  recommendation: 'BUILD' | 'PIVOT' | 'AVOID';
  reasoning: string;
  keyStrengths: string[];
  mainConcerns: string[];
  actionItems: string[];
  confidenceLevel: 'High' | 'Medium' | 'Low';
  marketOpportunity: string;
  competitivePosition: string;
}

export async function generateValidationSummary(data: ValidationSummaryData): Promise<ValidationSummary> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Debug: Log the incoming data structure
  console.log('🔍 AI Summary Debug - Incoming data:', {
    score: data.score,
    uvzData: data.uvzData,
    scalabilityData: data.scalabilityData,
    realData: data.realData
  });

  // Prepare comprehensive data for AI analysis
  const analysisData = {
    overallScore: data.score?.overall?.score || data.score?.overall || data.score?.score || 0,
    marketDemand: data.score?.marketDemand?.score || data.score?.marketDemand || 0,
    socialData: {
      totalMentions: data.realData?.redditMentions || 0,
      frustratedUsers: data.realData?.frustratedUsers || 0,
      topQuotes: data.redditData?.realData?.topQuotes?.slice(0, 5) || []
    },
    competition: {
      competitorsFound: data.realData?.competitorsFound || 0,
      complaints: data.competitorData?.complaints?.slice(0, 3) || [],
      opportunities: data.competitorData?.opportunities?.slice(0, 3) || []
    },
    marketSize: {
      totalMarket: data.marketSizeData?.totalAddressableMarket?.value || 0,
      growthRate: data.marketSizeData?.marketGrowthRate?.annual || 0,
      segments: data.marketSizeData?.marketSegments?.slice(0, 2) || []
    },
    scalability: {
      score: data.scalabilityData?.scalabilityScore || 0,
      businessModel: data.scalabilityData?.businessModel?.type || 'Unknown',
      growthFactors: data.scalabilityData?.scalingFactors?.slice(0, 3) || []
    },
    moat: {
      score: data.moatData?.moatScore || 0,
      strategy: data.moatData?.moatStrategy?.primaryMoat || 'Unknown',
      threats: data.moatData?.competitiveThreats?.slice(0, 2) || []
    },
    uniqueValue: {
      score: data.uvzData?.uvzScore || data.uvzData?.score || 0,
      advantages: data.uvzData?.competitiveAdvantages?.slice(0, 3) || data.uvzData?.advantages?.slice(0, 3) || [],
      differentiators: data.uvzData?.keyDifferentiators?.slice(0, 2) || data.uvzData?.differentiators?.slice(0, 2) || []
    }
  };

  // Debug: Log the processed analysis data
  console.log('🔍 AI Summary Debug - Processed data:', {
    overallScore: analysisData.overallScore,
    uniqueValueScore: analysisData.uniqueValue.score,
    scalabilityScore: analysisData.scalability.score,
    moatScore: analysisData.moat.score
  });

  const prompt = `You are a startup validation expert analyzing comprehensive market research data. Provide a strategic summary and recommendation.

VALIDATION DATA:
Overall Score: ${analysisData.overallScore}/100
Market Demand Score: ${analysisData.marketDemand}/100

MARKET RESEARCH:
- Social mentions: ${analysisData.socialData.totalMentions}
- Frustrated users: ${analysisData.socialData.frustratedUsers}
- Sample user quotes: ${analysisData.socialData.topQuotes.map((q: any) => `"${q.quote}"`).join(', ')}

COMPETITION:
- Competitors found: ${analysisData.competition.competitorsFound}
- User complaints about existing solutions: ${analysisData.competition.complaints.join(', ')}
- Market opportunities: ${analysisData.competition.opportunities.join(', ')}

MARKET SIZE:
- Total addressable market: $${analysisData.marketSize.totalMarket.toLocaleString()}
- Annual growth rate: ${analysisData.marketSize.growthRate}%
- Key segments: ${analysisData.marketSize.segments.map((s: any) => s.name).join(', ')}

SCALABILITY:
- Scalability score: ${analysisData.scalability.score}/100
- Business model: ${analysisData.scalability.businessModel}
- Growth factors: ${analysisData.scalability.growthFactors.join(', ')}

COMPETITIVE PROTECTION:
- Moat score: ${analysisData.moat.score}/100
- Protection strategy: ${analysisData.moat.strategy}
- Main threats: ${analysisData.moat.threats.join(', ')}

UNIQUE VALUE:
- Uniqueness score: ${analysisData.uniqueValue.score}/100
- Key advantages: ${analysisData.uniqueValue.advantages.join(', ')}
- Differentiators: ${analysisData.uniqueValue.differentiators.join(', ')}

Based on this comprehensive analysis, provide a strategic assessment. Be realistic about market validation - a score of 50+ often indicates decent market opportunity. Focus on practical next steps rather than being overly critical.

Respond with ONLY valid JSON in this exact format:

{
  "recommendation": "BUILD|PIVOT|AVOID",
  "reasoning": "2-3 sentence explanation of the recommendation based on the data",
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "mainConcerns": ["concern 1", "concern 2", "concern 3"],
  "actionItems": ["action 1", "action 2", "action 3"],
  "confidenceLevel": "High|Medium|Low",
  "marketOpportunity": "1 sentence about market potential",
  "competitivePosition": "1 sentence about competitive landscape"
}

RECOMMENDATION CRITERIA:
- BUILD: Score 60+, decent market validation, viable opportunity
- PIVOT: Score 40-59, weak validation, consider significant changes
- AVOID: Score <40, poor market validation or major red flags

Be objective and base recommendations strictly on the data provided.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    console.log('🤖 AI validation summary response:', aiText.substring(0, 200) + '...');

    // Parse the JSON response with robust handling
    let summary: ValidationSummary;
    try {
      let cleanText = aiText.trim();
      
      // Remove ALL markdown formatting completely
      cleanText = cleanText
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/gi, '')
        .replace(/^```/g, '')
        .replace(/```$/g, '')
        .trim();
      
      // Extract JSON from response (find first complete JSON object)
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }
      
      // Conservative JSON cleaning - only fix obvious issues
      cleanText = cleanText
        // Remove any trailing commas before closing braces/brackets
        .replace(/,(\s*[}\]])/g, '$1')
        // Fix unescaped newlines within string values only
        .replace(/("reasoning"\s*:\s*"[^"]*)\n([^"]*")/g, '$1\\n$2')
        .replace(/("description"\s*:\s*"[^"]*)\n([^"]*")/g, '$1\\n$2');
      
      console.log('🧹 Final cleaned text:', cleanText.substring(0, 300));
      
      summary = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('❌ JSON parse error in validation summary:', parseError);
      console.error('📄 Full AI response for debugging:', aiText);
      console.error('📄 Cleaned text that failed:', cleanText?.substring(0, 500));
      throw new Error(`Failed to parse AI summary response: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
    }

    // Validate the response structure
    if (!summary.recommendation || !summary.reasoning) {
      throw new Error('Invalid AI summary response: missing required fields');
    }

    console.log(`✅ Generated validation summary: ${summary.recommendation} - ${summary.reasoning}`);
    
    return summary;

  } catch (error) {
    console.error('❌ AI validation summary failed:', error);
    throw new Error(`AI validation summary failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}