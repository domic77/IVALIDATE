"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb } from "lucide-react";

export function ValidationForm() {
  const [idea, setIdea] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;

    const response = await fetch("/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea }),
    });

    const { id } = await response.json();
    router.push(`/results/${id}`);
  };

  return (
    <Card className="border-2 border-blue-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-blue-600" />
          Tell us your startup idea
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            type="submit"
            disabled={!idea.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Validate My Idea ($24.99)
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}