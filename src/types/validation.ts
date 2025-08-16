export interface ValidationScore {
  overall: number;          // 0-100 (weighted average)
  marketDemand: number;     // 0-100 (35% weight)
  trends: number;           // 0-100 (25% weight) 
  competition: number;      // 0-100 (25% weight)
  aiConfidence: number;     // 0-100 (15% weight)
  grade: 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
}

export interface IdeaInput {
  description: string;
  keywords: string[];
  industry?: string;
  targetMarket?: string;
}

export interface RedditInsight {
  posts: RedditPost[];
  sentiment: number;        // 0-10 scale
  painPoints: string[];
  discussionVolume: number;
  engagementLevel: number;
  score: number;           // 0-100
  realData?: {
    totalMentions: number;
    frustratedUsers: number;
    neutralUsers: number;
    satisfiedUsers: number;
    totalRelevantPosts?: number;
    overallSentiment?: number;
    frustrationLevel?: number;
    keyInsights?: string[];
    topQuotes: Array<{
      quote: string;
      author: string;
      subreddit: string;
      upvotes: number;
      sentiment: 'frustrated' | 'neutral' | 'satisfied';
    }>;
  };
}

export interface RedditPost {
  title: string;
  content: string;
  subreddit: string;
  upvotes: number;
  comments: number;
  sentiment: number;
  url: string;
  createdAt: string;
}

export interface TrendsData {
  keyword: string;
  timeframe: string;
  searchVolume: number[];
  growthRate: number;      // 12-month growth percentage
  relatedQueries: string[];
  regionalInterest: { [region: string]: number };
  seasonality: number;
  consistency: number;
  score: number;          // 0-100
}

export interface YouTubeInsight {
  videos: YouTubeVideo[];
  totalViews: number;
  sentiment: number;       // 0-10 scale
  engagementRate: number;
  score: number;          // 0-100
}

export interface YouTubeVideo {
  title: string;
  description: string;
  views: number;
  likes: number;
  comments: number;
  sentiment: number;
  url: string;
  publishedAt: string;
}

export interface AIAnalysis {
  recommendation: 'BUILD' | 'PIVOT' | 'PASS';
  reasoning: string;
  nextSteps: string[];
  risks: Risk[];
  opportunities: string[];
  marketSize: {
    tam: number;           // Total Addressable Market
    sam: number;           // Serviceable Addressable Market
    som: number;           // Serviceable Obtainable Market
  };
  confidence: number;      // 0-100
}

export interface Risk {
  type: 'MARKET' | 'TECHNICAL' | 'COMPETITIVE' | 'REGULATORY';
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  mitigation: string;
}

export interface ProcessingStep {
  step: number;
  title: string;
  description: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dataFound?: number;
  errorMessage?: string;
}

export interface ValidationRequest {
  id: string;
  createdAt: string;
  idea: IdeaInput;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;        // 0-100
  currentStep: string;
  redditData?: RedditInsight;
  trendsData?: TrendsData;
  youtubeData?: YouTubeInsight;
  aiAnalysis?: AIAnalysis;
  finalScore?: any; // Changed from ValidationScore to any to support new structure
  completedAt?: string;
  errorMessage?: string;
  processingSteps?: ProcessingStep[];
  totalDataPoints?: number;
  // New AI research data from extended pipeline
  competitorData?: any;
  marketSizeData?: any;
  scalabilityData?: any;
  moatData?: any;
  mvpTimelineData?: any;
  uvzData?: any;
}

export interface DashboardCard {
  id: string;
  title: string;
  type: 'SCORE' | 'DEMAND' | 'TRENDS' | 'COMPETITION' | 'SENTIMENT' | 'MARKET' | 'RISK' | 'ACTION';
  data: any;
  loading: boolean;
  error?: string;
}

// Scoring algorithm types
export interface DemandFactors {
  discussionVolume: number;    // Number of relevant posts/comments
  sentimentScore: number;      // Positive vs negative sentiment
  painPointFrequency: number;  // How often problem mentioned
  engagementLevel: number;     // Upvotes, replies, discussion depth
  recentActivity: number;      // Recency of discussions
}

export interface TrendFactors {
  searchVolume: number;        // Absolute search volume
  growthRate: number;          // 12-month growth percentage  
  consistency: number;         // Stability vs volatility
  seasonality: number;         // Seasonal demand patterns
  regionalInterest: number;    // Geographic distribution
}

export interface CompetitionFactors {
  directCompetitors: number;   // Number of direct competitors
  marketSaturation: number;    // How crowded the market is
  entryBarriers: number;       // How easy/hard to enter
  fundingActivity: number;     // VC investment in space
  innovationRate: number;      // Rate of new solutions
}