'use client';

import { Badge } from '@/components/ui/badge';
import { Clock, Code, Users, Zap, CheckCircle, Calendar, AlertCircle, Target, TrendingUp, DollarSign } from 'lucide-react';

interface MVPTimelineCardProps {
  mvpTimelineData?: {
    totalTimelineWeeks: number;
    developmentPhases: Array<{
      phase: string;
      duration: number;
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
      mvpLaunch: number;
      betaTesting: number;
      marketReady: number;
      scaleReady: number;
    };
    technicalComplexity: {
      score: number;
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
  };
}

export function MVPTimelineCard({ mvpTimelineData }: MVPTimelineCardProps) {
  // Only show component if we have real timeline data
  if (!mvpTimelineData?.totalTimelineWeeks) {
    return null;
  }

  const {
    totalTimelineWeeks,
    developmentPhases,
    criticalPath,
    resourceRequirements,
    timeToMarket,
    technicalComplexity,
    launchStrategy,
    postMVPRoadmap
  } = mvpTimelineData;

  const getComplexityLevel = (score: number) => {
    if (score >= 8) return { level: 'Very Hard to Build', color: 'text-red-600 bg-red-50 border-red-200' };
    if (score >= 6) return { level: 'Somewhat Hard', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    if (score >= 4) return { level: 'Pretty Easy', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    return { level: 'Very Easy', color: 'text-green-600 bg-green-50 border-green-200' };
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'important': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'nice-to-have': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const complexityLevel = getComplexityLevel(technicalComplexity.score);
  const timelineMonths = Math.ceil(totalTimelineWeeks / 4.33); // Convert weeks to months

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">How Long Will This Take?</h3>
        </div>
        <p className="text-sm text-gray-600">
          Timeline and resources needed to build
        </p>
      </div>

      <div className="space-y-6">
        {/* Timeline Overview */}
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-600 mb-2">{totalTimelineWeeks} weeks</div>
          <div className="text-lg text-gray-600 mb-2">≈ {timelineMonths} months</div>
          {technicalComplexity?.score && (
            <Badge className={`text-sm px-3 py-1 ${complexityLevel.color}`}>
              {complexityLevel.level}
            </Badge>
          )}
        </div>

        {/* Time to Market Milestones - Only show if we have them */}
        {timeToMarket && (timeToMarket.mvpLaunch || timeToMarket.marketReady) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {timeToMarket.mvpLaunch && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-900">{timeToMarket.mvpLaunch}</div>
                <div className="text-sm text-blue-600 font-medium">weeks to first version</div>
              </div>
            )}
            {timeToMarket.marketReady && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-900">{timeToMarket.marketReady}</div>
                <div className="text-sm text-green-600 font-medium">weeks to launch</div>
              </div>
            )}
          </div>
        )}

        {/* Technical Complexity - Only show if we have it */}
        {technicalComplexity && technicalComplexity.score && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center">
              <Code className="w-4 h-4 mr-2" />
              How Hard to Build: {technicalComplexity.score}/10
            </h4>
            {technicalComplexity.estimatedDevTime && (
              <p className="text-sm text-orange-700 mb-2">{technicalComplexity.estimatedDevTime}</p>
            )}
            {technicalComplexity.factors && technicalComplexity.factors.length > 0 && (
              <div className="text-xs text-orange-600 space-y-1">
                {technicalComplexity.factors.slice(0, 3).map((factor, index) => (
                  <div key={index}>• {factor}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Development Phases - Only show if we have them */}
        {developmentPhases && developmentPhases.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Build Stages ({developmentPhases.length} stages)
            </h4>
            <div className="space-y-3">
              {developmentPhases.slice(0, 4).map((phase, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{phase.phase}</span>
                    <div className="flex gap-2">
                      {phase.duration && (
                        <Badge className="text-xs px-2 py-1 bg-blue-100 text-blue-700">
                          {phase.duration} weeks
                        </Badge>
                      )}
                      {phase.estimatedCost && (
                        <Badge className="text-xs px-2 py-1 bg-gray-100 text-gray-700">
                          {phase.estimatedCost}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {phase.description && (
                    <p className="text-xs text-gray-600 mb-2">{phase.description}</p>
                  )}
                  <div className="text-xs text-gray-500">
                    {phase.deliverables && phase.deliverables.length > 0 && (
                      <div><strong>What you get:</strong> {phase.deliverables.slice(0, 2).join(', ')}</div>
                    )}
                    {phase.teamRequirements && phase.teamRequirements.length > 0 && (
                      <div><strong>Team needed:</strong> {phase.teamRequirements.slice(0, 2).join(', ')}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Path - Only show if we have it */}
        {criticalPath && criticalPath.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Key Milestones
            </h4>
            <div className="space-y-2">
              {criticalPath.slice(0, 5).map((milestone, index) => (
                <div key={index} className={`p-2 rounded border ${getImportanceColor(milestone.importance)}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{milestone.milestone}</span>
                    <div className="flex gap-2">
                      {milestone.week && (
                        <span className="text-xs font-mono">Week {milestone.week}</span>
                      )}
                      {milestone.importance && (
                        <Badge className={`text-xs px-1 py-0.5 ${getImportanceColor(milestone.importance)}`}>
                          {milestone.importance === 'critical' ? 'must have' : milestone.importance === 'important' ? 'important' : 'nice to have'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {milestone.blockers && milestone.blockers.length > 0 && (
                    <div className="text-xs opacity-70 mt-1">
                      Potential issues: {milestone.blockers.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resource Requirements - Only show if we have them */}
        {resourceRequirements && (resourceRequirements.teamSize || resourceRequirements.totalBudgetRange) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resourceRequirements.teamSize && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-purple-800 text-sm">Team Needed</span>
                </div>
                <div className="text-sm text-purple-700">
                  <div><strong>Size:</strong> {resourceRequirements.teamSize}</div>
                  {resourceRequirements.technical && resourceRequirements.technical.length > 0 && (
                    <div className="text-xs mt-1">
                      Tech skills: {resourceRequirements.technical.slice(0, 2).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}
            {resourceRequirements.totalBudgetRange && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800 text-sm">Budget</span>
                </div>
                <div className="text-sm text-green-700">
                  <div>{resourceRequirements.totalBudgetRange}</div>
                  {resourceRequirements.design && resourceRequirements.design.length > 0 && (
                    <div className="text-xs mt-1">
                      Design: {resourceRequirements.design.slice(0, 1).join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Development Risks - Only show if we have them */}
        {developmentPhases && developmentPhases.some(phase => phase.risks && phase.risks.length > 0) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Potential Problems
            </h4>
            <div className="space-y-2">
              {developmentPhases.flatMap(phase => phase.risks || []).slice(0, 3).map((risk, index) => (
                <div key={index} className="p-2 bg-red-50 rounded border border-red-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-red-800">{risk.risk}</span>
                    {risk.impact && (
                      <Badge className={`text-xs px-2 py-1 ${getRiskColor(risk.impact)}`}>
                        {risk.impact === 'high' ? 'big risk' : risk.impact === 'medium' ? 'medium risk' : 'small risk'}
                      </Badge>
                    )}
                  </div>
                  {risk.mitigation && (
                    <p className="text-xs text-red-600">{risk.mitigation}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Launch Strategy - Only show if we have it */}
        {launchStrategy && (launchStrategy.goToMarketApproach || launchStrategy.initialUserAcquisition?.length > 0) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Launch Plan
            </h4>
            {launchStrategy.goToMarketApproach && (
              <p className="text-sm text-blue-700 mb-2">{launchStrategy.goToMarketApproach}</p>
            )}
            <div className="text-xs text-blue-600">
              {launchStrategy.initialUserAcquisition && launchStrategy.initialUserAcquisition.length > 0 && (
                <div><strong>Get users:</strong> {launchStrategy.initialUserAcquisition.slice(0, 2).join(', ')}</div>
              )}
              {launchStrategy.successMetrics && launchStrategy.successMetrics.length > 0 && (
                <div><strong>Success measures:</strong> {launchStrategy.successMetrics.slice(0, 2).join(', ')}</div>
              )}
            </div>
          </div>
        )}

        {/* Post-MVP Roadmap - Only show if we have it */}
        {postMVPRoadmap && postMVPRoadmap.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              What Comes Next
            </h4>
            <div className="space-y-2">
              {postMVPRoadmap.slice(0, 4).map((item, index) => (
                <div key={index} className={`p-2 rounded border ${getPriorityColor(item.priority)}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.feature}</span>
                    <div className="flex gap-2">
                      {item.timeframe && (
                        <span className="text-xs">{item.timeframe}</span>
                      )}
                      {item.priority && (
                        <Badge className={`text-xs px-2 py-1 ${getPriorityColor(item.priority)}`}>
                          {item.priority === 'high' ? 'urgent' : item.priority === 'medium' ? 'important' : 'later'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {item.userValue && (
                    <p className="text-xs opacity-70">{item.userValue}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scaling Challenges - Only show if we have them */}
        {technicalComplexity?.scalingChallenges && technicalComplexity.scalingChallenges.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Growth Challenges Later</h4>
            <div className="text-xs text-gray-600 space-y-1">
              {technicalComplexity.scalingChallenges.slice(0, 3).map((challenge, index) => (
                <div key={index}>⚡ {challenge}</div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}