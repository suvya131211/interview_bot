const SECRET = process.env.SESSION_SECRET || "default-change-me";
const SESSION_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

async function hmacSign(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function generateSessionCode(): Promise<string> {
  const id = crypto.randomUUID().slice(0, 8).toUpperCase();
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${id}.${exp}`;
  const sig = await hmacSign(payload);
  return `${payload}.${sig}`;
}

export async function validateSessionCode(
  code: string
): Promise<{ valid: boolean; reason?: string }> {
  if (!code) return { valid: false, reason: "No code provided" };

  const parts = code.split(".");
  if (parts.length !== 3) return { valid: false, reason: "Invalid code format" };

  const [id, expStr, sig] = parts;
  const payload = `${id}.${expStr}`;

  const expectedSig = await hmacSign(payload);
  if (sig !== expectedSig) return { valid: false, reason: "Invalid code" };

  const exp = parseInt(expStr, 10);
  if (Date.now() > exp) return { valid: false, reason: "Code expired" };

  return { valid: true };
}
