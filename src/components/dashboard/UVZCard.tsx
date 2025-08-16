'use client';

import { Badge } from '@/components/ui/badge';
import { Zap, Target, Shield, AlertTriangle, Lightbulb, TrendingUp, DollarSign } from 'lucide-react';

interface UVZCardProps {
  uvzData?: {
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
  };
}

export function UVZCard({ uvzData }: UVZCardProps) {
  // Only show component if we have real UVZ data
  if (!uvzData?.uniqueValueProposition?.primaryValue) {
    return null;
  }

  const { 
    uniqueValueProposition, 
    competitiveAdvantages, 
    marketGaps, 
    differentiationStrategy, 
    uniquenessScore, 
    riskFactors 
  } = uvzData;

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDefensibilityColor = (defensibility: string) => {
    switch (defensibility) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getUniquenessLevel = (score: number) => {
    if (score >= 80) return { level: 'HIGHLY UNIQUE', color: 'text-green-600 bg-green-50 border-green-200' };
    if (score >= 60) return { level: 'MODERATELY UNIQUE', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (score >= 40) return { level: 'SOMEWHAT UNIQUE', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return { level: 'LOW UNIQUENESS', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technology': return <Zap className="w-4 h-4" />;
      case 'business-model': return <TrendingUp className="w-4 h-4" />;
      case 'user-experience': return <Target className="w-4 h-4" />;
      case 'pricing': return <Lightbulb className="w-4 h-4" />;
      case 'market-positioning': return <Shield className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const uniquenessLevel = getUniquenessLevel(uniquenessScore);

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">What Makes You Different?</h3>
        </div>
        <p className="text-sm text-gray-600">
          Your unique advantages and how to stand out
        </p>
      </div>

      <div className="space-y-6">
        {/* Uniqueness Score */}
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{uniquenessScore}/100</div>
          <Badge className={`text-sm px-3 py-1 ${uniquenessLevel.color}`}>
            {uniquenessLevel.level.replace('HIGHLY UNIQUE', 'Very Unique').replace('MODERATELY UNIQUE', 'Pretty Unique').replace('SOMEWHAT UNIQUE', 'Somewhat Unique').replace('LOW UNIQUENESS', 'Not Very Unique')}
          </Badge>
        </div>

        {/* Primary Value Proposition */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Your Main Advantage
          </h4>
          <p className="text-sm text-purple-700 font-medium">{uniqueValueProposition.primaryValue}</p>
          {uniqueValueProposition.targetDifferentiator && (
            <p className="text-xs text-purple-600 mt-2">What makes you different: {uniqueValueProposition.targetDifferentiator}</p>
          )}
        </div>

        {/* Competitive Advantages - Only show if we have them */}
        {competitiveAdvantages && competitiveAdvantages.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Your Strengths ({competitiveAdvantages.length} found)
            </h4>
            <div className="space-y-3">
              {competitiveAdvantages.slice(0, 4).map((advantage, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(advantage.category)}
                      <span className="text-sm font-medium">{advantage.advantage}</span>
                    </div>
                    <div className="flex gap-2">
                      {advantage.strength && (
                        <Badge className={`text-xs px-2 py-1 ${getStrengthColor(advantage.strength)}`}>
                          {advantage.strength === 'high' ? 'strong' : advantage.strength === 'medium' ? 'decent' : 'weak'}
                        </Badge>
                      )}
                      {advantage.defensibility && (
                        <Shield className={`w-3 h-3 ${getDefensibilityColor(advantage.defensibility)}`} />
                      )}
                    </div>
                  </div>
                  {advantage.evidence && (
                    <p className="text-xs text-gray-600">{advantage.evidence}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Gaps & Opportunities - Only show if we have them */}
        {marketGaps && marketGaps.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Lightbulb className="w-4 h-4 mr-2" />
              Opportunities ({marketGaps.length} found)
            </h4>
            <div className="space-y-2">
              {marketGaps.slice(0, 3).map((gap, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium text-blue-800">{gap.gap}</span>
                    <div className="flex gap-2">
                      {gap.marketSize && (
                        <Badge className="text-xs px-2 py-1 bg-blue-100 text-blue-700">
                          {gap.marketSize === 'large' ? 'big market' : gap.marketSize === 'medium' ? 'good market' : 'small market'}
                        </Badge>
                      )}
                      {gap.timingAdvantage && (
                        <Badge className="text-xs px-2 py-1 bg-green-100 text-green-700">
                          good timing
                        </Badge>
                      )}
                    </div>
                  </div>
                  {gap.opportunity && (
                    <p className="text-xs text-blue-600">{gap.opportunity}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Differentiation Strategy - Only show if we have it */}
        {differentiationStrategy?.positioningStatement && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Recommended Strategy</h4>
            <p className="text-sm text-green-700 font-medium mb-2">{differentiationStrategy.positioningStatement}</p>
            <div className="text-xs text-green-600">
              {differentiationStrategy.primaryDifferentiator && (
                <div><strong>Main Focus:</strong> {differentiationStrategy.primaryDifferentiator}</div>
              )}
              {differentiationStrategy.targetWeakness && (
                <div><strong>Competitor Weakness:</strong> {differentiationStrategy.targetWeakness}</div>
              )}
            </div>
          </div>
        )}

        {/* Risk Factors - Only show if we have them */}
        {riskFactors && riskFactors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
              Potential Risks ({riskFactors.length} found)
            </h4>
            <div className="space-y-2">
              {riskFactors.slice(0, 3).map((risk, index) => (
                <div key={index} className="p-2 bg-orange-50 rounded border border-orange-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                    <span className="text-sm font-medium text-orange-800">{risk.risk}</span>
                    {risk.impact && (
                      <Badge className={`text-xs px-2 py-1 ${
                        risk.impact === 'high' ? 'bg-red-100 text-red-700' :
                        risk.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {risk.impact === 'high' ? 'big risk' : risk.impact === 'medium' ? 'medium risk' : 'small risk'}
                      </Badge>
                    )}
                  </div>
                  {risk.mitigation && (
                    <p className="text-xs text-orange-600 ml-5">{risk.mitigation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Secondary Values - Only show if we have them */}
        {uniqueValueProposition.secondaryValues && uniqueValueProposition.secondaryValues.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">Other Advantages</h4>
            <div className="flex flex-wrap gap-2">
              {uniqueValueProposition.secondaryValues.map((value, index) => (
                <Badge key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-700">
                  {value}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}