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

/**
 * The fields of a story that identify it for enrichment. Deliberately leaves
 * out everything that changes when the digest is rebuilt (retrieval time,
 * recency, ranking reasons, related-story counts), so one paid model call
 * serves every rebuild of the same story instead of one per rebuild.
 */
export interface EnrichKey {
  id: string;
  title: string;
  summary?: string;
  publisher: string;
  publishedAt?: string;
  url: string;
  regions: Story["regions"];
  topics: Story["topics"];
  countries: string[];
  discovery: boolean;
  evidenceWeight: Story["evidenceWeight"];
  alsoReportedBy?: string[];
}

export function enrichKey(s: Story): EnrichKey {
  return {
    id: s.id,
    title: s.title,
    summary: s.summary,
    publisher: s.publisher,
    publishedAt: s.publishedAt,
    url: s.url,
    regions: s.regions,
    topics: s.topics,
    countries: s.countries,
    discovery: s.discovery,
    evidenceWeight: s.evidenceWeight,
    alsoReportedBy: s.alsoReportedBy?.map((r) => r.publisher),
  };
}

type Enrichment = z.infer<typeof enrichmentSchema>;

/**
 * One model call per story, cached remotely and shared by every server.
 * Returns null when the model declines or its output does not validate; that
 * outcome is cached on purpose. A transport failure (rate limit, overload,
 * timeout) throws instead, so it is not cached and the next call retries.
 */
export async function enrichAnalysis(key: EnrichKey): Promise<Enrichment | null> {
  "use cache: remote";
  cacheLife({ stale: 3600, revalidate: 7 * 86400, expire: 30 * 86400 });
  if (!aiEnabled()) return null;
  const story: Story = {
    ...key,
    canonicalUrl: key.url,
    sourceId: "",
    sourceType: "publisher",
    retrievedAt: "",
    relevance: { score: 0, reasons: [] },
    alsoReportedBy: key.alsoReportedBy?.map((publisher) => ({ publisher, url: "", title: "" })),
  };
  const base = analyzeStory(story);
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
          key.alsoReportedBy?.length ? `Also reported by: ${key.alsoReportedBy.join(", ")}.` : "",
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
  if (response.stop_reason === "refusal" || !response.parsed_output) return null;
  const parsed = enrichmentSchema.safeParse(response.parsed_output);
  return parsed.success ? parsed.data : null;
}

/** Folds an enrichment into the rule-based analysis built from the current digest. */
export function applyEnrichment(base: Analysis, out: Enrichment | null): Analysis {
  if (!out) return base;
  // Guard against the model relabelling inferences as facts.
  const sanitize = (claims: { kind: string; text: string }[]) =>
    claims.map((c) => ({ ...c, kind: c.kind === "fact" ? "inference" : c.kind })) as Analysis["implication"];
  const ai = sanitize(out.implication);
  // Keep the rule-based region claim second: pages rely on it, and it is the one
  // statement about which supplier regions are implicated.
  const implication = [ai[0], ...(base.implication[1] ? [base.implication[1]] : []), ...ai.slice(1, 3)];
  return {
    ...base,
    generatedBy: "ai",
    implication,
    secondOrder: sanitize(out.secondOrder),
    options: out.options,
    meeting: out.meeting,
    confidence: { ...base.confidence, reason: `${base.confidence.reason} ${out.confidenceReason}` },
  };
}

/** Enrichment that never throws: a failure leaves the rule-based analysis. */
export async function enrichedAnalysis(story: Story, digest?: Digest): Promise<Analysis> {
  const base = analyzeStory(story, digest);
  if (!aiEnabled()) return base;
  try {
    return applyEnrichment(base, await enrichAnalysis(enrichKey(story)));
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
  const pending = enrichAnalysis(enrichKey(story));
  const timer = new Promise<"timeout">((resolve) => setTimeout(() => resolve("timeout"), budgetMs));
  try {
    const result = await Promise.race([pending, timer]);
    if (result !== "timeout") return applyEnrichment(base, result);
  } catch {
    return base;
  }
  after(() => pending.catch(() => undefined));
  return base;
}
