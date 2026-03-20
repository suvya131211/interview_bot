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

export const runtime = "edge";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

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
