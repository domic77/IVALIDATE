import axios from 'axios';
import { RedditInsight, RedditPost } from '@/types/validation';
import { saveCache, loadCache } from '../storage/json';
import { saveRedditSearchDebug } from '../storage/debug-storage';
import { analyzeRedditContent } from '../ai/content-analyzer';

interface RedditApiResponse {
  data: {
    children: Array<{
      data: {
        title: string;
        selftext: string;
        subreddit: string;
        ups: number;
        num_comments: number;
        url: string;
        created_utc: number;
        score: number;
        author: string;
        permalink: string;
      };
    }>;
  };
}

interface RedditComment {
  data: {
    body: string;
    author: string;
    ups: number;
    created_utc: number;
  };
}

interface RedditCommentsResponse {
  data: {
    children: RedditComment[];
  };
}

// Core business subreddits + industry detection
const CORE_SUBREDDITS = ['entrepreneur', 'startups', 'smallbusiness'];

const INDUSTRY_SUBREDDITS: { [key: string]: string[] } = {
  'restaurant': ['KitchenConfidential', 'restaurateur', 'foodservice'],
  'inventory': ['smallbusiness', 'retailops', 'logistics'],
  'management': ['managers', 'smallbusiness', 'productivity'],
  'parking': ['urbanplanning', 'mildlyinfuriating', 'cars'],
  'fitness': ['fitness', 'PersonalTraining', 'homegym'],
  'dating': ['dating_advice', 'OnlineDating', 'relationships'],
  'education': ['teachers', 'education', 'onlinelearning'],
  'food': ['Cooking', 'KitchenConfidential', 'food'],
  'delivery': ['doordash_drivers', 'UberEATS', 'DeliveryDrivers'],
  'travel': ['travel', 'solotravel', 'TravelHacks'],
  'health': ['nutrition', 'HealthAnxiety', 'medical'],
  'finance': ['personalfinance', 'investing', 'FinancialPlanning'],
  'pet': ['dogs', 'cats', 'petcare'],
  'real estate': ['RealEstate', 'realestateinvesting', 'homeowners'],
  'ecommerce': ['ecommerce', 'shopify', 'amazon'],
  'software': ['webdev', 'programming', 'SaaS'],
  'marketing': ['marketing', 'socialmedia', 'advertising'],
  'freelance': ['freelance', 'freelancers', 'WorkOnline']
};

// Problem indicators that signal real pain points
const PROBLEM_INDICATORS = [
  'frustrating', 'annoying', 'hate', 'terrible', 'awful', 'nightmare',
  'waste of time', 'takes forever', 'so difficult', 'impossible',
  'wish there was', 'need something', 'looking for', 'anyone know',
  'help me find', 'struggling with', 'can\'t figure out', 'driving me crazy',
  'sick of', 'fed up', 'tired of', 'problem with', 'issue with'
];

