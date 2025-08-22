import { RedditInsight } from '@/types/validation';

export interface RealValidationScores {
  marketDemand: {
    score: number;
    details: {
      mentionCount: number;
      frustrationLevel: number;
      severityScore: number;
      engagementScore: number;
    };
  };
  competition: {
    score: number;
    details: {
      competitorMentions: number;
      userComplaints: number;
      opportunityGaps: number;
    };
  };
  overall: {
    score: number;
    grade: 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
    confidence: number;
  };
}

// REAL Market Demand Score (0-100)
export function calculateMarketDemandScore(redditData: RedditInsight): RealValidationScores['marketDemand'] {
  console.log('📊 Calculating REAL Market Demand Score...');
  
  // No real data = low score
  if (!redditData.realData || redditData.realData.totalMentions === 0) {
    return {
      score: 15,
      details: {
        mentionCount: 0,
        frustrationLevel: 0,
        severityScore: 0,
        engagementScore: 0
      }
    };
  }

  const { totalMentions, frustratedUsers, topQuotes } = redditData.realData;
  
  // 1. Mention Count Score (0-30 points) - Realistic thresholds
  let mentionScore = 0;
  if (totalMentions >= 100) mentionScore = 30;     // Excellent validation
  else if (totalMentions >= 50) mentionScore = 26;  // Very good
  else if (totalMentions >= 25) mentionScore = 22;  // Good validation
  else if (totalMentions >= 15) mentionScore = 18;  // Decent validation
  else if (totalMentions >= 10) mentionScore = 14;  // Some validation
  else if (totalMentions >= 5) mentionScore = 10;   // Minimal validation
  else if (totalMentions >= 1) mentionScore = 6;    // Very weak validation
  else mentionScore = 0;

  // 2. Frustration Level Score (0-35 points) - Strict scoring
  const frustrationPercentage = (frustratedUsers / totalMentions) * 100;
  let frustrationScore = 0;
  if (frustrationPercentage >= 70) frustrationScore = 35; // Extreme frustration
  else if (frustrationPercentage >= 50) frustrationScore = 28; // High frustration  
  else if (frustrationPercentage >= 35) frustrationScore = 22; // Good frustration
  else if (frustrationPercentage >= 25) frustrationScore = 16; // Decent frustration
  else if (frustrationPercentage >= 15) frustrationScore = 12; // Some frustration
  else if (frustrationPercentage >= 10) frustrationScore = 8;  // Minimal frustration
  else frustrationScore = 4; // Very low frustration

  // 3. Quote Severity Score (0-25 points) - Look for financial/time impact
  let severityScore = 0;
  const highSeverityKeywords = [
    '$', 'cost', 'expensive', 'waste', 'hours', 'days', 'months',
    'fortune', 'thousand', 'million', 'losing money', 'time consuming'
  ];
  
  let severityMentions = 0;
  if (!topQuotes || topQuotes.length === 0) {
    severityScore = 0;
  } else {
    topQuotes.forEach(quote => {
      const quoteText = quote.quote.toLowerCase();
      highSeverityKeywords.forEach(keyword => {
        if (quoteText.includes(keyword)) {
          severityMentions++;
          
          // Extra points for specific financial mentions
          if (quoteText.match(/\$\d+/)) severityScore += 5;
          if (quoteText.includes('thousand') || quoteText.includes('k ')) severityScore += 3;
          if (quoteText.includes('hours') || quoteText.includes('days')) severityScore += 2;
        }
      });
    });
  }
  
  severityScore = Math.min(severityScore + (severityMentions * 2), 25);

  // 4. Engagement Score (0-10 points) - Based on upvotes
  const avgUpvotes = redditData.engagementLevel || 0;
  const engagementScore = Math.min(avgUpvotes * 0.5, 10);

  const totalScore = Math.round(mentionScore + frustrationScore + severityScore + engagementScore);
  
  console.log(`✅ Market Demand: ${totalScore}/100 (${totalMentions} mentions, ${frustrationPercentage.toFixed(1)}% frustrated)`);
  
  return {
    score: Math.min(totalScore, 100),
    details: {
      mentionCount: mentionScore,
      frustrationLevel: frustrationScore,
      severityScore,
      engagementScore
    }
  };
}

