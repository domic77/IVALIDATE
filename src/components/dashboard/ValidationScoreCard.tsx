'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Database, Users, TrendingUp, Building, Shield, Rocket, DollarSign, Zap, Crown } from 'lucide-react';
import { getGradeColor } from '@/lib/utils';

interface ValidationScoreCardProps {
  score: any;
  aiAnalysis: any;
  realData: any;
  marketSizeData?: {
    totalAddressableMarket: { value: number; currency: string };
    marketGrowthRate: { annual: number; trend: string };
  };
  scalabilityData?: {
    scalabilityScore: number;
    businessModel: { type: string; scalabilityRating: string };
  };
  moatData?: {
    moatScore: number;
    moatStrategy: { primaryMoat: string };
  };
}

export function ValidationScoreCard({ score, aiAnalysis, realData, marketSizeData, scalabilityData, moatData }: ValidationScoreCardProps) {
  if (!score) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <div className="flex items-center justify-center h-40">
          <div className="text-gray-500">Loading validation score...</div>
        </div>
      </div>
    );
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'BUILD': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'PIVOT': return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'AVOID': return <XCircle className="w-6 h-6 text-red-600" />;
      case 'PASS': return <XCircle className="w-6 h-6 text-red-600" />;
      default: return <AlertTriangle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUILD': return 'text-green-600 bg-green-50 border-green-200';
      case 'PIVOT': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'AVOID': return 'text-red-600 bg-red-50 border-red-200';
      case 'PASS': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Enhanced recommendation logic using backend score
  const getEnhancedRecommendation = () => {
    const baseScore = score?.overall?.score || score?.overall || score?.score || 0;
    
    // Use the backend score directly instead of recalculating
    const finalScore = baseScore;
    
    let recommendation = 'ANALYZING';
    let reasoning = 'AI analysis in progress...';

    // More optimistic recommendation logic for better user experience
    if (finalScore >= 70) {
      recommendation = 'BUILD';
      reasoning = `Strong validation with ${finalScore}% score. Market shows real demand and conditions look favorable.`;
    } else if (finalScore >= 55) {
      recommendation = 'BUILD';
      reasoning = `Good validation with ${finalScore}% score. Solid market opportunity worth pursuing.`;
    } else if (finalScore >= 45) {
      recommendation = 'BUILD';
      reasoning = `Decent validation with ${finalScore}% score. Market shows potential for this idea.`;
    } else if (finalScore >= 30) {
      recommendation = 'PIVOT';
      reasoning = `Weak validation with ${finalScore}% score. Consider refining your approach or target market.`;
    } else {
      recommendation = 'AVOID';
      reasoning = `Poor validation with ${finalScore}% score. Limited market evidence for this opportunity.`;
    }

    return { recommendation, reasoning, compositeScore: finalScore };
  };

  const enhancedResult = getEnhancedRecommendation();

  const getScoreColor = (score: number, threshold: { excellent: number; good: number; fair: number }) => {
    if (score >= threshold.excellent) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= threshold.good) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= threshold.fair) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const formatMarketSize = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-4 sm:p-6 w-full overflow-x-hidden">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">Your Idea Analysis</h2>
        <p className="text-sm text-gray-600 mb-4">
          {realData?.totalDataPoints ? `Based on ${realData.totalDataPoints} real data points` : 'Analysis based on available data'}
        </p>
        
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="text-center">
            <div className="text-5xl sm:text-6xl font-bold mb-2" style={{ color: enhancedResult.compositeScore >= 70 ? '#16a34a' : enhancedResult.compositeScore >= 50 ? '#2563eb' : enhancedResult.compositeScore >= 35 ? '#d97706' : '#dc2626' }}>
              {enhancedResult.compositeScore.toFixed(0)}
              <span className="text-2xl sm:text-3xl text-gray-500">/100</span>
            </div>
            <Badge className={`text-base sm:text-lg px-4 py-2 ${getRecommendationColor(enhancedResult.recommendation)}`}>
              {enhancedResult.recommendation}
            </Badge>
            <div className="text-sm text-gray-500 mt-2">Overall Score</div>
          </div>
          
          {(realData?.redditMentions || realData?.competitorsFound || score?.confidence) && (
            <div className="grid grid-cols-2 gap-4 text-center w-full max-w-md">
              {score?.confidence && (
                <div className="flex flex-col items-center text-sm text-gray-600">
                  <Database className="w-5 h-5 mb-1" />
                  <span className="font-medium">{score.confidence}%</span>
                  <span className="text-xs">Data Confidence</span>
                </div>
              )}
              {realData?.redditMentions && (
                <div className="flex flex-col items-center text-sm text-gray-600">
                  <Users className="w-5 h-5 mb-1" />
                  <span className="font-medium">✓</span>
                  <span className="text-xs">Social Data</span>
                </div>
              )}
              {realData?.competitorsFound && (
                <div className="flex flex-col items-center text-sm text-gray-600">
                  <Building className="w-5 h-5 mb-1" />
                  <span className="font-medium">{realData.competitorsFound}</span>
                  <span className="text-xs">Competitors Found</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div>
        {/* Key Metrics - Only show if we have real data */}
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 mb-6">
          {score?.marketDemand && (
            <div className={`text-center p-4 rounded-lg border w-full ${getScoreColor(score.marketDemand, { excellent: 80, good: 60, fair: 40 })}`}>
              <div className="flex items-center justify-center mb-1">
                <Users className="w-4 h-4 mr-1" />
                <div className="text-xl sm:text-2xl font-bold">{score.marketDemand}</div>
              </div>
              <div className="text-sm font-medium">Market Demand</div>
            </div>
          )}
          
          {scalabilityData?.scalabilityScore && (
            <div className={`text-center p-4 rounded-lg border w-full ${getScoreColor(scalabilityData.scalabilityScore, { excellent: 80, good: 60, fair: 40 })}`}>
              <div className="flex items-center justify-center mb-1">
                <Rocket className="w-4 h-4 mr-1" />
                <div className="text-xl sm:text-2xl font-bold">{scalabilityData.scalabilityScore}</div>
              </div>
              <div className="text-sm font-medium">Growth Potential</div>
              {scalabilityData?.businessModel?.type && (
                <div className="text-xs mt-1">
                  {scalabilityData.businessModel.type} business
                </div>
              )}
            </div>
          )}
          
          {moatData?.moatScore && (
            <div className={`text-center p-4 rounded-lg border w-full ${getScoreColor(moatData.moatScore, { excellent: 80, good: 60, fair: 40 })}`}>
              <div className="flex items-center justify-center mb-1">
                <Shield className="w-4 h-4 mr-1" />
                <div className="text-xl sm:text-2xl font-bold">{moatData.moatScore}</div>
              </div>
              <div className="text-sm font-medium">Competition Protection</div>
              <div className="text-xs mt-1">
                How hard to copy
              </div>
            </div>
          )}
          
          {marketSizeData?.totalAddressableMarket?.value && (
            <div className={`text-center p-4 rounded-lg border w-full ${getScoreColor(marketSizeData.totalAddressableMarket.value > 1000000000 ? 90 : marketSizeData.totalAddressableMarket.value > 100000000 ? 70 : 40, { excellent: 80, good: 60, fair: 40 })}`}>
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="w-4 h-4 mr-1" />
                <div className="text-lg sm:text-xl font-bold">{formatMarketSize(marketSizeData.totalAddressableMarket.value)}</div>
              </div>
              <div className="text-sm font-medium">Market Size</div>
              <div className="text-xs mt-1">
                Total opportunity
              </div>
            </div>
          )}
        </div>


        {/* Data Sources - Only show if we have real data */}
        {(realData?.redditMentions || marketSizeData?.totalAddressableMarket?.value || realData?.competitorsFound || scalabilityData?.scalabilityScore || score?.confidence) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Database className="w-4 h-4 mr-2" />
              How We Calculated This
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {realData?.redditMentions && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700">Social Media Research</div>
                  <div className="text-xs text-gray-600">✅ Real social media data analyzed</div>
                  {realData?.frustratedUsers && (
                    <div className="text-xs text-gray-600">✅ Social validation data analyzed</div>
                  )}
                </div>
              )}
              
              {marketSizeData?.totalAddressableMarket?.value && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700">Market Research</div>
                  <div className="text-xs text-gray-600">✅ Market size: {formatMarketSize(marketSizeData.totalAddressableMarket.value)}</div>
                  {marketSizeData?.marketGrowthRate?.annual && (
                    <div className="text-xs text-gray-600">✅ Growing {marketSizeData.marketGrowthRate.annual}% yearly</div>
                  )}
                </div>
              )}
              
              {realData?.competitorsFound && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700">Competition Research</div>
                  <div className="text-xs text-gray-600">✅ {realData.competitorsFound} competitors found</div>
                  {moatData?.moatScore && (
                    <div className="text-xs text-gray-600">✅ Protection score: {moatData.moatScore}/100</div>
                  )}
                </div>
              )}
              
              {scalabilityData?.scalabilityScore && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700">Growth Analysis</div>
                  {scalabilityData?.businessModel?.type && (
                    <div className="text-xs text-gray-600">✅ {scalabilityData.businessModel.type} business model</div>
                  )}
                  <div className="text-xs text-gray-600">✅ Growth potential: {scalabilityData.scalabilityScore}/100</div>
                </div>
              )}
              
              
              {score?.confidence && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700">Score Calculation</div>
                  <div className="text-xs text-gray-600">✅ Market demand: 60% weight</div>
                  <div className="text-xs text-gray-600">✅ Competition: 40% weight</div>
                  <div className="text-xs text-gray-600">✅ Data confidence: {score.confidence}%</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary & Recommendation */}
        <div className={`p-6 border rounded-lg ${getRecommendationColor(enhancedResult.recommendation)}`}>
          <div className="flex items-center justify-center mb-4">
            {getRecommendationIcon(enhancedResult.recommendation)}
            <span className="ml-2 text-xl font-semibold">
              Our Assessment: {enhancedResult.recommendation}
            </span>
          </div>
          <p className="text-center text-sm leading-relaxed mb-4">
            {enhancedResult.reasoning}
          </p>
          
          {/* Confidence Indicator */}
          {score?.confidence && (
            <div className="text-center mb-4">
              <div className="text-xs text-current opacity-80">
                Confidence Level: {score.confidence >= 80 ? 'High' : score.confidence >= 60 ? 'Medium' : 'Low'} ({score.confidence}%)
              </div>
              {score.confidence < 60 && (
                <div className="text-xs text-current opacity-70 mt-1">
                  ⚠️ Limited data available - consider gathering more market feedback
                </div>
              )}
            </div>
          )}
          
          {/* Key Factors - Only show if we have real data */}
          {(scalabilityData?.scalabilityScore || moatData?.moatScore) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-current border-opacity-20">
              {scalabilityData?.scalabilityScore && (
                <div className="text-center">
                  <div className="text-lg font-bold">{scalabilityData.scalabilityScore}/100</div>
                  <div className="text-xs opacity-80">Growth Potential</div>
                </div>
              )}
              {moatData?.moatScore && (
                <div className="text-center">
                  <div className="text-lg font-bold">{moatData.moatScore}/100</div>
                  <div className="text-xs opacity-80">Protection Score</div>
                </div>
              )}
            </div>
          )}
          
          {/* Key Details - Only show if we have real data */}
          {(moatData?.moatStrategy?.primaryMoat || scalabilityData?.businessModel?.type || marketSizeData?.totalAddressableMarket?.value) && (
            <div className="mt-4 pt-4 border-t border-current border-opacity-20">
              <div className="text-xs font-medium mb-2">Key Details:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs opacity-90">
                {moatData?.moatStrategy?.primaryMoat && (
                  <div>🎯 Protection Strategy: {moatData.moatStrategy.primaryMoat}</div>
                )}
                {scalabilityData?.businessModel?.type && (
                  <div>🚀 Business Type: {scalabilityData.businessModel.type} {scalabilityData?.businessModel?.scalabilityRating && `(${scalabilityData.businessModel.scalabilityRating} growth)`}</div>
                )}
                {marketSizeData?.totalAddressableMarket?.value && (
                  <div>📊 Market: {formatMarketSize(marketSizeData.totalAddressableMarket.value)} {marketSizeData?.marketGrowthRate?.annual && `growing ${marketSizeData.marketGrowthRate.annual}%/year`}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}