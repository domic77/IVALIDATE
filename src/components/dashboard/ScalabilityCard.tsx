'use client';

import { Badge } from '@/components/ui/badge';
import { Rocket, BarChart3, Globe2, Zap, TrendingUp, AlertCircle, DollarSign, Users } from 'lucide-react';

interface ScalabilityCardProps {
  scalabilityData?: {
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
  };
}

export function ScalabilityCard({ scalabilityData }: ScalabilityCardProps) {
  // Only show component if we have real scalability data
  if (!scalabilityData?.scalabilityScore) {
    return null;
  }

  const { 
    scalabilityScore,
    businessModel,
    scalingFactors,
    growthPotential,
    scalingChallenges,
    revenueStreams,
    infrastructureNeeds,
    benchmarkComparisons
  } = scalabilityData;

  const getScalabilityLevel = (score: number) => {
    if (score >= 80) return { level: 'HIGHLY SCALABLE', color: 'text-green-600 bg-green-50 border-green-200' };
    if (score >= 60) return { level: 'SCALABLE', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (score >= 40) return { level: 'MODERATELY SCALABLE', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return { level: 'LIMITED SCALABILITY', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const getBusinessModelColor = (rating: string) => {
    switch (rating) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technology': return <Zap className="w-4 h-4" />;
      case 'operations': return <BarChart3 className="w-4 h-4" />;
      case 'market': return <Globe2 className="w-4 h-4" />;
      case 'financial': return <DollarSign className="w-4 h-4" />;
      case 'team': return <Users className="w-4 h-4" />;
      default: return <Rocket className="w-4 h-4" />;
    }
  };

  const getScalabilityColor = (scalability: string) => {
    switch (scalability) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'challenging': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const scalabilityLevel = getScalabilityLevel(scalabilityScore);

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Rocket className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">How Big Can This Get?</h3>
        </div>
        <p className="text-sm text-gray-600">
          Growth potential and scaling opportunities
        </p>
      </div>

      <div className="space-y-6">
        {/* Scalability Score */}
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">{scalabilityScore}/100</div>
          <Badge className={`text-sm px-3 py-1 ${scalabilityLevel.color}`}>
            {scalabilityLevel.level.replace('HIGHLY SCALABLE', 'Very Scalable').replace('SCALABLE', 'Scalable').replace('MODERATELY SCALABLE', 'Somewhat Scalable').replace('LIMITED SCALABILITY', 'Hard to Scale')}
          </Badge>
        </div>

        {/* Business Model - Only show if we have it */}
        {businessModel?.type && (
          <div className={`p-4 rounded-lg border ${getBusinessModelColor(businessModel.scalabilityRating)}`}>
            <h4 className="text-sm font-semibold mb-2 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              {businessModel.type === 'saas' ? 'Software' : businessModel.type === 'marketplace' ? 'Marketplace' : businessModel.type.charAt(0).toUpperCase() + businessModel.type.slice(1)} Business
            </h4>
            {businessModel.revenueModel && (
              <p className="text-sm font-medium mb-1">{businessModel.revenueModel}</p>
            )}
            {businessModel.unitEconomics && (
              <p className="text-xs">{businessModel.unitEconomics}</p>
            )}
          </div>
        )}

        {/* Growth Potential - Only show if we have it */}
        {growthPotential && (growthPotential.shortTerm || growthPotential.longTerm) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Growth Potential {growthPotential.globalPotential && <Globe2 className="w-4 h-4 ml-2 text-green-600" />}
            </h4>
            <div className="space-y-2 text-sm">
              {growthPotential.shortTerm && (
                <div><strong>Next 1-2 years:</strong> {growthPotential.shortTerm}</div>
              )}
              {growthPotential.longTerm && (
                <div><strong>5+ years:</strong> {growthPotential.longTerm}</div>
              )}
              {growthPotential.marketExpansion && growthPotential.marketExpansion.length > 0 && (
                <div>
                  <strong>New markets:</strong> {growthPotential.marketExpansion.slice(0, 3).join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scaling Factors - Only show if we have them */}
        {scalingFactors && scalingFactors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Growth Factors ({scalingFactors.length} found)
            </h4>
            <div className="space-y-2">
              {scalingFactors.slice(0, 5).map((factor, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(factor.category)}
                      <span className="text-sm font-medium">{factor.factor}</span>
                    </div>
                    <div className="flex gap-2">
                      {factor.impact && (
                        <Badge className={`text-xs px-2 py-1 ${
                          factor.impact === 'high' ? 'bg-red-100 text-red-700' :
                          factor.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {factor.impact === 'high' ? 'big impact' : factor.impact === 'medium' ? 'some impact' : 'small impact'}
                        </Badge>
                      )}
                      {factor.scalability && (
                        <span className={`text-xs font-medium ${getScalabilityColor(factor.scalability)}`}>
                          {factor.scalability === 'excellent' ? 'easy' : factor.scalability === 'good' ? 'doable' : 'hard'}
                        </span>
                      )}
                    </div>
                  </div>
                  {factor.details && (
                    <p className="text-xs text-gray-600">{factor.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Streams - Only show if we have them */}
        {revenueStreams && revenueStreams.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Ways to Make Money
            </h4>
            <div className="space-y-2">
              {revenueStreams.slice(0, 3).map((stream, index) => (
                <div key={index} className="flex justify-between items-start p-3 bg-blue-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium">{stream.stream}</span>
                    {stream.implementation && (
                      <p className="text-xs text-blue-600 mt-1">{stream.implementation}</p>
                    )}
                  </div>
                  {stream.scalability && (
                    <Badge className={`text-xs px-2 py-1 ${
                      stream.scalability === 'high' ? 'bg-green-100 text-green-700' :
                      stream.scalability === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {stream.scalability === 'high' ? 'easy to scale' : stream.scalability === 'medium' ? 'scalable' : 'hard to scale'}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scaling Challenges - Only show if we have them */}
        {scalingChallenges && scalingChallenges.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Growth Challenges ({scalingChallenges.length} found)
            </h4>
            <div className="space-y-2">
              {scalingChallenges.slice(0, 3).map((challenge, index) => (
                <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-800">{challenge.challenge}</span>
                    {challenge.severity && (
                      <Badge className={`text-xs px-2 py-1 ${getSeverityColor(challenge.severity)}`}>
                        {challenge.severity === 'high' ? 'big problem' : challenge.severity === 'medium' ? 'problem' : 'minor issue'}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-orange-700">
                    {challenge.solution && (
                      <div><strong>How to fix:</strong> {challenge.solution}</div>
                    )}
                    {challenge.timeframe && (
                      <div><strong>When:</strong> {challenge.timeframe}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Infrastructure Needs - Only show if we have data */}
        {infrastructureNeeds && (infrastructureNeeds.technology?.length > 0 || infrastructureNeeds.operations?.length > 0 || infrastructureNeeds.team?.length > 0 || infrastructureNeeds.funding) && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-purple-800 mb-3">What You'll Need to Grow</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {infrastructureNeeds.technology && infrastructureNeeds.technology.length > 0 && (
                <div>
                  <div className="font-medium text-purple-700 mb-1">Technology:</div>
                  <div className="text-purple-600">{infrastructureNeeds.technology.slice(0, 2).join(', ')}</div>
                </div>
              )}
              {infrastructureNeeds.operations && infrastructureNeeds.operations.length > 0 && (
                <div>
                  <div className="font-medium text-purple-700 mb-1">Operations:</div>
                  <div className="text-purple-600">{infrastructureNeeds.operations.slice(0, 2).join(', ')}</div>
                </div>
              )}
              {infrastructureNeeds.team && infrastructureNeeds.team.length > 0 && (
                <div>
                  <div className="font-medium text-purple-700 mb-1">Team:</div>
                  <div className="text-purple-600">{infrastructureNeeds.team.slice(0, 2).join(', ')}</div>
                </div>
              )}
              {infrastructureNeeds.funding && (
                <div>
                  <div className="font-medium text-purple-700 mb-1">Funding:</div>
                  <div className="text-purple-600">{infrastructureNeeds.funding}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Benchmark Comparisons - Only show if we have them */}
        {benchmarkComparisons && benchmarkComparisons.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Similar Companies</h4>
            <div className="space-y-2">
              {benchmarkComparisons.slice(0, 2).map((comp, index) => (
                <div key={index} className="text-xs">
                  <div className="font-medium text-gray-700">{comp.company}</div>
                  {comp.similarity && (
                    <div className="text-gray-600">{comp.similarity}</div>
                  )}
                  {comp.scalingLessons && (
                    <div className="text-gray-500">Lesson: {comp.scalingLessons}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}