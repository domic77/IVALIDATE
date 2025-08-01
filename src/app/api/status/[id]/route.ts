import { NextResponse } from "next/server";
import { getValidationStatus } from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const status = await getValidationStatus(params.id);
  if (!status) {
    return new NextResponse("Not Found", { status: 404 });
  }
  return NextResponse.json(status);
}