'use client';

import { Badge } from '@/components/ui/badge';
import { Building, AlertTriangle, MessageCircle, Target, Users, AlertCircle } from 'lucide-react';

interface CompetitionCardProps {
  competitorData?: any;
  realData?: any;
}

export function CompetitionCard({ competitorData, realData }: CompetitionCardProps) {
  // Only show component if we have real competitor data
  if (!competitorData?.competitors || competitorData.competitors.length === 0) {
    return null;
  }

  const { competitors, complaints, opportunities, marketGaps } = competitorData;
  const totalCompetitors = competitors.length;
  const totalComplaints = complaints?.length || 0;
  
  const getCompetitionLevel = (count: number) => {
    if (count === 0) return { level: 'NO COMPETITION', color: 'text-green-600 bg-green-50 border-green-200' };
    if (count <= 3) return { level: 'LOW COMPETITION', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (count <= 7) return { level: 'MODERATE', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return { level: 'HIGH COMPETITION', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const competitionLevel = getCompetitionLevel(totalCompetitors);

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Building className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Who Else Is Out There?</h3>
        </div>
        {realData?.redditMentions && (
          <p className="text-sm text-gray-600">
            Found {totalCompetitors} competitors in market research
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Competition Overview */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {totalCompetitors}
          </div>
          <Badge className={`text-sm px-3 py-1 ${competitionLevel.color}`}>
            {competitionLevel.level}
          </Badge>
        </div>

        {/* Key Metrics - Only show if we have data */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">{totalCompetitors}</div>
            <div className="text-sm text-blue-600 font-medium">Companies Found</div>
          </div>
          {totalComplaints > 0 && (
            <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">{totalComplaints}</div>
              <div className="text-sm text-orange-600 font-medium">User Problems</div>
            </div>
          )}
        </div>

        {/* Competitors List */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Similar Companies
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {competitors.slice(0, 6).map((competitor: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{competitor.name}</span>
                  {competitor.sentiment && (
                    <Badge className={`text-xs px-2 py-1 ${getSentimentColor(competitor.sentiment)}`}>
                      {competitor.sentiment === 'positive' ? 'liked' : competitor.sentiment === 'negative' ? 'disliked' : 'mixed'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {competitor.mentions && (
                    <>
                      <Users className="w-3 h-3" />
                      {competitor.mentions} mentions
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Complaints - Only show if we have them */}
        {complaints && complaints.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              What People Don't Like
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {complaints.slice(0, 4).map((complaint: any, index: number) => (
                <div key={index} className={`p-3 border rounded-lg ${getSeverityColor(complaint.severity)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">About {complaint.competitor}</span>
                    {complaint.severity && (
                      <Badge variant="outline" className="text-xs">
                        {complaint.severity === 'high' ? 'big issue' : complaint.severity === 'medium' ? 'issue' : 'minor issue'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">"{complaint.complaint}"</p>
                  {complaint.author && complaint.subreddit && (
                    <div className="text-xs text-gray-500">
                      u/{complaint.author} • r/{complaint.subreddit}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Gaps - Only show if we have them */}
        {marketGaps && marketGaps.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Opportunities We Found
            </h4>
            <div className="space-y-2">
              {marketGaps.slice(0, 3).map((gap: string, index: number) => (
                <div key={index} className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                  💡 {gap}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Competition Assessment */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-purple-900 text-sm">What This Means</span>
          </div>
          <p className="text-sm text-purple-700">
            {totalCompetitors === 0 
              ? "🎯 No competitors found - you might be first to market!" 
              : totalCompetitors <= 3
                ? "✅ Few competitors - easier to stand out"
                : totalCompetitors <= 7
                  ? "⚠️ Some competition - you'll need to be different"
                  : "🔴 Lots of competition - you'll need strong advantages"
            }
          </p>
        </div>

      </div>
    </div>
  );
}