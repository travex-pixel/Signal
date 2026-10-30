import type { RegionId, TopicId } from "@/lib/news/types";

/**
 * SIGNAL distinguishes four kinds of statement everywhere it reasons:
 *  - fact: what a reliable source states happened.
 *  - inference: SIGNAL's reading of what the fact tends to mean, using a
 *    named business mechanism.
 *  - hypothesis: a plausible but unconfirmed downstream consequence.
 *  - unknown: something that would change the conclusion and is not known.
 */
export type ClaimKind = "fact" | "inference" | "hypothesis" | "unknown";

export interface Claim {
  kind: ClaimKind;
  text: string;
}

export interface MechanismNote {
  id: string;
  name: string;
  /** How the development could move trade, currency, energy, materials, demand, logistics or regulation. */
  chain: string;
  topic: TopicId;
}

export interface StrategicOption {
  action: string;
  tradeoff: string;
}

export interface MeetingContribution {
  observation: string;
  question: string;
  counterpoint: string;
  indicator: string;
}

export interface Confidence {
  level: "high" | "medium" | "low";
  reason: string;
  /** Other outlets that reported the same event. Optional so older saved days still parse. */
  corroboratedBy?: string[];
  /** True when the feed carried only a headline. */
  headlineOnly?: boolean;
}

export interface Principle {
  title: string;
  text: string;
  /** Slug of the related lesson in /learn, when one exists. */
  lessonSlug?: string;
}

export interface Analysis {
  storyId: string;
  generatedBy: "rules" | "ai";
  /** What happened, when and where. */
  event: Claim[];
  evidence: {
    establishes: string[];
    doesNotEstablish: string[];
    /** Which statements in this analysis are SIGNAL's interpretation rather than the source's. */
    interpretationNote: string;
  };
  mechanisms: MechanismNote[];
  implication: Claim[];
  secondOrder: Claim[];
  options: StrategicOption[];
  meeting: MeetingContribution;
  confidence: Confidence;
  principle: Principle;
  /** The one place the company name is used: a labelled business-relevance note. */
  businessRelevance: string;
  regionsImplicated: RegionId[];
}
