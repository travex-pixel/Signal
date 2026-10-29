import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { cacheLife } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import type { Digest, Story } from "@/lib/news/types";
import { analyzeStory } from "./engine";
import type { Analysis } from "./types";

/**
 * Optional AI enrichment.
 *
 * When ANTHROPIC_API_KEY is set, the rule-based analysis is handed to Claude
 * with the story and strict instructions: keep the fact/inference/hypothesis/
 * unknown labelling, never invent supplier relationships or company facts,
 * stay measured. The structured response is validated and used only if it
 * passes. Any failure falls back to the rule-based analysis, so the app
 * never depends on the credential.
 */

const claimSchema = z.object({
  kind: z.enum(["fact", "inference", "hypothesis", "unknown"]),
  text: z.string().min(10).max(600),
});

const enrichmentSchema = z.object({
  implication: z.array(claimSchema).min(1).max(4),
  secondOrder: z.array(claimSchema).min(1).max(4),
  options: z
    .array(z.object({ action: z.string().min(10).max(300), tradeoff: z.string().min(5).max(300) }))
    .min(1)
    .max(3),
  meeting: z.object({
    observation: z.string().min(20).max(500),
    question: z.string().min(10).max(300),
    counterpoint: z.string().min(10).max(400),
    indicator: z.string().min(5).max(300),
  }),
  confidenceReason: z.string().min(10).max(500),
});

const SYSTEM = `You are the reasoning layer of SIGNAL, an executive intelligence product read by a senior commercial leader at an Australian distributor of polymer resins and packaging film with suppliers in Southeast Asia, China, the United States and the Middle East.

Rules you must follow:
- Facts come only from the story provided. Do not add events, numbers or quotes that are not in it.
- Label every statement. "fact" only for what the source states. "inference" for reasoning from a named business mechanism. "hypothesis" for plausible downstream effects. "unknown" for what would change the conclusion and is not known.
- Never assert a connection to a specific supplier, contract, price, shipment or internal arrangement. Say exposure depends on details the report does not establish.
- Use plain, measured English with short sentences and common words, for a reader whose English is good but not native. Never use semicolons or dashes as punctuation. No hype, no consultant jargon, no exclamation marks. Write for someone who will say these sentences in a meeting.
- Keep the Australian lens: currency (AUD/USD), landed cost, lead times, demand, working capital, regulation.
- Do not mention the company name.`;

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function enrichAnalysis(story: Story, base: Analysis): Promise<Analysis> {
  // Remote so one paid model call serves every server instance, not one per instance.
  "use cache: remote";
  cacheLife({ stale: 3600, revalidate: 86400, expire: 7 * 86400 });
  if (!aiEnabled()) return base;
  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: process.env.SIGNAL_AI_MODEL || "claude-opus-5-5",
      max_tokens: 4000,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            `Story (publisher: ${story.publisher}; published: ${story.publishedAt ?? "unknown"}):`,
            `Headline: ${story.title}`,
            `Summary: ${story.summary ?? "(none)"}`,
            `Regions tagged: ${story.regions.join(", ")}. Topics tagged: ${story.topics.join(", ")}.`,
            "",
            "Rule-based draft to improve (keep what is right, sharpen what is generic, keep the labels):",
            JSON.stringify(
              {
                mechanisms: base.mechanisms.map((m) => ({ name: m.name, chain: m.chain })),
                implication: base.implication,
                secondOrder: base.secondOrder,
                options: base.options,
                meeting: base.meeting,
              },
              null,
              2,
            ),
          ].join("\n"),
        },
      ],
      output_config: { format: zodOutputFormat(enrichmentSchema) },
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) return base;
    const out = enrichmentSchema.parse(response.parsed_output);
    // Guard against the model relabelling inferences as facts.
    const sanitize = (claims: { kind: string; text: string }[]) =>
      claims.map((c) => ({ ...c, kind: c.kind === "fact" ? "inference" : c.kind })) as Analysis["implication"];
    return {
      ...base,
      generatedBy: "ai",
      implication: sanitize(out.implication),
      secondOrder: sanitize(out.secondOrder),
      options: out.options,
      meeting: out.meeting,
      confidence: { ...base.confidence, reason: `${base.confidence.reason} ${out.confidenceReason}` },
    };
  } catch {
    return base;
  }
}

/**
 * The analysis for a page, with a time budget. A cached enrichment returns in
 * milliseconds and is used. A cold one is given `budgetMs`; if it is not back
 * by then the page ships the rule-based analysis now and the enrichment
 * finishes after the response, so the next render of the page has it.
 */
export async function getAnalysis(story: Story, digest?: Digest, budgetMs = 2500): Promise<Analysis> {
  const base = analyzeStory(story, digest);
  if (!aiEnabled()) return base;
  const pending = enrichAnalysis(story, base);
  const timer = new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), budgetMs));
  const result = await Promise.race([pending, timer]);
  if (result) return result;
  after(() => pending.catch(() => undefined));
  return base;
}
