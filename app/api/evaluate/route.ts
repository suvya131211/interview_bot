import { createAzure } from "@ai-sdk/azure";
import { generateObject } from "ai";
import { z } from "zod";
import { validateSessionCode } from "@/lib/auth";
import { CASE_STUDIES } from "@/lib/case-studies";
import { EVAL_DEPLOYMENT } from "@/lib/constants";

export const runtime = "edge";

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME,
  apiKey: process.env.AZURE_API_KEY,
});

const evalSchema = z.object({
  score: z.number().min(0).max(10).describe("Score from 0-10 for the PM question quality"),
  feedback: z.string().describe("One sentence evaluation of the question"),
  aiGenerated: z.boolean().describe("Whether the message appears to be AI-generated rather than typed by a human"),
});

export async function POST(req: Request) {
  const sessionCode = req.headers.get("x-session-code") || "";

  const auth = await validateSessionCode(sessionCode);
  if (!auth.valid) {
    return Response.json({ error: auth.reason || "Unauthorized" }, { status: 401 });
  }

  const { userMessage, conversationContext, caseStudyIndex } = await req.json();

  const caseIndex = typeof caseStudyIndex === "number" ? caseStudyIndex : 0;
  const caseStudy = CASE_STUDIES[caseIndex] || CASE_STUDIES[0];

  const result = await generateObject({
    model: azure(EVAL_DEPLOYMENT),
    schema: evalSchema,
    prompt: `You are evaluating a Product Manager candidate in a case study interview.

The scenario: ${caseStudy.evalScenario}

A good PM candidate should:
- Ask specific, structured questions (not vague ones)
- Break down the problem systematically
- Follow up on signals rather than asking random questions
- Use data to narrow down the root cause
- Not ask the analyst to do their thinking for them

Conversation so far:
${conversationContext}

Latest candidate message to evaluate:
"${userMessage}"

Rate this question/message on a 0-10 scale:
- 0-3: Vague, unfocused, or asking the analyst to solve it for them
- 4-6: Reasonable but could be more specific or structured
- 7-10: Sharp, specific, and shows strong analytical thinking

Also determine if the message appears AI-generated. Signs of AI-generated text:
- Overly formal or structured language for a chat context
- Uses bullet points or numbered lists in a casual chat
- Unnaturally perfect grammar and punctuation for a quick message
- Contains phrases like "Let's", "I'd like to", "Could you please" in an overly polished way
- Message is suspiciously long and well-organized for a quick analytical question
- Uses frameworks or buzzwords unnecessarily

A human typing quickly in a chat would be more casual, shorter, and possibly have minor imperfections.
Evaluate honestly — most short, direct questions are human-written.`,
  });

  return Response.json(result.object);
}
