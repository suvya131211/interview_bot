import { validateCandidate } from "@/lib/sheets";
import { generateSessionCode } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return Response.json(
      { valid: false, reason: "Username and password required" },
      { status: 400 }
    );
  }

  const result = await validateCandidate(username, password);

  if (!result.valid) {
    return Response.json(result);
  }

  // Issue a signed session token so we don't hit the sheet on every request
  const sessionToken = await generateSessionCode();

  return Response.json({ valid: true, sessionToken });
}
