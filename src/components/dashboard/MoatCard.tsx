'use client';

import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Crown, Network, Zap, TrendingUp, AlertCircle, Clock, Target } from 'lucide-react';

interface MoatCardProps {
  moatData?: {
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
  };
}

export function MoatCard({ moatData }: MoatCardProps) {
  // Only show component if we have real moat data
  if (!moatData?.moatScore) {
    return null;
  }

  const { 
    moatScore,
    defensibilityFactors,
    competitiveThreats,
    barriersToBuild,
    moatStrategy,
    firstMoverAdvantages,
    networkEffects,
    switchingCosts
  } = moatData;

  const getMoatLevel = (score: number) => {
    if (score >= 80) return { level: 'Very Hard to Copy', color: 'text-green-600 bg-green-50 border-green-200' };
    if (score >= 60) return { level: 'Hard to Copy', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (score >= 40) return { level: 'Somewhat Copyable', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return { level: 'Easy to Copy', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSustainabilityColor = (sustainability: string) => {
    switch (sustainability) {
      case 'long-term': return 'text-green-600';
      case 'medium-term': return 'text-yellow-600';
      case 'short-term': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'network-effects': return <Network className="w-4 h-4" />;
      case 'switching-costs': return <Lock className="w-4 h-4" />;
      case 'economies-of-scale': return <TrendingUp className="w-4 h-4" />;
      case 'brand': return <Crown className="w-4 h-4" />;
      case 'regulatory': return <Shield className="w-4 h-4" />;
      case 'technology': return <Zap className="w-4 h-4" />;
      case 'data': return <Target className="w-4 h-4" />;
      case 'location': return <AlertCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const moatLevel = getMoatLevel(moatScore);

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">How Hard to Copy?</h3>
        </div>
        <p className="text-sm text-gray-600">
          Your competitive protection and defensibility
        </p>
      </div>

      <div className="space-y-6">
        {/* Moat Strength */}
        <div className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">{moatScore}/100</div>
          <Badge className={`text-sm px-3 py-1 ${moatLevel.color}`}>
            {moatLevel.level}
          </Badge>
        </div>

        {/* Primary Moat Strategy - Only show if we have it */}
        {moatStrategy?.primaryMoat && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
              <Crown className="w-4 h-4 mr-2" />
              Main Protection Strategy
            </h4>
            <p className="text-sm text-green-700 font-medium mb-2">{moatStrategy.primaryMoat}</p>
            {moatStrategy.timeline && (
              <div className="text-xs text-green-600">
                <div><strong>Timeline:</strong> {moatStrategy.timeline}</div>
              </div>
            )}
          </div>
        )}

        {/* Defensibility Factors - Only show if we have them */}
        {defensibilityFactors && defensibilityFactors.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Lock className="w-4 h-4 mr-2" />
              Protection Factors ({defensibilityFactors.length} found)
            </h4>
            <div className="space-y-2">
              {defensibilityFactors.slice(0, 5).map((factor, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getStrengthColor(factor.strength)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(factor.category)}
                      <span className="text-sm font-medium">{factor.factor}</span>
                    </div>
                    <div className="flex gap-2">
                      {factor.strength && (
                        <Badge className={`text-xs px-2 py-1 ${getStrengthColor(factor.strength)}`}>
                          {factor.strength === 'high' ? 'strong' : factor.strength === 'medium' ? 'decent' : 'weak'}
                        </Badge>
                      )}
                      {factor.sustainability && (
                        <span className={`text-xs font-medium ${getSustainabilityColor(factor.sustainability)}`}>
                          {factor.sustainability === 'long-term' ? 'lasting' : factor.sustainability === 'medium-term' ? 'medium-term' : 'short-term'}
                        </span>
                      )}
                    </div>
                  </div>
                  {factor.details && (
                    <p className="text-xs opacity-90 mb-1">{factor.details}</p>
                  )}
                  {factor.buildTime && (
                    <div className="text-xs opacity-70">Time to build: {factor.buildTime}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Network Effects & Switching Costs - Only show if we have data */}
        {(networkEffects?.potential || switchingCosts) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {networkEffects?.potential && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800 text-sm">Network Effects</span>
                </div>
                <div className="text-sm text-blue-700">
                  <div><strong>Strength:</strong> {networkEffects.potential === 'high' ? 'Strong' : networkEffects.potential === 'medium' ? 'Medium' : networkEffects.potential === 'low' ? 'Weak' : 'None'}</div>
                  {networkEffects.type && (
                    <div className="text-xs mt-1">{networkEffects.type}</div>
                  )}
                  {networkEffects.criticalMass && (
                    <div className="text-xs">Users needed: {networkEffects.criticalMass}</div>
                  )}
                </div>
              </div>
            )}
            {switchingCosts && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-purple-800 text-sm">Hard to Switch</span>
                </div>
                <div className="text-xs text-purple-700 space-y-1">
                  {switchingCosts.dataLock && (
                    <div>Data lock-in: {switchingCosts.dataLock === 'high' ? 'strong' : switchingCosts.dataLock === 'medium' ? 'medium' : 'weak'}</div>
                  )}
                  {switchingCosts.learningCurve && (
                    <div>Learning needed: {switchingCosts.learningCurve === 'high' ? 'lots' : switchingCosts.learningCurve === 'medium' ? 'some' : 'little'}</div>
                  )}
                  {switchingCosts.integration && (
                    <div>Integration: {switchingCosts.integration === 'high' ? 'complex' : switchingCosts.integration === 'medium' ? 'moderate' : 'simple'}</div>
                  )}
                  {switchingCosts.financialCost && (
                    <div>Cost to switch: {switchingCosts.financialCost === 'high' ? 'expensive' : switchingCosts.financialCost === 'medium' ? 'moderate' : 'cheap'}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Moat Building Sequence - Only show if we have it */}
        {moatStrategy?.buildingSequence && moatStrategy.buildingSequence.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              How to Build Protection
            </h4>
            <div className="space-y-2">
              {moatStrategy.buildingSequence.slice(0, 4).map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* First Mover Advantages - Only show if we have them */}
        {firstMoverAdvantages && firstMoverAdvantages.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Crown className="w-4 h-4 mr-2" />
              Being First Benefits
            </h4>
            <div className="space-y-2">
              {firstMoverAdvantages.slice(0, 3).map((advantage, index) => (
                <div key={index} className="p-2 bg-yellow-50 rounded border border-yellow-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-yellow-800">{advantage.advantage}</span>
                    {advantage.duration && (
                      <Badge className={`text-xs px-2 py-1 ${
                        advantage.duration === 'permanent' ? 'bg-green-100 text-green-700' :
                        advantage.duration === 'long-term' ? 'bg-blue-100 text-blue-700' :
                        advantage.duration === 'medium-term' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {advantage.duration === 'permanent' ? 'forever' : advantage.duration === 'long-term' ? 'long-term' : advantage.duration === 'medium-term' ? 'medium-term' : 'short-term'}
                      </Badge>
                    )}
                  </div>
                  {advantage.strength && (
                    <p className="text-xs text-yellow-600">{advantage.strength}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competitive Threats - Only show if we have them */}
        {competitiveThreats && competitiveThreats.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
              Potential Threats ({competitiveThreats.length} found)
            </h4>
            <div className="space-y-2">
              {competitiveThreats.slice(0, 3).map((threat, index) => (
                <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-800">{threat.threat}</span>
                    <div className="flex gap-2">
                      {threat.likelihood && (
                        <Badge className={`text-xs px-2 py-1 ${getLikelihoodColor(threat.likelihood)}`}>
                          {threat.likelihood === 'high' ? 'likely' : threat.likelihood === 'medium' ? 'possible' : 'unlikely'}
                        </Badge>
                      )}
                      {threat.impact && (
                        <Badge className={`text-xs px-2 py-1 ${getLikelihoodColor(threat.impact)}`}>
                          {threat.impact === 'high' ? 'big impact' : threat.impact === 'medium' ? 'some impact' : 'small impact'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-orange-700">
                    {threat.timeframe && (
                      <div><strong>When:</strong> {threat.timeframe}</div>
                    )}
                    {threat.mitigation && (
                      <div><strong>How to defend:</strong> {threat.mitigation}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Milestones - Only show if we have them */}
        {moatStrategy?.keyMilestones && moatStrategy.keyMilestones.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Important Milestones
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              {moatStrategy.keyMilestones.slice(0, 3).map((milestone, index) => (
                <div key={index}>✅ {milestone}</div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}