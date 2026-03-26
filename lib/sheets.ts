const SHEET_ID = process.env.GOOGLE_SHEET_ID || "";
const API_KEY = process.env.GOOGLE_API_KEY || "";
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "Sheet1";

interface Candidate {
  username: string;
  password: string;
}

export async function getCandidates(): Promise<Candidate[]> {
  if (!SHEET_ID || !API_KEY) {
    throw new Error("Google Sheets not configured");
  }

  const range = encodeURIComponent(`${SHEET_NAME}!A:B`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch sheet: ${res.status}`);
  }

  const data = await res.json();
  const rows: string[][] = data.values || [];

  // Skip header row, map to candidates
  return rows.slice(1).map((row) => ({
    username: (row[0] || "").trim(),
    password: (row[1] || "").trim(),
  }));
}

export async function validateCandidate(
  username: string,
  password: string
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const candidates = await getCandidates();

    const match = candidates.find(
      (c) =>
        c.username.toLowerCase() === username.toLowerCase() &&
        c.password === password
    );

    if (match) {
      return { valid: true };
    }

    return { valid: false, reason: "Invalid username or password" };
  } catch (err) {
    console.error("Sheet validation error:", err);
    return { valid: false, reason: "Authentication service unavailable" };
  }
}