// Remove trend scoring - now using Reddit-only validation

// REAL Competition Score (0-100)
export function calculateCompetitionScore(redditData: RedditInsight): RealValidationScores['competition'] {
  console.log('🏆 Calculating REAL Competition Score...');
  
  let competitorMentions = 0;
  let userComplaints = 0;
  let opportunityGaps = 0;

  // Analyze Reddit data for competitor mentions and complaints
  if (redditData.realData && redditData.realData.topQuotes) {
    const competitorKeywords = [
      'competitor', 'alternative', 'better than', 'instead of', 'compared to',
      'switch from', 'disappointed with', 'doesn\'t work', 'broken', 'unreliable'
    ];
    
    redditData.realData.topQuotes.forEach(quote => {
      const quoteText = quote.quote.toLowerCase();
      
      // Count competitor mentions
      if (competitorKeywords.some(keyword => quoteText.includes(keyword))) {
        competitorMentions++;
      }
      
      // Count user complaints about existing solutions
      if (quote.sentiment === 'frustrated' && 
          (quoteText.includes('current') || quoteText.includes('existing') || quoteText.includes('using'))) {
        userComplaints++;
      }
      
      // Count opportunity gaps (people looking for alternatives)
      if (quoteText.includes('wish there was') || 
          quoteText.includes('need something') || 
          quoteText.includes('looking for') ||
          quoteText.includes('anyone know')) {
        opportunityGaps++;
      }
    });
  }

  // 1. Competitor Mention Score (0-40 points) - Stricter baseline
  const totalMentions = redditData.realData?.totalMentions || 0;
  const competitorPercentage = totalMentions > 0 ? (competitorMentions / totalMentions) * 100 : 0;
  
  let competitorScore = 0;
  if (competitorPercentage <= 3) competitorScore = 40;   // Very low competition
  else if (competitorPercentage <= 8) competitorScore = 34;  // Low competition
  else if (competitorPercentage <= 15) competitorScore = 28; // Moderate competition
  else if (competitorPercentage <= 25) competitorScore = 22; // Higher competition
  else if (competitorPercentage <= 40) competitorScore = 16; // High competition
  else if (competitorPercentage <= 60) competitorScore = 10; // Very high competition
  else competitorScore = 5; // Saturated market

  // 2. User Complaint Score (0-35 points) - Stricter scoring
  let complaintScore = 0;
  if (userComplaints >= 10) complaintScore = 35; // Many complaints
  else if (userComplaints >= 7) complaintScore = 30;  // Good complaints
  else if (userComplaints >= 5) complaintScore = 25;  // Some complaints
  else if (userComplaints >= 3) complaintScore = 20;  // Few complaints
  else if (userComplaints >= 1) complaintScore = 15;  // At least one complaint
  else complaintScore = 8; // No specific complaints

  // 3. Opportunity Gap Score (0-25 points) - Stricter scoring
  let gapScore = 0;
  if (opportunityGaps >= 8) gapScore = 25;   // Many people looking
  else if (opportunityGaps >= 5) gapScore = 20;  // Some people looking
  else if (opportunityGaps >= 3) gapScore = 15;  // Few people looking
  else if (opportunityGaps >= 1) gapScore = 10;  // At least one looking
  else gapScore = 5; // No clear gaps

  const totalScore = Math.round(competitorScore + complaintScore + gapScore);
  
  console.log(`🏆 Competition Score: ${totalScore}/100 (${competitorMentions} competitor mentions, ${userComplaints} complaints)`);
  
  return {
    score: Math.min(totalScore, 100),
    details: {
      competitorMentions,
      userComplaints,
      opportunityGaps
    }
  };
}

