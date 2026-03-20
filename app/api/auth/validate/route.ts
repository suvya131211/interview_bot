import { validateSessionCode } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
  const { code } = await req.json();
  const result = await validateSessionCode(code);
  return Response.json(result);
}
