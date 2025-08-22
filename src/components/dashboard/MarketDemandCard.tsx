'use client';

import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, TrendingUp, AlertCircle } from 'lucide-react';

interface MarketDemandCardProps {
  redditData?: any;
  realData?: any;
}

export function MarketDemandCard({ redditData, realData }: MarketDemandCardProps) {
  // Only show component if we have real data
  if (!redditData?.realData || !redditData?.realData?.totalMentions) {
    return null;
  }

  const { topQuotes, totalMentions, frustratedUsers, neutralUsers, satisfiedUsers } = redditData.realData;
  const demandScore = redditData.score;
  
  const sentimentColors = {
    frustrated: 'text-red-600 bg-red-50 border-red-200',
    neutral: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
    satisfied: 'text-green-600 bg-green-50 border-green-200'
  };

  const getDemandLevel = (score: number) => {
    if (score >= 80) return { level: 'High Interest', color: 'text-green-600 bg-green-50 border-green-200' };
    if (score >= 60) return { level: 'Some Interest', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    return { level: 'Low Interest', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const demandLevel = demandScore ? getDemandLevel(demandScore) : null;

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Do People Want This?</h3>
        </div>
        <p className="text-sm text-gray-600">
          Found real social media discussions about this problem
        </p>
      </div>

      <div className="space-y-6">
        {/* Demand Score - Only show if we have it */}
        {demandScore && demandLevel && (
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {demandScore}
              <span className="text-lg text-gray-500">/100</span>
            </div>
            <Badge className={`text-sm px-3 py-1 ${demandLevel.color}`}>
              {demandLevel.level}
            </Badge>
          </div>
        )}


        {/* Real User Quotes - Only show if we have them */}
        {topQuotes && topQuotes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              What People Are Saying
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {topQuotes.slice(0, 4).map((quote: any, index: number) => (
                <div key={index} className={`p-3 border rounded-lg ${sentimentColors[quote.sentiment as keyof typeof sentimentColors]}`}>
                  <p className="text-sm font-medium mb-2">&quot;{quote.quote}&quot;</p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">u/{quote.author}</span>
                      <span className="text-gray-500">•</span>
                      <span>r/{quote.subreddit}</span>
                    </div>
                    {quote.upvotes && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {quote.upvotes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}