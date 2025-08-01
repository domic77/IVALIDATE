"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, Lightbulb, Users, TrendingUp, Target } from "lucide-react";

const processingSteps = [
  { text: "Analyzing your idea...", icon: Lightbulb },
  { text: "Scanning Reddit discussions...", icon: Users },
  { text: "Checking Google Trends...", icon: TrendingUp },
  { text: "Researching competitors...", icon: Target },
  { text: "Generating AI insights...", icon: CheckCircle },
];

export function ProcessingSteps({ currentStep }: { currentStep: number }) {
  return (
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
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  isCompleted
                    ? "bg-green-50 text-green-700"
                    : isCurrent
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-50 text-gray-500"
                }`}
              >
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
  );
}