import { NextResponse } from "next/server";
import { queueValidation, processValidation } from "@/lib/validation";

export async function POST(request: Request) {
  const { idea } = await request.json();
  const id = await queueValidation(idea);

  // Don't await this, let it run in the background
  processValidation(id);

  return NextResponse.json({ id });
}