// Calculate Overall REAL Validation Score
export function calculateRealValidationScore(
  redditData: RedditInsight, 
  trendsData: any = null
): RealValidationScores {
  
  console.log('🎯 Calculating REAL Overall Validation Score...');
  
  // Calculate individual scores using REAL data (Reddit-focused)
  const marketDemand = calculateMarketDemandScore(redditData);
  const competition = calculateCompetitionScore(redditData);
  
  // Weighted overall score (Reddit-only approach)
  const weightedScore = (
    marketDemand.score * 0.60 +  // 60% weight - Market demand is most important
    competition.score * 0.40     // 40% weight - Competition landscape from Reddit
  );
  
  const overallScore = Math.round(weightedScore);
  
  // Calculate grade - Stricter boundaries
  let grade: 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
  if (overallScore >= 90) grade = 'A';      // Excellent validation
  else if (overallScore >= 80) grade = 'B+'; // Very good validation  
  else if (overallScore >= 70) grade = 'B';  // Good validation
  else if (overallScore >= 60) grade = 'C';  // Decent validation
  else if (overallScore >= 50) grade = 'D';  // Weak but possible
  else grade = 'F'; // Poor validation
  
  // Calculate confidence based on Reddit data quality only
  const dataQuality = calculateDataQuality(redditData);
  
  console.log(`🎯 REAL Overall Score: ${overallScore}/100 (Grade: ${grade}) - Confidence: ${dataQuality}%`);
  
  return {
    marketDemand,
    competition,
    overall: {
      score: overallScore,
      grade,
      confidence: dataQuality
    }
  };
}

function calculateDataQuality(redditData: RedditInsight): number {
  let qualityScore = 0;
  
  // Reddit data quality (0-100 points - stricter requirements)
  if (redditData.realData && redditData.realData.totalMentions > 0) {
    qualityScore += 30; // Has real Reddit data
    
    if (redditData.realData.totalMentions >= 100) qualityScore += 30; // Excellent sample size
    else if (redditData.realData.totalMentions >= 50) qualityScore += 25; // Very good sample size
    else if (redditData.realData.totalMentions >= 25) qualityScore += 20; // Good sample size
    else if (redditData.realData.totalMentions >= 15) qualityScore += 15; // Fair sample size
    else if (redditData.realData.totalMentions >= 10) qualityScore += 10; // Minimal sample size
    else qualityScore += 5; // Very minimal sample size
    
    if (redditData.realData.topQuotes.length >= 15) qualityScore += 15; // Excellent quote diversity
    else if (redditData.realData.topQuotes.length >= 10) qualityScore += 12; // Good quote diversity
    else if (redditData.realData.topQuotes.length >= 5) qualityScore += 8; // Some quotes
    else qualityScore += 3; // Few quotes
    
    if (redditData.realData.frustratedUsers > 0) qualityScore += 10; // Has sentiment data
    
    // Engagement quality bonus - stricter requirements
    const avgUpvotes = redditData.engagementLevel || 0;
    if (avgUpvotes >= 15) qualityScore += 15; // High engagement
    else if (avgUpvotes >= 8) qualityScore += 10; // Good engagement
    else if (avgUpvotes >= 3) qualityScore += 5; // Some engagement
  } else {
    qualityScore = 10; // Very low score for no real data
  }
  
  return Math.min(qualityScore, 100);
}

// Helper function to format score insights
export function formatScoreInsights(scores: RealValidationScores): string[] {
  const insights: string[] = [];
  
  // Market demand insights
  if (scores.marketDemand.details.mentionCount > 0) {
    insights.push(`Found real user discussions with ${scores.marketDemand.details.frustrationLevel}% expressing frustration`);
  }
  
  // Competition insights
  if (scores.competition.details.userComplaints > 0) {
    insights.push(`${scores.competition.details.userComplaints} users complained about existing solutions`);
  }
  
  if (scores.competition.details.opportunityGaps > 0) {
    insights.push(`${scores.competition.details.opportunityGaps} users actively looking for alternatives`);
  }
  
  return insights;
}