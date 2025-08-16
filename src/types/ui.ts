import { ReactNode } from 'react';
import { ValidationRequest, ValidationScore, DashboardCard } from './validation';

// Form types
export interface IdeaFormData {
  description: string;
  industry: string;
  targetMarket: string;
  refinedIdeaData?: {
    oneLiner: string;
    targetAudience: string;
    problem: string;
  };
}

export interface IdeaFormProps {
  onSubmit: (data: IdeaFormData) => void;
  loading?: boolean;
  disabled?: boolean;
}

// Progress tracking types
export interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  estimatedTime: number; // seconds
  actualTime?: number;
}

export interface ProgressTrackerProps {
  validationId: string;
  steps: ProgressStep[];
  currentStep: string;
  progress: number; // 0-100
  onComplete?: (validationId: string) => void;
  onError?: (error: string) => void;
}

// Dashboard card types
export interface ScoreCardProps {
  score: ValidationScore;
  loading?: boolean;
  animated?: boolean;
}

export interface MarketDemandCardProps {
  data: {
    redditAnalytics: any;
    youtubeEngagement: any;
    webMentions: any;
    painPointHeatmap: any;
  };
  loading?: boolean;
}

export interface TrendsCardProps {
  data: {
    performance: any;
    regionalHotspots: any;
    relatedKeywords: any;
    competitorComparison: any;
  };
  loading?: boolean;
}

export interface CompetitionCardProps {
  data: {
    directCompetitors: any[];
    marketGaps: any[];
    differentiationOpportunities: any[];
    competitivePricing: any;
  };
  loading?: boolean;
}

export interface SentimentCardProps {
  data: {
    overallSentiment: number;
    platformBreakdown: any;
    keyThemes: any[];
    redFlags: any[];
  };
  loading?: boolean;
}

export interface MarketOpportunityCardProps {
  data: {
    tam: number;
    sam: number;
    som: number;
    revenueProjections: any;
  };
  loading?: boolean;
}

export interface RiskAssessmentCardProps {
  data: {
    marketRisk: any;
    technicalRisk: any;
    competitiveRisk: any;
    regulatoryRisk: any;
    mitigation: any;
  };
  loading?: boolean;
}

export interface ActionPlanCardProps {
  data: {
    recommendation: 'BUILD' | 'PIVOT' | 'PASS';
    confidence: number;
    timeline: any;
    successFactors: any[];
    nextSteps: any[];
  };
  loading?: boolean;
}

// Chart types
export interface ChartProps {
  data: any[];
  width?: number;
  height?: number;
  loading?: boolean;
  theme?: 'light' | 'dark';
}

export interface LineChartProps extends ChartProps {
  xDataKey: string;
  yDataKey: string;
  color?: string;
}

export interface BarChartProps extends ChartProps {
  xDataKey: string;
  yDataKey: string;
  color?: string;
}

export interface PieChartProps extends ChartProps {
  dataKey: string;
  nameKey: string;
  colors?: string[];
}

export interface HeatmapProps extends ChartProps {
  xDataKey: string;
  yDataKey: string;
  valueKey: string;
  colorScale?: string[];
}

// Layout types
export interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showNavigation?: boolean;
}

export interface DashboardLayoutProps extends LayoutProps {
  validationId: string;
  validation: ValidationRequest;
  cards: DashboardCard[];
  onCardUpdate?: (cardId: string, data: any) => void;
}

// Modal types
export interface ShareModalProps {
  validationId: string;
  isOpen: boolean;
  onClose: () => void;
  validation: ValidationRequest;
}

export interface ExportModalProps {
  validationId: string;
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'PDF' | 'CSV' | 'JSON') => void;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
}

export interface NavigationProps {
  items: NavigationItem[];
  currentPath: string;
}

// Toast/notification types
export interface ToastProps {
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  message?: string;
}

// Error states
export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
  retryable?: boolean;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

// Table types
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  width?: number;
  sortable?: boolean;
  render?: (value: any, record: T) => ReactNode;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  onRowClick?: (record: T) => void;
}