import { updateValidation } from '@/lib/storage/json';
import { extractKeywordsWithBestAI, AIProvider } from '@/lib/ai/ai-provider';
import { searchRedditDiscussions } from '@/lib/api/reddit';
import { researchCompetitors } from '@/lib/ai/competitor-researcher';
import { researchMarketSize } from '@/lib/ai/market-size-researcher';
import { researchScalability } from '@/lib/ai/scalability-researcher';
import { researchCompetitiveMoat } from '@/lib/ai/moat-researcher';
import { researchUniqueValueZone } from '@/lib/ai/uvz-researcher';
import { analyzeStartupWithBestAI } from '@/lib/ai/ai-provider';
import { calculateRealValidationScore } from '@/lib/scoring/real-validation-scorer';
import { generateEvidenceReport, formatEvidenceReport } from '@/lib/reports/evidence-report-generator';
import { saveAIKeywordDebug, saveRedditSearchDebug, saveDebugLog } from '@/lib/storage/debug-storage';

export interface ProcessingStep {
  step: number;
  title: string;
  description: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dataFound?: number;
  errorMessage?: string;
}

export interface ProcessingResult {
  success: boolean;
  data?: any;
  error?: string;
  dataPoints?: number;
}

export class ValidationPipeline {
  private validationId: string;
  private ideaDescription: string;
  private refinedIdeaData?: {
    oneLiner: string;
    targetAudience: string;
    problem: string;
  };
  
  private steps: ProcessingStep[] = [
    {
      step: 1,
      title: 'Extract Keywords',
      description: 'Using AI to extract searchable keywords from your idea...',
      progress: 15,
      status: 'pending'
    },
    {
      step: 2, 
      title: 'Search Reddit',
      description: 'Searching Reddit discussions for real user problems...',
      progress: 35,
      status: 'pending'
    },
    {
      step: 3,
      title: 'Analyze Sentiment',
      description: 'Analyzing sentiment of real posts to calculate demand...',
      progress: 55,
      status: 'pending'
    },
    {
      step: 4,
      title: 'AI Competitor Research',
      description: 'AI researching current competitors in the market...',
      progress: 75,
      status: 'pending'
    },
    {
      step: 5,
      title: 'AI Market Research', 
      description: 'AI researching market size and growth data...',
      progress: 75,
      status: 'pending'
    },
    {
      step: 6,
      title: 'AI Scalability Research',
      description: 'AI analyzing business scalability and growth potential...',
      progress: 80,
      status: 'pending'
    },
    {
      step: 7,
      title: 'AI Moat Research',
      description: 'AI researching competitive moat and defensibility...',
      progress: 85,
      status: 'pending'
    },
    {
      step: 8,
      title: 'AI UVZ Research',
      description: 'AI researching unique value zone and competitive differentiation...',
      progress: 90,
      status: 'pending'
    },
    {
      step: 9,
      title: 'Generate Report',
      description: 'Combining all real data into evidence-based report...',
      progress: 95,
      status: 'pending'
    },
    {
      step: 10,
      title: 'Calculate Scores',
      description: 'Computing final validation scores from real metrics...',
      progress: 100,
      status: 'pending'
    }
  ];

  constructor(validationId: string, ideaDescription: string, refinedIdeaData?: { oneLiner: string; targetAudience: string; problem: string }) {
    this.validationId = validationId;
    this.ideaDescription = ideaDescription;
    this.refinedIdeaData = refinedIdeaData;
  }

