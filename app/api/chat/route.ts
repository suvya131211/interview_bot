import { openai } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  createUIMessageStreamResponse,
  createUIMessageStream,
  convertToModelMessages,
} from "ai";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { MODEL_ID } from "@/lib/constants";
import { validateSessionCode } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages, sessionCode }: { messages: UIMessage[]; sessionCode: string } =
    await req.json();

  const auth = await validateSessionCode(sessionCode);
  if (!auth.valid) {
    return Response.json({ error: auth.reason || "Unauthorized" }, { status: 401 });
  }

  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model: openai(MODEL_ID),
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages),
        });

        writer.merge(result.toUIMessageStream());
      },
    }),
  });
}
