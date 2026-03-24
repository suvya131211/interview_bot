import { createAzure } from "@ai-sdk/azure";
import {
  streamText,
  UIMessage,
  createUIMessageStreamResponse,
  createUIMessageStream,
  convertToModelMessages,
} from "ai";
import { CASE_STUDIES } from "@/lib/case-studies";
import { CHAT_DEPLOYMENT } from "@/lib/constants";
import { validateSessionCode } from "@/lib/auth";

export const runtime = "edge";

const azure = createAzure({
  resourceName: process.env.AZURE_RESOURCE_NAME,
  apiKey: process.env.AZURE_API_KEY,
});

export async function POST(req: Request) {
  const sessionCode = req.headers.get("x-session-code") || "";
  const auth = await validateSessionCode(sessionCode);
  if (!auth.valid) {
    return Response.json({ error: auth.reason || "Unauthorized" }, { status: 401 });
  }

  const caseIndex = parseInt(req.headers.get("x-case-study") || "0", 10);
  const caseStudy = CASE_STUDIES[caseIndex] || CASE_STUDIES[0];

  const { messages }: { messages: UIMessage[] } = await req.json();

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model: azure(CHAT_DEPLOYMENT),
          system: caseStudy.systemPrompt,
          messages: await convertToModelMessages(messages),
        });

        writer.merge(result.toUIMessageStream());
      },
    }),
  });
}