export async function searchRedditDiscussions(
  keywords: string[], 
  idea?: string,
  aiOptions?: {
    targetSubreddits?: string[];
    focusQueries?: string[];
    painPointQueries?: string[];
    refinedIdeaData?: {
      oneLiner: string;
      targetAudience: string;
      problem: string;
    };
  }
): Promise<RedditInsight> {
  const fullIdea = idea || keywords.join(' ');
  const shortIdea = fullIdea.substring(0, 100); // Limit to 100 chars for cache key
  const cacheKey = `reddit_real_${shortIdea.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
  
  // Create unique validation ID for debug logging (extract from idea if possible)
  const validationId = fullIdea.replace(/\W+/g, '_').substring(0, 20) + '_' + Date.now();
  
  // Caching disabled for fresh data on each validation
  // const cached = await loadCache(cacheKey);
  // if (cached) {
  //   console.log('🎯 Using cached Reddit data');
  //   return cached;
  // }

  console.log('🔍 Starting REAL Reddit analysis for:', fullIdea);
  
  // Initialize debug tracking
  const searchResults: { subreddit: string; query: string; postsFound: number; error?: string; }[] = [];
  
  // Initialize variables outside try block so they're available in catch
  const subreddits = aiOptions?.targetSubreddits || getTargetSubreddits(fullIdea);
  let searchQueries: string[] = [];

  try {
    // Collect all posts for AI analysis instead of filtering by keywords
    const allPosts: Array<{
      title: string;
      content: string;
      author: string;
      upvotes: number;
      subreddit: string;
      url: string;
      timestamp: string;
      comments?: Array<{
        body: string;
        author: string;
        ups: number;
      }>;
    }> = [];

    console.log('📍 Searching subreddits:', subreddits);

    // Generate search queries (AI-powered if available)
    if (aiOptions?.focusQueries && aiOptions?.painPointQueries) {
      searchQueries = [...aiOptions.focusQueries, ...aiOptions.painPointQueries].slice(0, 6);
      console.log('🎯 Using AI-generated queries:', searchQueries);
    } else {
      searchQueries = generateProblemQueries(keywords, fullIdea);
      console.log('🔎 Using manual search queries:', searchQueries);
    }

    let totalPosts = 0;
    let postsAnalyzed = 0;

    // Search each subreddit for each query
    for (const subreddit of subreddits) {
      for (const query of searchQueries) {
        try {
          console.log(`📡 Searching r/${subreddit} for "${query}"`);
          
          const posts = await searchSubreddit(subreddit, query);
          totalPosts += posts.length;
          
          // Log search result for debugging
          searchResults.push({
            subreddit,
            query,
            postsFound: posts.length
          });

          // Collect all posts for AI analysis (no keyword filtering)
          for (const post of posts) {
            postsAnalyzed++;
            
            // Add post to collection for AI analysis
            const postData = {
              title: post.title || '',
              content: post.selftext || '',
              author: post.author || 'anonymous',
              upvotes: post.ups || 0,
              subreddit,
              url: `https://reddit.com${post.permalink}`,
              timestamp: new Date(post.created_utc * 1000).toISOString(),
              comments: undefined as Array<{body: string; author: string; ups: number}> | undefined
            };

            // Get top comments for posts with engagement (but limit to prevent overload)
            if (post.num_comments > 5 && allPosts.length < 50) {
              try {
                const comments = await getPostComments(post.permalink);
                postData.comments = comments.slice(0, 5).map(comment => ({
                  body: comment.body || '',
                  author: comment.author || 'anonymous',
                  ups: comment.ups || 0
                }));
              } catch (error) {
                console.log('Failed to get comments for post');
              }
            }

            allPosts.push(postData);

            // Limit to prevent overwhelming AI context
            if (allPosts.length >= 100) break;
          }

          // Rate limiting
          await sleep(1500);

        } catch (error) {
          console.warn(`Failed to search r/${subreddit} for "${query}"`, error);
          
          // Log search error for debugging
          searchResults.push({
            subreddit,
            query,
            postsFound: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          
          continue;
        }

        if (allPosts.length >= 100) break;
      }
      if (allPosts.length >= 100) break;
    }

    console.log(`✅ Collected ${allPosts.length} posts from ${postsAnalyzed} total posts for AI analysis`);

    // Use AI to analyze all content - NO FALLBACKS
    if (!aiOptions?.refinedIdeaData) {
      throw new Error('Refined idea data required for AI content analysis');
    }

    console.log('🤖 Using AI to analyze Reddit content...');
    
    const aiAnalysis = await analyzeRedditContent(allPosts, aiOptions.refinedIdeaData);
    
    // Convert AI analysis to the expected format
    const problemMentions = aiAnalysis.relevantQuotes.map(quote => ({
      quote: quote.quote,
      author: quote.author,
      subreddit: quote.subreddit,
      upvotes: quote.upvotes,
      url: quote.url,
      sentiment: quote.sentiment,
      timestamp: new Date().toISOString()
    }));
    
    // Calculate sentiment distribution from AI analysis
    console.log('🔍 AI quotes sentiments:', aiAnalysis.relevantQuotes.map(q => q.sentiment));
    const sentimentCounts = {
      frustrated: aiAnalysis.relevantQuotes.filter(q => q.sentiment === 'frustrated').length,
      neutral: aiAnalysis.relevantQuotes.filter(q => q.sentiment === 'neutral').length,
      satisfied: aiAnalysis.relevantQuotes.filter(q => q.sentiment === 'satisfied').length
    };
    console.log('📊 Sentiment counts:', sentimentCounts);
    
    console.log(`🎯 AI found ${problemMentions.length} relevant quotes from ${aiAnalysis.totalRelevantPosts} relevant posts`);

    // Calculate metrics using AI-derived data
    const score = calculateRealRedditScore(problemMentions, sentimentCounts);
    
    // Use AI-identified pain points
    const painPoints = aiAnalysis.painPoints;

    const insight: RedditInsight = {
      posts: problemMentions.slice(0, 20).map(mention => ({
        title: `"${mention.quote.substring(0, 100)}..."`,
        content: mention.quote,
        subreddit: mention.subreddit,
        upvotes: mention.upvotes,
        comments: 0,
        sentiment: mention.sentiment === 'frustrated' ? 3 : mention.sentiment === 'satisfied' ? 8 : 5,
        url: mention.url,
        createdAt: mention.timestamp
      })),
      sentiment: calculateAverageSentiment(sentimentCounts),
      painPoints,
      discussionVolume: problemMentions.length,
      engagementLevel: problemMentions.reduce((sum, m) => sum + m.upvotes, 0) / Math.max(1, problemMentions.length),
      score,
      realData: {
        totalMentions: problemMentions.length,
        frustratedUsers: sentimentCounts.frustrated,
        neutralUsers: sentimentCounts.neutral,
        satisfiedUsers: sentimentCounts.satisfied,
        totalRelevantPosts: aiAnalysis.totalRelevantPosts,
        overallSentiment: aiAnalysis.overallSentiment,
        frustrationLevel: aiAnalysis.frustrationLevel,
        keyInsights: aiAnalysis.keyInsights,
        topQuotes: problemMentions
          .sort((a, b) => b.upvotes - a.upvotes)
          .slice(0, 10)
          .map(m => ({
            quote: m.quote,
            author: m.author,
            subreddit: m.subreddit,
            upvotes: m.upvotes,
            sentiment: m.sentiment
          }))
      }
    };

    // Save debug data for Reddit search with AI analysis
    await saveRedditSearchDebug(validationId, {
      inputKeywords: keywords,
      targetSubreddits: subreddits,
      searchQueries,
      searchResults,
      totalMentions: problemMentions.length,
      frustratedUsers: sentimentCounts.frustrated,
      success: true,
      aiAnalysis: {
        totalPostsAnalyzed: allPosts.length,
        relevantQuotesFound: aiAnalysis.relevantQuotes.length,
        overallSentiment: aiAnalysis.overallSentiment,
        frustrationLevel: aiAnalysis.frustrationLevel,
        keyInsights: aiAnalysis.keyInsights
      }
    });
    
    // Caching disabled for fresh data on each validation
    // await saveCache(cacheKey, insight, 7200);
    
    return insight;

  } catch (error) {
    console.error('AI Reddit analysis failed:', error);
    
    // Save debug data for failed Reddit search
    await saveRedditSearchDebug(validationId, {
      inputKeywords: keywords,
      targetSubreddits: subreddits,
      searchQueries: searchQueries,
      searchResults,
      totalMentions: 0,
      frustratedUsers: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // NO FALLBACK - throw the error so validation fails
    throw error;
  }
}

function getTargetSubreddits(idea: string): string[] {
  const subreddits = [...CORE_SUBREDDITS];
  const ideaLower = idea.toLowerCase();
  
  // Find 3 industry-specific subreddits
  let industryCount = 0;
  for (const [keyword, relatedSubs] of Object.entries(INDUSTRY_SUBREDDITS)) {
    if (ideaLower.includes(keyword) && industryCount < 3) {
      subreddits.push(...relatedSubs.slice(0, 2));
      industryCount++;
    }
  }
  
  // Remove duplicates and limit to 6 total
  return [...new Set(subreddits)].slice(0, 6);
}

function generateProblemQueries(keywords: string[], idea: string): string[] {
  const queries: string[] = [];
  
  // Use top 3 keywords
  const topKeywords = keywords.slice(0, 3);
  
  for (const keyword of topKeywords) {
    // Problem-focused queries
    queries.push(`${keyword} problem`);
    queries.push(`${keyword} frustrating`);
    queries.push(`${keyword} difficult`);
    queries.push(`help with ${keyword}`);
    queries.push(`${keyword} solution`);
  }
  
  // Limit to 4 queries to avoid rate limiting
  return queries.slice(0, 4);
}

async function searchSubreddit(subreddit: string, query: string): Promise<any[]> {
  const searchUrl = `https://www.reddit.com/r/${subreddit}/search.json`;
  
  const response = await axios.get<RedditApiResponse>(searchUrl, {
    params: {
      q: query,
      sort: 'relevance',
      limit: 10,
      t: 'year', // Last 6 months to year
      restrict_sr: 'on'
    },
    headers: {
      'User-Agent': 'iValidate/1.0 (Research Tool)'
    },
    timeout: 8000
  });

  return response.data?.data?.children?.map(child => child.data) || [];
}

async function getPostComments(permalink: string): Promise<any[]> {
  const commentsUrl = `https://www.reddit.com${permalink}.json`;
  
  const response = await axios.get(commentsUrl, {
    params: { limit: 10 },
    headers: {
      'User-Agent': 'iValidate/1.0 (Research Tool)'
    },
    timeout: 5000
  });

  const commentsSection = response.data[1];
  return commentsSection?.data?.children?.map((child: RedditComment) => child.data) || [];
}

function extractProblemQuotes(
  text: string, 
  author: string, 
  subreddit: string, 
  upvotes: number, 
  url: string, 
  timestamp: string
): Array<{ quote: string; author: string; subreddit: string; upvotes: number; url: string; sentiment: 'frustrated' | 'neutral' | 'satisfied'; timestamp: string }> {
  
  if (!text || text.length < 20) return [];
  
  const quotes: Array<{ quote: string; author: string; subreddit: string; upvotes: number; url: string; sentiment: 'frustrated' | 'neutral' | 'satisfied'; timestamp: string }> = [];
  
  // Split into sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
  
  for (const sentence of sentences) {
    const cleanSentence = sentence.trim();
    
    // Check if sentence contains problem indicators
    const hasProblem = PROBLEM_INDICATORS.some(indicator => 
      cleanSentence.toLowerCase().includes(indicator.toLowerCase())
    );
    
    if (hasProblem && cleanSentence.length > 20 && cleanSentence.length < 300) {
      const sentiment = analyzeSentiment(cleanSentence);
      
      quotes.push({
        quote: cleanSentence,
        author: author || 'anonymous',
        subreddit,
        upvotes,
        url,
        sentiment,
        timestamp
      });
      
      // Limit quotes per post
      if (quotes.length >= 2) break;
    }
  }
  
  return quotes;
}

function extractCommentsQuotes(
  comments: any[], 
  subreddit: string, 
  url: string
): Array<{ quote: string; author: string; subreddit: string; upvotes: number; url: string; sentiment: 'frustrated' | 'neutral' | 'satisfied'; timestamp: string }> {
  
  const quotes: Array<{ quote: string; author: string; subreddit: string; upvotes: number; url: string; sentiment: 'frustrated' | 'neutral' | 'satisfied'; timestamp: string }> = [];
  
  for (const comment of comments.slice(0, 5)) { // Top 5 comments
    if (!comment.body || comment.body.length < 20) continue;
    
    const commentQuotes = extractProblemQuotes(
      comment.body,
      comment.author,
      subreddit,
      comment.ups || 0,
      url,
      new Date(comment.created_utc * 1000).toISOString()
    );
    
    quotes.push(...commentQuotes);
    
    if (quotes.length >= 5) break; // Limit comment quotes
  }
  
  return quotes;
}

function analyzeSentiment(text: string): 'frustrated' | 'neutral' | 'satisfied' {
  const frustrated = ['hate', 'awful', 'terrible', 'worst', 'frustrating', 'annoying', 'nightmare', 'driving me crazy', 'sick of', 'fed up'];
  const satisfied = ['love', 'great', 'awesome', 'perfect', 'amazing', 'excellent', 'fantastic', 'recommend', 'works well'];
  
  const textLower = text.toLowerCase();
  
  const frustratedCount = frustrated.filter(word => textLower.includes(word)).length;
  const satisfiedCount = satisfied.filter(word => textLower.includes(word)).length;
  
  if (frustratedCount > satisfiedCount) return 'frustrated';
  if (satisfiedCount > frustratedCount) return 'satisfied';
  return 'neutral';
}

function calculateRealRedditScore(mentions: any[], sentimentCounts: { frustrated: number; neutral: number; satisfied: number }): number {
  const totalMentions = mentions.length;
  
  if (totalMentions === 0) return 20;
  
  // Volume score (0-30 points)
  const volumeScore = Math.min(totalMentions * 0.6, 30);
  
  // Problem intensity score (0-40 points) - more frustrated users = more opportunity
  const problemIntensity = (sentimentCounts.frustrated / totalMentions) * 40;
  
  // Engagement score (0-30 points)
  const avgUpvotes = mentions.reduce((sum, m) => sum + m.upvotes, 0) / totalMentions;
  const engagementScore = Math.min(avgUpvotes * 2, 30);
  
  return Math.round(volumeScore + problemIntensity + engagementScore);
}

function extractRealPainPoints(mentions: any[]): string[] {
  const painPointMap = new Map<string, number>();
  
  // Count frequency of pain point themes
  for (const mention of mentions) {
    const quote = mention.quote.toLowerCase();
    
    // Extract key pain point phrases
    if (quote.includes('takes forever') || quote.includes('so slow')) {
      painPointMap.set('Process is too slow and time-consuming', (painPointMap.get('Process is too slow and time-consuming') || 0) + 1);
    }
    if (quote.includes('expensive') || quote.includes('costs too much')) {
      painPointMap.set('Current solutions are too expensive', (painPointMap.get('Current solutions are too expensive') || 0) + 1);
    }
    if (quote.includes('difficult') || quote.includes('hard to')) {
      painPointMap.set('Current process is too difficult/complex', (painPointMap.get('Current process is too difficult/complex') || 0) + 1);
    }
    if (quote.includes('wish there was') || quote.includes('need something')) {
      painPointMap.set('No good solution currently exists', (painPointMap.get('No good solution currently exists') || 0) + 1);
    }
    if (quote.includes('unreliable') || quote.includes('doesn\'t work')) {
      painPointMap.set('Existing solutions are unreliable', (painPointMap.get('Existing solutions are unreliable') || 0) + 1);
    }
  }
  
  // Return top pain points sorted by frequency
  return Array.from(painPointMap.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([painPoint, count]) => `${painPoint} (${count} mentions)`);
}

function calculateAverageSentiment(sentimentCounts: { frustrated: number; neutral: number; satisfied: number }): number {
  const total = sentimentCounts.frustrated + sentimentCounts.neutral + sentimentCounts.satisfied;
  
  if (total === 0) return 5;
  
  const weightedSum = (sentimentCounts.frustrated * 3) + (sentimentCounts.neutral * 5) + (sentimentCounts.satisfied * 8);
  return Math.round(weightedSum / total);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}