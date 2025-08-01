
// src/types/index.ts

/**
 * Generic API response for consistent structure.
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
}

/**
 * Represents the status of a validation job in the queue.
 */
export type ProcessingStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cached';

/**
 * User input for a new validation request.
 */
export interface ValidationRequest {
  idea: string;
  description?: string;
  targetAudience?: string;
  market?: string;
}

/**
 * Data scraped from Reddit.
 */
export interface RedditData {
  subreddit: string;
  postCount: number;
  topPosts: {
    title: string;
    url: string;
    score: number;
    commentCount: number;
  }[];
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  keywords: string[];
}

/**
 * Data from Google Trends.
 */
export interface TrendsData {
  keyword: string;
  timelineData: {
    time: string;
    value: number;
  }[];
  relatedQueries: {
    query: string;
    value: number;
  }[];
}

/**
 * AI-powered analysis and insights.
 */
export interface AIAnalysis {
  summary: string;
  viabilityScore: number; // 0-100
  marketPotential: string;
  recommendations: string[];
  risks: string[];
}

/**
 * The complete result of a validation, combining all data sources.
 */
export interface ValidationResult {
  id: string;
  createdAt: string;
  status: ProcessingStatus;
  request: ValidationRequest;
  results: {
    reddit: RedditData;
    trends: TrendsData;
    ai: AIAnalysis;
  };
}

/**
 * Represents the state of a validation job that is currently being processed.
 * Uses Partial to allow for incremental updates as data comes in.
 */
export type InProgressValidation = Omit<ValidationResult, 'results'> & {
  status: 'processing';
  results: Partial<{
    reddit: RedditData;
    trends: TrendsData;
    ai: AIAnalysis;
  }>;
};

/**
 * A union type to represent any possible state of a validation job.
 */
export type ValidationJob = ValidationResult | InProgressValidation | {
  id: string;
  status: 'queued' | 'failed';
  request: ValidationRequest;
};