  async execute(): Promise<any> {
    console.log(`🚀 Starting validation pipeline for: ${this.ideaDescription.substring(0, 50)}...`);
    
    let keywords: string[] = [];
    let redditData: any;
    let competitorData: any;
    let aiAnalysis: any;

    try {
      // Step 1: Extract Keywords (with AI subreddit intelligence)
      const keywordResult = await this.executeStep(1, async () => {
        console.log('🔍 Using AI to find best Reddit communities and keywords...');
        
        let aiKeywordData = null;
        
        // If we have refined idea data, use AI to get smart subreddit recommendations
        if (this.refinedIdeaData) {
          console.log('🎯 Using refined idea data for intelligent Reddit targeting...');
          
          try {
            // Call the keyword generation API directly instead of using fetch
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            
            if (!process.env.GEMINI_API_KEY) {
              throw new Error('GEMINI_API_KEY not configured');
            }
            
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
            
            const prompt = `You are an expert Reddit researcher with deep knowledge of active communities. Your task is to identify 6-8 REAL, PUBLIC subreddits where people actively discuss problems related to this startup idea.

STARTUP IDEA: "${this.refinedIdeaData.oneLiner}"
TARGET AUDIENCE: "${this.refinedIdeaData.targetAudience}"  
PROBLEM SOLVED: "${this.refinedIdeaData.problem}"

RESEARCH METHODOLOGY - Follow this systematic approach:

1. IDENTIFY PROBLEM CATEGORIES:
   - What specific pain points does this solve?
   - What daily frustrations do users face?
   - What workflows or processes are broken?

2. MAP AUDIENCE TO COMMUNITIES:
   - Where does this target audience already gather on Reddit?
   - What are their professional, hobby, or interest-based communities?
   - Which demographic-specific subreddits do they frequent?

3. FIND COMPLAINT & HELP-SEEKING COMMUNITIES:
   - General complaint subreddits where people vent about this problem
   - Professional communities where this audience asks for solutions
   - Industry-specific subreddits where this problem is commonly discussed

VERIFIED HIGH-QUALITY SUBREDDITS (examples of proven active communities):

BUSINESS/PROFESSIONAL:
- entrepreneur (2.1M members, high activity) - startup questions, business problems
- smallbusiness (1.8M members, high activity) - operational challenges
- freelance (240K members, medium activity) - independent worker issues
- startups (1.2M members, medium activity) - early-stage company problems
- sales (180K members, medium activity) - selling challenges and tools

PROBLEM/COMPLAINT COMMUNITIES:
- mildlyinfuriating (16M members, very high) - daily annoyances and problems
- assholedesign (2.8M members, high) - poorly designed products/services
- crappydesign (3.2M members, high) - frustration with bad design
- techsupport (1.2M members, high) - technical problem solving

INDUSTRY-SPECIFIC (choose relevant ones):
- webdev (1.8M members, high) - web development problems
- marketing (680K members, medium) - marketing challenges
- productivity (450K members, medium) - efficiency and workflow issues
- sysadmin (450K members, medium) - IT operations problems
- cscareerquestions (950K members, high) - tech career challenges

DEMOGRAPHIC/LIFESTYLE:
- workingmoms (85K members, medium) - working parent challenges  
- college (1.1M members, high) - student problems and solutions
- careerchange (120K members, medium) - professional transition issues
- remotework (220K members, medium) - remote work challenges

SELECTION CRITERIA (be very strict):
✓ Must have 50K+ active members (avoid small/dead communities)
✓ Daily posts and comments (check recent activity)
✓ Regular problem discussions (people asking for help/solutions)
✓ Target audience presence (your users actually participate here)
✓ Public access (no private/restricted communities)
✓ English-speaking (avoid foreign language subreddits unless specified)

SEARCH STRATEGY:
- Use problem-specific keywords people actually type
- Include solution-seeking language ("how to", "best way", "alternatives")
- Add frustrated/complaint terms ("sucks", "hate", "terrible", "broken")
- Focus on action-oriented queries that show intent to solve problems

IMPORTANT: Return ONLY valid JSON with NO markdown formatting:

{
  "recommendedSubreddits": [
    {
      "name": "exact_subreddit_name",
      "reason": "Specific explanation of why this community discusses your problem",
      "memberCount": "actual member count like '1.2M' or 'large' if unknown",
      "activityLevel": "high/medium based on daily post volume"
    }
  ],
  "searchKeywords": ["specific terms your target audience types when they have this problem"],
  "focusQueries": ["solution-seeking queries like 'how to solve X' or 'best X alternative'"],
  "painPointQueries": ["complaint/frustration queries like 'X is terrible' or 'hate dealing with X'"]
}

Select 6-8 diverse subreddits covering:
- 2-3 problem/complaint communities (broad reach)
- 2-3 target audience professional communities  
- 2-3 industry/niche specific communities
- Focus on communities with regular help-seeking posts about your specific problem type`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const aiText = response.text();
            
            console.log('🤖 AI response for keywords:', aiText.substring(0, 200) + '...');
            
            // Parse the JSON response with error handling
            try {
              let cleanText = aiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
              
              // Try to extract JSON if it's embedded in other text
              const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                cleanText = jsonMatch[0];
              }
              
              aiKeywordData = JSON.parse(cleanText);
            } catch (keywordParseError) {
              console.error('❌ Failed to parse AI keyword response:', keywordParseError);
              console.error('Raw AI keyword response:', aiText);
              throw new Error(`Failed to parse AI keyword response as JSON: ${keywordParseError instanceof Error ? keywordParseError.message : 'Unknown parse error'}`);
            }
            
            if (!aiKeywordData.recommendedSubreddits || !aiKeywordData.searchKeywords || !aiKeywordData.focusQueries) {
              throw new Error('AI returned incomplete keyword data');
            }
            
            console.log('✅ AI recommended', aiKeywordData.recommendedSubreddits.length, 'subreddits');
            keywords = aiKeywordData.searchKeywords;
            
            // Save debug data for AI keyword generation
            await saveAIKeywordDebug(this.validationId, {
              refinedIdeaInput: this.refinedIdeaData,
              aiResponse: aiKeywordData,
              success: true,
              rawAIText: aiText
            });
            
          } catch (aiError) {
            console.error('❌ AI keyword generation failed:', aiError);
            
            // Save debug data for failed AI keyword generation
            await saveAIKeywordDebug(this.validationId, {
              refinedIdeaInput: this.refinedIdeaData,
              aiResponse: { recommendedSubreddits: [], searchKeywords: [], focusQueries: [] },
              success: false,
              error: aiError instanceof Error ? aiError.message : 'Unknown AI error'
            });
            
            throw aiError;
          }
        } else {
          throw new Error('Refined idea data REQUIRED - no fallback available');
        }
        
        return {
          success: true,
          data: { keywords, aiKeywordData },
          dataPoints: keywords.length + (aiKeywordData?.recommendedSubreddits?.length || 0)
        };
      });

      if (!keywordResult.success) throw new Error('Keyword extraction failed');
      keywords = keywordResult.data.keywords;
      const aiKeywordData = keywordResult.data.aiKeywordData;
      
      if (aiKeywordData) {
        await this.updateStepStatus(1, 'completed', `AI found ${aiKeywordData.recommendedSubreddits.length} target subreddits + ${keywords.length} keywords`);
      } else {
        await this.updateStepStatus(1, 'completed', `Found ${keywords.length} keywords: ${keywords.slice(0, 3).join(', ')}...`);
      }

      // Step 2: Search Reddit with AI-powered targeting
      const redditResult = await this.executeStep(2, async () => {
        console.log('📡 Searching Reddit with AI intelligence...');
        
        let data;
        
        if (aiKeywordData) {
          // Use AI-recommended subreddits and queries + pass refined idea data for AI analysis
          console.log('🎯 Using AI-recommended subreddits:', aiKeywordData.recommendedSubreddits.map((s: any) => s.name).join(', '));
          data = await searchRedditDiscussions(
            keywords, 
            this.ideaDescription,
            {
              targetSubreddits: aiKeywordData.recommendedSubreddits.map((s: any) => s.name),
              focusQueries: aiKeywordData.focusQueries,
              painPointQueries: aiKeywordData.painPointQueries,
              refinedIdeaData: this.refinedIdeaData
            }
          );
        } else {
          throw new Error('AI keyword generation required for refined idea validation');
        }
        
        const mentions = data.realData?.totalMentions || 0;
        return {
          success: true, // Always continue pipeline even with 0 mentions
          data,
          dataPoints: mentions
        };
      });

      redditData = redditResult.data;
      const redditMentions = redditData?.realData?.totalMentions || 0;
      await this.updateStepStatus(2, redditResult.success ? 'completed' : 'failed', 
        redditResult.success ? `Found ${redditMentions} real Reddit discussions` : 'No Reddit discussions found');

      // Step 3: Analyze Sentiment (part of Reddit data)
      await this.executeStep(3, async () => {
        console.log('😡 Analyzing sentiment of real posts...');
        if (redditData?.realData) {
          const frustrated = redditData.realData.frustratedUsers;
          const total = redditData.realData.totalMentions;
          const frustrationPercent = total > 0 ? Math.round((frustrated / total) * 100) : 0;
          
          await this.updateStepStatus(3, 'completed', `${frustrationPercent}% of users frustrated with current solutions`);
          return { success: true, data: { frustrationPercent, frustrated, total }, dataPoints: total };
        } else {
          await this.updateStepStatus(3, 'completed', 'No posts found - continuing with limited data analysis');
          return { success: true, data: { frustrationPercent: 0, frustrated: 0, total: 0 }, dataPoints: 0 };
        }
      });

      // Step 4: AI Competitor Research  
      const competitorResult = await this.executeStep(4, async () => {
        console.log('🤖 AI researching competitors in the market...');
        
        if (!this.refinedIdeaData) {
          throw new Error('Refined idea data required for AI competitor research');
        }
        
        const aiCompetitorData = await researchCompetitors(
          this.refinedIdeaData.oneLiner,
          this.refinedIdeaData.targetAudience, 
          this.refinedIdeaData.problem
        );
        
        // Convert AI data to expected format for compatibility
        const data = {
          competitors: aiCompetitorData.competitors.map(comp => ({
            name: comp.name,
            mentions: 1, // AI found them, so count as 1 mention
            sentiment: comp.userComplaints.length > 0 ? 'negative' : 'positive',
            source: 'AI Research',
            description: comp.description,
            fundingStatus: comp.fundingStatus,
            strengths: comp.strengths,
            weaknesses: comp.weaknesses,
            pricing: comp.pricing,
            category: comp.category,
            marketPosition: comp.marketPosition
          })),
          complaints: aiCompetitorData.competitors.flatMap(comp => 
            comp.userComplaints.map(complaint => ({
              competitor: comp.name,
              complaint: complaint,
              author: 'AI Research',
              subreddit: 'Market Research',
              severity: 'medium' as const
            }))
          ),
          opportunities: aiCompetitorData.opportunities,
          marketGaps: aiCompetitorData.marketGaps,
          competitiveLandscape: aiCompetitorData.competitiveLandscape,
          totalCompetitors: aiCompetitorData.totalCompetitors
        };
        
        return {
          success: true,
          data,
          dataPoints: data.competitors.length + data.complaints.length
        };
      });

      competitorData = competitorResult.data;
      await this.updateStepStatus(4, 'completed', `Found ${competitorData.competitors.length} competitors, ${competitorData.complaints.length} user complaints`);

      // Step 5: AI Market Size Research
      let marketSizeData: any;
      const marketSizeResult = await this.executeStep(5, async () => {
        console.log('📊 AI researching market size and growth data...');
        
        if (!this.refinedIdeaData) {
          throw new Error('Refined idea data required for AI market size research');
        }
        
        const aiMarketData = await researchMarketSize(
          this.refinedIdeaData.oneLiner,
          this.refinedIdeaData.targetAudience,
          this.refinedIdeaData.problem
        );
        
        return {
          success: true,
          data: aiMarketData,
          dataPoints: aiMarketData.marketSegments.length
        };
      });

      marketSizeData = marketSizeResult.data;
      await this.updateStepStatus(5, 'completed', `TAM: $${(marketSizeData.totalAddressableMarket.value / 1000000).toFixed(1)}M, Growth: ${marketSizeData.marketGrowthRate.annual}%`);

      // Step 6: AI Scalability Research
      let scalabilityData: any;
      const scalabilityResult = await this.executeStep(6, async () => {
        console.log('🚀 AI researching business scalability and growth potential...');
        
        if (!this.refinedIdeaData) {
          throw new Error('Refined idea data required for AI scalability research');
        }
        
        const aiScalabilityData = await researchScalability(
          this.refinedIdeaData.oneLiner,
          this.refinedIdeaData.targetAudience,
          this.refinedIdeaData.problem
        );
        
        return {
          success: true,
          data: aiScalabilityData,
          dataPoints: aiScalabilityData.scalingFactors.length
        };
      });

      scalabilityData = scalabilityResult.data;
      await this.updateStepStatus(6, 'completed', `Scalability Score: ${scalabilityData.scalabilityScore}/100, Model: ${scalabilityData.businessModel.type.toUpperCase()}`);

      // Step 7: AI Moat Research
      let moatData: any;
      const moatResult = await this.executeStep(7, async () => {
        console.log('🏰 AI researching competitive moat and defensibility...');
        
        if (!this.refinedIdeaData) {
          throw new Error('Refined idea data required for AI moat research');
        }
        
        const aiMoatData = await researchCompetitiveMoat(
          this.refinedIdeaData.oneLiner,
          this.refinedIdeaData.targetAudience,
          this.refinedIdeaData.problem
        );
        
        return {
          success: true,
          data: aiMoatData,
          dataPoints: aiMoatData.defensibilityFactors.length
        };
      });

      moatData = moatResult.data;
      await this.updateStepStatus(7, 'completed', `Moat Score: ${moatData.moatScore}/100, ${moatData.defensibilityFactors.length} factors identified`);

      // Step 8: AI UVZ Research
      let uvzData: any;
      const uvzResult = await this.executeStep(8, async () => {
        console.log('🎯 AI researching unique value zone and competitive differentiation...');
        
        if (!this.refinedIdeaData) {
          throw new Error('Refined idea data required for AI UVZ research');
        }
        
        const aiUVZData = await researchUniqueValueZone(
          this.refinedIdeaData.oneLiner,
          this.refinedIdeaData.targetAudience,
          this.refinedIdeaData.problem
        );
        
        return {
          success: true,
          data: aiUVZData,
          dataPoints: aiUVZData.competitiveAdvantages.length
        };
      });

      uvzData = uvzResult.data;
      await this.updateStepStatus(8, 'completed', `UVZ Score: ${uvzData.uniquenessScore}/100, ${uvzData.competitiveAdvantages.length} advantages identified`);

      // Step 9: Generate AI Analysis  
      await this.executeStep(9, async () => {
        console.log('🤖 Running AI analysis on collected data...');
        const result = await analyzeStartupWithBestAI({
          idea: this.ideaDescription,
          industry: '',
          targetMarket: '',
          redditInsights: redditData,
          trendsData: null
        }, AIProvider.GEMINI);
        
        aiAnalysis = result.analysis;
        await this.updateStepStatus(9, 'completed', `AI analysis completed using ${result.provider}`);
        return { success: true, data: aiAnalysis, dataPoints: 1 };
      });

      // Step 10: Calculate Final Scores & Generate Report
      const finalResult = await this.executeStep(10, async () => {
        console.log('📊 Calculating final scores from real data...');
        
        // Calculate real validation scores
        const realScores = calculateRealValidationScore(redditData, null);
        
        // Generate evidence report
        const evidenceReport = generateEvidenceReport(redditData, null, aiAnalysis, this.ideaDescription);
        const formattedReport = formatEvidenceReport(evidenceReport, this.ideaDescription);
        
        const totalDataPoints = (redditData?.realData?.totalMentions || 0) + 
                               (competitorData?.competitors?.length || 0);

        const finalScore = {
          overall: realScores.overall.score,
          grade: realScores.overall.grade,
          marketDemand: realScores.marketDemand.score,
          competition: realScores.competition.score,
          confidence: realScores.overall.confidence,
          evidenceReport,
          formattedReport,
          realData: {
            redditMentions: redditData?.realData?.totalMentions || 0,
            frustratedUsers: redditData?.realData?.frustratedUsers || 0,
            competitorsFound: competitorData?.competitors?.length || 0,
            totalDataPoints
          }
        };

        await this.updateStepStatus(10, 'completed', `Validation complete! Grade: ${finalScore.grade} (${totalDataPoints} data points analyzed)`);
        
        return { success: true, data: finalScore, dataPoints: totalDataPoints };
      });

      console.log('✅ Validation pipeline completed successfully');
      return {
        success: true,
        finalScore: finalResult.data,
        competitorData: competitorData,
        marketSizeData: marketSizeData,
        scalabilityData: scalabilityData,
        moatData: moatData,
        uvzData: uvzData,
        steps: this.steps,
        totalDataPoints: finalResult.dataPoints
      };

    } catch (error) {
      console.error('❌ Validation pipeline failed:', error);
      
      // Mark current step as failed
      const currentStep = this.steps.find(s => s.status === 'processing');
      if (currentStep) {
        await this.updateStepStatus(currentStep.step, 'failed', error instanceof Error ? error.message : 'Unknown error');
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Pipeline execution failed',
        steps: this.steps
      };
    }
  }

  private async executeStep(stepNumber: number, stepFunction: () => Promise<ProcessingResult>): Promise<ProcessingResult> {
    const step = this.steps.find(s => s.step === stepNumber);
    if (!step) throw new Error(`Step ${stepNumber} not found`);

    // Mark step as processing
    await this.updateStepStatus(stepNumber, 'processing');

    try {
      const result = await stepFunction();
      return result;
    } catch (error) {
      console.error(`Step ${stepNumber} failed:`, error);
      await this.updateStepStatus(stepNumber, 'failed', error instanceof Error ? error.message : 'Step failed');
      throw error;
    }
  }

  private async updateStepStatus(stepNumber: number, status: ProcessingStep['status'], description?: string, dataFound?: number) {
    const step = this.steps.find(s => s.step === stepNumber);
    if (!step) return;

    step.status = status;
    if (description) step.description = description;
    if (dataFound !== undefined) step.dataFound = dataFound;

    // Update validation progress in database
    const currentStep = this.steps.find(s => s.status === 'processing') || 
                       this.steps.find(s => s.status === 'completed' && s.step === stepNumber);
    
    if (currentStep) {
      await updateValidation(this.validationId, {
        progress: currentStep.progress,
        currentStep: currentStep.description,
        processingSteps: this.steps
      });
    }

    console.log(`Step ${stepNumber}: ${status.toUpperCase()} - ${description}`);
  }

  public getSteps(): ProcessingStep[] {
    return this.steps;
  }

  public getCurrentStep(): ProcessingStep | undefined {
    return this.steps.find(s => s.status === 'processing') || 
           this.steps.find(s => s.status === 'completed' && s.step === Math.max(...this.steps.filter(s => s.status === 'completed').map(s => s.step)));
  }
}