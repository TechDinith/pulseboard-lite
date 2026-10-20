import { board } from "@/data/mock-data";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return Response.json(board);
}
