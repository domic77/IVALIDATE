'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ValidationLayout } from '@/components/layouts/ValidationLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Share2, Target, XCircle } from 'lucide-react';
import { ValidationScoreCard } from '@/components/dashboard/ValidationScoreCard';
import { MarketDemandCard } from '@/components/dashboard/MarketDemandCard';
import { CompetitionCard } from '@/components/dashboard/CompetitionCard';
import { UVZCard } from '@/components/dashboard/UVZCard';
import { MarketSizeCard } from '@/components/dashboard/MarketSizeCard';
import { ScalabilityCard } from '@/components/dashboard/ScalabilityCard';
import { MoatCard } from '@/components/dashboard/MoatCard';
import { toast } from 'sonner';
import { getGradeColor } from '@/lib/utils';

interface ValidationResults {
  validationId: string;
  validation: any;
  score: any;
  insights: any;
  redditData?: any;
  competitorData?: any;
  aiAnalysis?: any;
  realData?: any;
  marketSizeData?: any;
  scalabilityData?: any;
  moatData?: any;
  uvzData?: any;
}

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const validationId = params?.validationId as string;
  
  const [results, setResults] = useState<ValidationResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!validationId) {
      setError('No validation ID provided');
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/validate/results?id=${validationId}`);
        const data = await response.json();

        if (!data.success) {
          setError(data.message || 'Failed to fetch results');
          return;
        }

        // Map the API response to what dashboard components expect with safe defaults
        const socialIntelligence = data.data.score?.evidenceReport?.socialIntelligence || {};
        const competitionAnalysis = data.data.score?.evidenceReport?.competitionAnalysis || {};
        const realData = data.data.score?.realData || {};
        
        // Extract AI research data from the pipeline results
        const marketSizeData = data.data.marketSizeData;
        const scalabilityData = data.data.scalabilityData;
        const moatData = data.data.moatData;
        const uvzData = data.data.uvzData;
        
        setResults({
          ...data.data,
          redditData: {
            realData: {
              totalMentions: realData?.redditMentions || 0,
              frustratedUsers: realData?.frustratedUsers || 0,
              topQuotes: socialIntelligence?.topQuotes || [],
              overallSentiment: socialIntelligence?.sentimentBreakdown?.frustratedPercent || 0,
              frustrationLevel: (socialIntelligence?.sentimentBreakdown?.frustratedPercent || 0) / 100
            },
            score: data.data.score?.marketDemand || 0,
            discussionVolume: socialIntelligence?.postsFound || 0,
            engagementLevel: socialIntelligence?.topQuotes?.reduce((sum: number, q: any) => sum + (q.upvotes || 0), 0) / Math.max(1, socialIntelligence?.topQuotes?.length || 1) || 0
          },
          competitorData: {
            competitors: data.data.competitorData?.competitors || [],
            directCompetitors: data.data.competitorData?.competitors?.length || 0,
            complaints: data.data.competitorData?.complaints || [],
            identifiedGaps: competitionAnalysis?.identifiedGaps || [],
            opportunities: data.data.competitorData?.opportunities || [],
            marketGaps: data.data.competitorData?.marketGaps || []
          },
          aiAnalysis: data.data.insights?.aiAnalysis,
          realData: {
            redditMentions: realData?.redditMentions || 0,
            competitorsFound: data.data.competitorData?.competitors?.length || 0,
            totalDataPoints: data.data.validation?.totalDataPoints || 0,
            frustratedUsers: realData?.frustratedUsers || 0
          },
          // Add the new AI research data
          marketSizeData,
          scalabilityData,
          moatData,
          uvzData
        });
      } catch (err) {
        setError('Failed to load validation results');
        console.error('Results fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [validationId]);

  // Generate AI summary after results are loaded
  useEffect(() => {
    if (results && !aiSummary && !summaryLoading) {
      generateAISummary();
    }
  }, [results]);

  const generateAISummary = async () => {
    if (!results) return;
    
    setSummaryLoading(true);
    try {
      const response = await fetch('/api/validate/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: results.score,
          redditData: results.redditData,
          competitorData: results.competitorData,
          marketSizeData: results.marketSizeData,
          scalabilityData: results.scalabilityData,
          moatData: results.moatData,
          uvzData: results.uvzData,
          realData: results.realData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAiSummary(data.summary);
      } else {
        console.error('Failed to generate AI summary:', data.error);
      }
    } catch (error) {
      console.error('AI summary generation error:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loading) {
    return (
      <ValidationLayout>
        <div className="h-full bg-gray-100 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-700">Loading validation results...</span>
          </div>
        </div>
      </ValidationLayout>
    );
  }

  if (error || !results) {
    return (
      <ValidationLayout>
        <div className="h-full bg-gray-100 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center p-6 bg-white rounded-lg border-2 border-red-200">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-red-600 mb-2">Unable to Load Results</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex gap-2">
                <Button onClick={() => router.push('/')} variant="outline" className="flex-1 border-gray-300 hover:bg-gray-100">
                  Start New Validation
                </Button>
                <Button onClick={() => router.back()} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ValidationLayout>
    );
  }

  const { score, insights, redditData, competitorData, aiAnalysis, realData, marketSizeData, scalabilityData, moatData, uvzData } = results;

  return (
    <ValidationLayout>
      <div className="h-full bg-gray-100 overflow-y-auto w-full min-w-0">
        {/* Main Content */}
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Executive Score Card */}
        <div className="mb-6 sm:mb-8">
          <ValidationScoreCard 
            score={score} 
            aiAnalysis={aiAnalysis} 
            realData={realData}
            marketSizeData={marketSizeData}
            scalabilityData={scalabilityData}
            moatData={moatData}
          />
        </div>

        {/* Stacked Cards - Vertical Layout */}
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          {/* Core Analysis Cards */}
          <MarketDemandCard 
            redditData={redditData} 
            realData={realData}
          />
          
          <CompetitionCard 
            competitorData={competitorData} 
            realData={realData}
          />

          {/* Strategic Cards */}
          <UVZCard 
            uvzData={uvzData}
          />
          
          <MarketSizeCard 
            marketSizeData={marketSizeData}
          />
          
          <ScalabilityCard 
            scalabilityData={scalabilityData}
          />

          {/* Implementation Cards */}
          <MoatCard 
            moatData={moatData}
          />

          {/* AI Summary Card */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6 w-full">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Summary</h3>
              {summaryLoading && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
            </div>
            
            {summaryLoading ? (
              <div className="text-center py-6">
                <div className="text-gray-600">Generating comprehensive AI analysis...</div>
              </div>
            ) : aiSummary ? (
              <div className="space-y-4">
                {/* Main Recommendation */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-bold text-lg text-blue-900">
                      🎯 Recommendation: {aiSummary.recommendation}
                    </div>
                    <Badge className={`text-xs px-2 py-1 ${
                      aiSummary.confidenceLevel === 'High' ? 'bg-green-100 text-green-800' :
                      aiSummary.confidenceLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {aiSummary.confidenceLevel} Confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">{aiSummary.reasoning}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-medium text-blue-800 mb-1">Market Opportunity:</div>
                      <div className="text-blue-600">{aiSummary.marketOpportunity}</div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-800 mb-1">Competitive Position:</div>
                      <div className="text-blue-600">{aiSummary.competitivePosition}</div>
                    </div>
                  </div>
                </div>

                {/* Strengths and Concerns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-semibold text-green-900 text-sm mb-2">💪 Key Strengths</div>
                    <ul className="text-xs text-green-700 space-y-1">
                      {aiSummary.keyStrengths.map((strength: string, index: number) => (
                        <li key={index}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="font-semibold text-orange-900 text-sm mb-2">⚠️ Main Concerns</div>
                    <ul className="text-xs text-orange-700 space-y-1">
                      {aiSummary.mainConcerns.map((concern: string, index: number) => (
                        <li key={index}>• {concern}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Items */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="font-semibold text-purple-900 text-sm mb-2">🚀 Next Steps</div>
                  <ul className="text-xs text-purple-700 space-y-1">
                    {aiSummary.actionItems.map((action: string, index: number) => (
                      <li key={index}>• {action}</li>
                    ))}
                  </ul>
                </div>

                {/* Data Quality */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="font-semibold text-gray-900 text-xs mb-1">
                    📊 Analysis Based On: {realData?.totalDataPoints || 0} real data points
                  </div>
                  <div className="text-xs text-gray-600">
                    Social media data • Market research • Competitive analysis
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-gray-600 mb-2">AI analysis temporarily unavailable</div>
                <Button 
                  onClick={generateAISummary}
                  variant="outline"
                  size="sm"
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  Generate AI Summary
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Ready to take action?</h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Your validation is complete. Use these insights to make informed decisions about your startup idea.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.push('/')} size="lg" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Validate Another Idea
            </Button>
            <Button variant="outline" size="lg" onClick={() => toast.info('Export feature coming soon!')} className="border-gray-300 hover:bg-gray-100 w-full sm:w-auto">
              Download Full Report
            </Button>
          </div>
        </div>
        </main>
      </div>
    </ValidationLayout>
  );
}