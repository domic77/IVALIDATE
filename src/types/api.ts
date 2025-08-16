import { ValidationRequest, ValidationScore } from './validation';

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Validation API endpoints
export interface StartValidationRequest {
  idea: {
    description: string;
    industry?: string;
    targetMarket?: string;
  };
}

export interface StartValidationResponse {
  validationId: string;
  status: 'PROCESSING';
  estimatedTime: number; // minutes
}

export interface ValidationStatusResponse {
  validationId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;      // 0-100
  currentStep: string;
  estimatedTimeRemaining?: number; // minutes
}

export interface ValidationResultsResponse {
  validationId: string;
  validation: ValidationRequest;
  score: ValidationScore;
  insights: {
    marketDemand: any;
    trends: any;
    competition: any;
    sentiment: any;
    risks: any;
    opportunities: any;
    actionPlan: any;
  };
}

// Data collection API types
export interface RedditApiConfig {
  clientId: string;
  clientSecret: string;
  userAgent: string;
}

export interface RedditSearchParams {
  query: string;
  subreddits?: string[];
  timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  sort?: 'relevance' | 'hot' | 'top' | 'new';
  limit?: number;
}

export interface GoogleTrendsParams {
  keyword: string;
  geo?: string;
  timeframe?: string;
  category?: number;
}

export interface YouTubeSearchParams {
  query: string;
  maxResults?: number;
  order?: 'relevance' | 'date' | 'rating' | 'viewCount';
  publishedAfter?: string;
  type?: 'video' | 'channel' | 'playlist';
}

// Gemini AI API types
export interface GeminiAnalysisRequest {
  prompt: string;
  data: {
    idea: string;
    redditInsights?: any;
    trendsData?: any;
    youtubeData?: any;
  };
}

export interface GeminiAnalysisResponse {
  analysis: string;
  recommendation: 'BUILD' | 'PIVOT' | 'PASS';
  confidence: number;
  reasoning: string;
  risks: string[];
  opportunities: string[];
  nextSteps: string[];
}

// Export functionality
export interface ExportRequest {
  validationId: string;
  format: 'PDF' | 'CSV' | 'JSON';
  sections?: string[];
}

export interface ExportResponse {
  downloadUrl: string;
  filename: string;
  expiresAt: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

export interface RateLimitError extends ApiError {
  retryAfter: number; // seconds
  limit: number;
  remaining: number;
}

// Webhook types
export interface ValidationWebhook {
  validationId: string;
  status: 'COMPLETED' | 'FAILED';
  timestamp: string;
  data?: ValidationResultsResponse;
  error?: string;
}

// Cache types
export interface CacheEntry<T = any> {
  key: string;
  data: T;
  createdAt: string;
  expiresAt: string;
  ttl: number; // seconds
}

// Background job types
export interface ValidationJob {
  id: string;
  validationId: string;
  type: 'REDDIT_ANALYSIS' | 'TRENDS_ANALYSIS' | 'YOUTUBE_ANALYSIS' | 'AI_PROCESSING' | 'SCORING';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  data: any;
  priority: number;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}