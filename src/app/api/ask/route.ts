import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { aiEnabled } from "@/lib/analysis/ai";
import { buildAskContext, streamAnswer } from "@/lib/analysis/ask";
import { findStory, getDigest } from "@/lib/news/pipeline";

export const maxDuration = 60;

const bodySchema = z.object({
  question: z.string().trim().min(3).max(500),
  storyId: z.string().regex(/^[0-9a-f]{12}$/).optional(),
});

/** A light per-instance limiter: 12 questions a minute per address. */
const hits = new Map<string, number[]>();
function limited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > 12;
}

export async function POST(request: Request) {
  if (!aiEnabled()) {
    return Response.json({ error: "Ask SIGNAL is not configured on this deployment." }, { status: 503 });
  }
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "anonymous";
  if (limited(ip)) {
    return Response.json({ error: "Too many questions in a minute. Give it a moment." }, { status: 429 });
  }
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return Response.json({ error: "Ask a question of between 3 and 500 characters." }, { status: 400 });
  }

  const digest = await getDigest();
  const story = body.storyId ? findStory(digest, body.storyId) : undefined;
  const context = buildAskContext(digest, story);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamAnswer(body.question, context)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const message =
          err instanceof Anthropic.RateLimitError
            ? "The answering service is busy. Try again in a minute."
            : err instanceof Anthropic.AuthenticationError
              ? "The answering service rejected this deployment's key."
              : err instanceof Anthropic.APIError
                ? `The answering service returned an error (${err.status}).`
                : "The answering service could not be reached.";
        controller.enqueue(encoder.encode(`\n\n[${message}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}
