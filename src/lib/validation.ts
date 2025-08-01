import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const queueDir = path.join(dataDir, "queue");
const validationsDir = path.join(dataDir, "validations");

async function ensureDirectories() {
  await fs.mkdir(queueDir, { recursive: true });
  await fs.mkdir(validationsDir, { recursive: true });
}

export async function queueValidation(idea: string) {
  await ensureDirectories();
  const id = Date.now().toString();
  const job = { id, idea, status: "queued", startTime: Date.now() };
  await fs.writeFile(path.join(queueDir, `${id}.json`), JSON.stringify(job));
  return id;
}

export async function processValidation(id: string) {
  const jobPath = path.join(queueDir, `${id}.json`);
  const validationPath = path.join(validationsDir, `${id}.json`);

  let job;
  try {
    const jobData = await fs.readFile(jobPath, "utf-8");
    job = JSON.parse(jobData);
  } catch (error) {
    console.error("Error reading job file:", error);
    return;
  }

  await fs.writeFile(
    validationPath,
    JSON.stringify({ ...job, status: "processing", currentStep: 0 })
  );

  // Simulate processing steps
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const currentState = JSON.parse(await fs.readFile(validationPath, "utf-8"));
    currentState.currentStep = i + 1;
    await fs.writeFile(validationPath, JSON.stringify(currentState));
  }

  const results = {
    validationScore: 74,
    grade: "B+",
    recommendation: "BUILD",
    confidence: "High",
    marketDemand: {
      score: 78,
      insight: "Strong demand signals found on Reddit",
      painPoints: [
        "Manual inventory counting takes too much time",
        "Food costs are unpredictable and hard to track",
        "Current tools don't integrate with POS systems",
      ],
    },
    competition: {
      score: 65,
      insight: "Moderate competition with clear gaps",
      competitors: ["Toast", "Square", "Resy"],
      gap: "No mobile-first solution for small restaurants",
    },
    trends: {
      score: 71,
      insight: "Growing market with 40% YoY search increase",
      direction: "Rising",
    },
    aiVerdict: {
      recommendation: "BUILD",
      reasoning:
        "Strong market demand with solvable problem and clear differentiation opportunity",
      nextSteps: [
        "Interview 10 restaurant owners about inventory pain points",
        "Build MVP with basic inventory tracking features",
        "Test integration with popular POS systems",
      ],
      risks: [
        "High competition",
        "Integration complexity",
        "Market education needed",
      ],
    },
  };

  const finalState = JSON.parse(await fs.readFile(validationPath, "utf-8"));
  finalState.status = "completed";
  finalState.results = results;
  await fs.writeFile(validationPath, JSON.stringify(finalState));

  await fs.unlink(jobPath);
}

export async function getValidationStatus(id: string) {
  try {
    const data = await fs.readFile(
      path.join(validationsDir, `${id}.json`),
      "utf-8"
    );
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}