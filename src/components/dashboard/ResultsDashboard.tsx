import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Lightbulb, Target } from "lucide-react";

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
  if (score >= 40) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-red-600 bg-red-50 border-red-200";
};

export function ResultsDashboard({ results }: { results: any }) {
  return (
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
              {results.marketDemand.painPoints.map((point: string, index: number) => (
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
              <div className="text-xs">{results.competition.competitors.join(", ")}</div>
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
                {results.aiVerdict.nextSteps.map((step: string, index: number) => (
                  <div key={index} className="text-xs bg-blue-50 p-2 rounded mt-1">
                    {index + 1}. {step}
                  </div>
                ))}
              </div>
              <div>
                <div className="font-medium text-sm">Key Risks:</div>
                <div className="text-xs text-red-600 mt-1">
                  {results.aiVerdict.risks.join(" • ")}
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
  );
}