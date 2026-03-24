import { validateSessionCode } from "@/lib/auth";
import { appendTestLog, SubmitLogData } from "@/lib/sheets-write";

export const runtime = "edge";

export async function POST(req: Request) {
  const sessionCode = req.headers.get("x-session-code") || "";
  const auth = await validateSessionCode(sessionCode);
  if (!auth.valid) {
    return Response.json(
      { error: auth.reason || "Unauthorized" },
      { status: 401 }
    );
  }

  const body: SubmitLogData = await req.json();

  if (!body.username || !body.caseStudyId || !body.finalAnswer?.trim()) {
    return Response.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    await appendTestLog(body);
    return Response.json({ success: true });
  } catch (err) {
    console.error("Failed to log submission:", err);
    return Response.json({ success: true, warning: "Log write failed" });
  }
}
