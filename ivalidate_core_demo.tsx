import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, TrendingUp, Users, Lightbulb, Target } from 'lucide-react';

const IValidateDemo = () => {
  const [idea, setIdea] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const processingSteps = [
    { text: "Analyzing your idea...", icon: Lightbulb },
    { text: "Scanning Reddit discussions...", icon: Users },
    { text: "Checking Google Trends...", icon: TrendingUp },
    { text: "Researching competitors...", icon: Target },
    { text: "Generating AI insights...", icon: CheckCircle }
  ];

  // Simulate the validation process
  const handleValidate = async () => {
    if (!idea.trim()) return;
    
    setIsProcessing(true);
    setResults(null);
    
    // Simulate processing steps
    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Simulate results (in real version, this calls your APIs)
    const mockResults = {
      validationScore: 74,
      grade: 'B+',
      recommendation: 'BUILD',
      confidence: 'High',
      marketDemand: {
        score: 78,
        insight: "Strong demand signals found on Reddit",
        painPoints: [
          "Manual inventory counting takes too much time",
          "Food costs are unpredictable and hard to track",
          "Current tools don't integrate with POS systems"
        ]
      },
      competition: {
        score: 65,
        insight: "Moderate competition with clear gaps",
        competitors: ["Toast", "Square", "Resy"],
        gap: "No mobile-first solution for small restaurants"
      },
      trends: {
        score: 71,
        insight: "Growing market with 40% YoY search increase",
        direction: "Rising"
      },
      aiVerdict: {
        recommendation: "BUILD",
        reasoning: "Strong market demand with solvable problem and clear differentiation opportunity",
        nextSteps: [
          "Interview 10 restaurant owners about inventory pain points",
          "Build MVP with basic inventory tracking features",
          "Test integration with popular POS systems"
        ],
        risks: ["High competition", "Integration complexity", "Market education needed"]
      }
    };
    
    setTimeout(() => {
      setResults(mockResults);
      setIsProcessing(false);
    }, 1000);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          iValidate Core Demo
        </h1>
        <p className="text-gray-600">
          See how your startup idea validation will work
        </p>
      </div>

      {/* Input Form */}
      {!isProcessing && !results && (
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-blue-600" />
              Tell us your startup idea
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Describe your startup idea:
              </label>
              <Textarea
                placeholder="e.g., A SaaS platform for restaurant inventory management that integrates with POS systems and uses AI to predict ingredient needs..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button 
              onClick={handleValidate}
              disabled={!idea.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Validate My Idea ($24.99)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Processing Steps */}
      {isProcessing && (
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              Validating your idea...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processingSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                    isCompleted ? 'bg-green-50 text-green-700' :
                    isCurrent ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : isCurrent ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                    <span className="font-medium">{step.text}</span>
                    {isCompleted && <span className="ml-auto text-sm">✓</span>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Dashboard */}
      {results && (
        <div className="space-y-6">
          {/* Validation Score */}
          <Card className={`border-2 ${getScoreColor(results.validationScore)}`}>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{results.validationScore}/100</div>
                <div className="text-xl font-semibold mb-2">Grade: {results.grade}</div>
                <div className="text-lg">Recommendation: <span className="font-bold">{results.recommendation}</span></div>
                <div className="text-sm opacity-75 mt-2">Confidence: {results.confidence}</div>
              </div>
            </CardContent>
          </Card>

          {/* Insight Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Market Demand */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Market Demand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {results.marketDemand.score}/100
                </div>
                <p className="text-sm text-gray-600 mb-4">{results.marketDemand.insight}</p>
                <div className="space-y-2">
                  <div className="font-medium text-sm">Top Pain Points:</div>
                  {results.marketDemand.painPoints.map((point, index) => (
                    <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                      • {point}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Competition */}
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  Competition Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  {results.competition.score}/100
                </div>
                <p className="text-sm text-gray-600 mb-4">{results.competition.insight}</p>
                <div className="space-y-2">
                  <div className="font-medium text-sm">Main Competitors:</div>
                  <div className="text-xs">{results.competition.competitors.join(', ')}</div>
                  <div className="font-medium text-sm mt-3">Market Gap:</div>
                  <div className="text-xs bg-green-50 p-2 rounded text-green-700">
                    {results.competition.gap}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trends */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {results.trends.score}/100
                </div>
                <p className="text-sm text-gray-600 mb-4">{results.trends.insight}</p>
                <div className="inline-flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {results.trends.direction}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* AI Verdict */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                  AI Verdict
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-600 mb-2">
                  {results.aiVerdict.recommendation}
                </div>
                <p className="text-sm text-gray-600 mb-4">{results.aiVerdict.reasoning}</p>
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-sm">Next Steps:</div>
                    {results.aiVerdict.nextSteps.map((step, index) => (
                      <div key={index} className="text-xs bg-blue-50 p-2 rounded mt-1">
                        {index + 1}. {step}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-medium text-sm">Key Risks:</div>
                    <div className="text-xs text-red-600 mt-1">
                      {results.aiVerdict.risks.join(' • ')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Download Report */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <h3 className="text-lg font-bold mb-2">Get Your Full Validation Report</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download a comprehensive PDF with detailed analysis, competitor research, and actionable recommendations.
              </p>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Download PDF Report
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IValidateDemo;