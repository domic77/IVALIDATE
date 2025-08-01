"use client";

import { useEffect, useState } from "react";
import { ProcessingSteps } from "@/components/dashboard/ProcessingSteps";
import { ResultsDashboard } from "@/components/dashboard/ResultsDashboard";

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const response = await fetch(`/api/status/${params.id}`);
      const data = await response.json();
      setStatus(data);

      if (data.status !== "completed") {
        setTimeout(fetchStatus, 2000);
      }
    };

    fetchStatus();
  }, [params.id]);

  if (!status) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {status.status === "processing" && (
        <ProcessingSteps currentStep={status.currentStep} />
      )}
      {status.status === "completed" && (
        <ResultsDashboard results={status.results} />
      )}
    </div>
  );
}