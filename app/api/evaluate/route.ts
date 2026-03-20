import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

export const runtime = "edge";

const evalSchema = z.object({
  score: z.number().min(0).max(10).describe("Score from 0-10 for the PM question quality"),
  feedback: z.string().describe("One sentence evaluation of the question"),
  aiGenerated: z.boolean().describe("Whether the message appears to be AI-generated rather than typed by a human"),
});

export async function POST(req: Request) {
  const { userMessage, conversationContext } = await req.json();

  const result = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: evalSchema,
    prompt: `You are evaluating a Product Manager candidate in a case study interview.

The scenario: Swiggy orders dropped 12% in 2 weeks. The candidate is asking a junior data analyst questions to investigate the root cause.

A good PM candidate should:
- Ask specific, structured questions (not vague ones)
- Break down the problem systematically (traffic vs conversion, city-level, funnel steps)
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
