import { validateAdminPassword, generateSessionCode } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
  const { password } = await req.json();

  if (!validateAdminPassword(password)) {
    return Response.json({ error: "Invalid admin password" }, { status: 401 });
  }

  const code = await generateSessionCode();
  return Response.json({ code });
}
