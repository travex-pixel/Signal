import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { formatDateTime } from "@/lib/format";
import type { Digest, Story } from "@/lib/news/types";
import { analyzeStory } from "./engine";

/**
 * Ask SIGNAL: a reader's question answered from today's digest.
 *
 * The model only sees the stories SIGNAL already holds (headline, publisher,
 * time, summary, tags) and, when the question is about one story, the
 * rule-based analysis of it. The same rules as the enrichment apply: facts
 * only from the material provided, interpretation labelled, no claims about
 * specific suppliers or contracts, measured English. Requires
 * ANTHROPIC_API_KEY; the interface hides the feature without it.
 */

export const ASK_SYSTEM = `You are SIGNAL, an executive intelligence assistant for a senior commercial leader at an Australian distributor of polymer resins and packaging film with suppliers in Southeast Asia, China, the United States and the Middle East.

You answer questions using only the stories and analysis provided in the conversation. Rules:
- Facts come only from the provided material. If the answer is not in it, say so plainly and suggest what to check; do not invent events, numbers or quotes.
- When you reason beyond what a source states, say "SIGNAL's reading:" or "likely" so the reader can tell inference from fact.
- Never assert a connection to a specific supplier, contract, price, shipment or internal arrangement. Say that exposure depends on details not in the material.
- Cite by publisher and headline when you lean on a story, e.g. (Reuters: "...").
- Plain, measured English for a reader whose English is good but not native, who will repeat it in a meeting. Short sentences. Short paragraphs. Common words. Never use semicolons or dashes as punctuation. No bullet lists unless asked. No hype, no exclamation marks, no jargon.
- Keep the Australian lens: the dollar, landed cost, lead times, demand, working capital, regulation.
- Default to under 180 words unless the question asks for depth.
- Do not mention the company name.`;

export function buildAskContext(digest: Digest, story?: Story): string {
  const top = digest.stories.slice(0, 14);
  const lines = top.map((s, i) => {
    const when = s.publishedAt ? formatDateTime(s.publishedAt, { year: "numeric" }) : "time not stated";
    return `${i + 1}. [${s.publisher}, ${when}] "${s.title}"${s.summary ? `: ${s.summary}` : ""} (regions: ${s.regions.join(", ")}. topics: ${s.topics.join(", ") || "none"})`;
  });
  let out = `Today's digest (${top.length} highest-ranked stories as of ${formatDateTime(digest.generatedAt, { year: "numeric" })} Sydney):\n${lines.join("\n")}`;
  if (story) {
    const a = analyzeStory(story, digest);
    out += `\n\nThe reader is looking at this story: [${story.publisher}] "${story.title}"${story.summary ? `: ${story.summary}` : ""}\nSIGNAL's rule-based analysis of it:\n${JSON.stringify(
      {
        mechanisms: a.mechanisms.map((m) => ({ name: m.name, chain: m.chain })),
        implication: a.implication.map((c) => `${c.kind}: ${c.text}`),
        secondOrder: a.secondOrder.map((c) => `${c.kind}: ${c.text}`),
        options: a.options,
        meeting: a.meeting,
        confidence: a.confidence,
        doesNotEstablish: a.evidence.doesNotEstablish,
      },
      null,
      1,
    )}`;
  }
  return out;
}

/** Streams the answer's text deltas. Throws on API failure; the route turns that into a readable error. */
export async function* streamAnswer(question: string, context: string): AsyncGenerator<string> {
  const client = new Anthropic();
  const stream = client.messages.stream({
    model: process.env.SIGNAL_AI_MODEL || "claude-opus-5-5",
    max_tokens: 900,
    system: [{ type: "text", text: ASK_SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: context, cache_control: { type: "ephemeral" } },
          { type: "text", text: `Question: ${question}` },
        ],
      },
    ],
  });
  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    yield "\n\nSIGNAL could not answer that question.";
  }
}
