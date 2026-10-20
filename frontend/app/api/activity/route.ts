import { activity } from "@/data/mock-data";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return Response.json(activity);
}
