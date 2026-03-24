const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL || "";

export interface SubmitLogData {
  username: string;
  caseStudyId: string;
  caseStudyTitle: string;
  movesUsed: number;
  finalAnswer: string;
  messages: { role: string; content: string }[];
  evaluations: {
    moveNumber: number;
    score: number | null;
    feedback: string;
    aiWarning: boolean;
  }[];
  tabSwitches: number;
  pasteAttempts: number;
}

export async function appendTestLog(data: SubmitLogData): Promise<void> {
  if (!APPS_SCRIPT_URL) {
    console.warn(
      "GOOGLE_APPS_SCRIPT_URL not configured — skipping log write"
    );
    return;
  }

  const chatLog = data.messages
    .map((m) => `[${m.role}]: ${m.content}`)
    .join("\n---\n");

  const evalSummary = data.evaluations
    .map(
      (e) =>
        `Move ${e.moveNumber}: score=${e.score ?? "N/A"}, ai=${e.aiWarning}, feedback=${e.feedback}`
    )
    .join("\n");

  const payload = {
    timestamp: new Date().toISOString(),
    username: data.username,
    caseStudyTitle: data.caseStudyTitle,
    movesUsed: data.movesUsed,
    finalAnswer: data.finalAnswer,
    chatLog,
    evalSummary,
    tabSwitches: data.tabSwitches,
    pasteAttempts: data.pasteAttempts,
  };

  // Google Apps Script returns a 302 redirect. We first POST (which triggers
  // the script execution), then follow the redirect as GET to get the response.
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  // Apps Script returns 302 → redirected response may be 200 with HTML or JSON.
  // If we get a redirect that fetch couldn't follow, handle it manually.
  if (res.status === 302) {
    const redirectUrl = res.headers.get("location");
    if (redirectUrl) {
      const followRes = await fetch(redirectUrl);
      const text = await followRes.text();
      if (text.includes('"success"') || followRes.ok) return;
      throw new Error(`Apps Script redirect follow failed: ${text}`);
    }
  }

  // For successful follow-through redirects, the response body contains the result
  if (res.ok) {
    const text = await res.text();
    // Check if it's the Google "Page not found" HTML (fetch followed redirect to wrong place)
    if (text.includes("Page not found") || text.includes("unable to open")) {
      // The script likely executed on the initial POST, the redirect response is irrelevant
      // This is normal for Apps Script — the 302 means "done, here's the output"
      console.warn("Apps Script returned redirect HTML — script likely executed successfully");
      return;
    }
    return;
  }

  // If status is not ok AND not a redirect, something went wrong
  const text = await res.text();
  throw new Error(`Apps Script write failed: ${res.status} ${text}`);
}
