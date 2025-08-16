'use client';

import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, BarChart3, Globe, AlertCircle } from 'lucide-react';

interface MarketSizeCardProps {
  marketSizeData?: {
    totalAddressableMarket: {
      value: number;
      currency: string;
      timeframe: string;
      source: string;
    };
    serviceableAddressableMarket: {
      value: number;
      currency: string;
      description: string;
    };
    serviceableObtainableMarket: {
      value: number;
      currency: string;
      description: string;
    };
    marketGrowthRate: {
      annual: number;
      trend: 'growing' | 'stable' | 'declining';
      drivers: string[];
    };
    marketSegments: Array<{
      segment: string;
      size: number;
      growthPotential: 'high' | 'medium' | 'low';
    }>;
    marketMaturity: 'emerging' | 'growing' | 'mature' | 'declining';
    keyInsights: string[];
  };
}

export function MarketSizeCard({ marketSizeData }: MarketSizeCardProps) {
  // Only show component if we have real market size data
  if (!marketSizeData?.totalAddressableMarket?.value) {
    return null;
  }

  const { 
    totalAddressableMarket, 
    serviceableAddressableMarket, 
    serviceableObtainableMarket, 
    marketGrowthRate, 
    marketSegments, 
    marketMaturity,
    keyInsights 
  } = marketSizeData;
  
  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num}`;
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 15) return 'text-green-600 bg-green-50 border-green-200';
    if (rate > 5) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (rate > 0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getMaturityColor = (maturity: string) => {
    switch (maturity) {
      case 'emerging': return 'text-green-600 bg-green-50 border-green-200';
      case 'growing': return 'text-blue-600 bg-blue-50 border-blue-200';  
      case 'mature': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'declining': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">How Big Is This Market?</h3>
        </div>
        {totalAddressableMarket.source && (
          <p className="text-sm text-gray-600">
            Market research from {totalAddressableMarket.source}
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Market Size Breakdown - Only show what we have */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {formatNumber(totalAddressableMarket.value)}
            </div>
            <div className="text-sm text-green-600 font-medium">Total Market Size</div>
          </div>
          {serviceableAddressableMarket?.value && (
            <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {formatNumber(serviceableAddressableMarket.value)}
              </div>
              <div className="text-sm text-blue-600 font-medium">Reachable Market</div>
            </div>
          )}
          {serviceableObtainableMarket?.value && (
            <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">
                {formatNumber(serviceableObtainableMarket.value)}
              </div>
              <div className="text-sm text-purple-600 font-medium">Realistic Target</div>
            </div>
          )}
        </div>

        {/* Growth Rate & Market Maturity - Only show if we have data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {marketGrowthRate?.annual !== undefined && (
            <div className={`text-center p-4 rounded-lg border ${getGrowthColor(marketGrowthRate.annual)}`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <div className="text-xl font-bold">{marketGrowthRate.annual}%</div>
              </div>
              <div className="text-sm font-medium">
                Growing {marketGrowthRate.trend === 'growing' ? 'Fast' : marketGrowthRate.trend === 'stable' ? 'Steady' : 'Slowly'} Each Year
              </div>
            </div>
          )}
          {marketMaturity && (
            <div className={`text-center p-4 rounded-lg border ${getMaturityColor(marketMaturity)}`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4" />
                <div className="text-lg font-bold capitalize">
                  {marketMaturity === 'emerging' ? 'New' : marketMaturity === 'growing' ? 'Growing' : marketMaturity === 'mature' ? 'Established' : 'Declining'}
                </div>
              </div>
              <div className="text-sm font-medium">Market Stage</div>
            </div>
          )}
        </div>

        {/* Market Segments - Only show if we have them */}
        {marketSegments && marketSegments.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              Different Market Areas ({marketSegments.length} found)
            </h4>
            <div className="space-y-2">
              {marketSegments.slice(0, 4).map((segment, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{segment.segment}</span>
                  <div className="flex items-center gap-2">
                    {segment.size && (
                      <span className="text-sm font-mono">{formatNumber(segment.size)}</span>
                    )}
                    {segment.growthPotential && (
                      <Badge className={`text-xs px-2 py-1 ${
                        segment.growthPotential === 'high' ? 'bg-green-100 text-green-800 border-green-300' : 
                        segment.growthPotential === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
                        'bg-gray-100 text-gray-800 border-gray-300'
                      }`}>
                        {segment.growthPotential === 'high' ? 'high growth' : segment.growthPotential === 'medium' ? 'decent growth' : 'slow growth'}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Insights - Only show if we have them */}
        {keyInsights && keyInsights.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Key Insights</h4>
            <div className="space-y-1">
              {keyInsights.slice(0, 3).map((insight, index) => (
                <div key={index} className="text-sm text-blue-700">• {insight}</div>
              ))}
            </div>
          </div>
        )}

        {/* Growth Drivers - Only show if we have them */}
        {marketGrowthRate?.drivers && marketGrowthRate.drivers.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-green-800 mb-2">Why This Market Is Growing</h4>
            <div className="text-xs text-green-700">
              {marketGrowthRate.drivers.slice(0, 3).map((driver, index) => (
                <div key={index}>✅ {driver}</div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}