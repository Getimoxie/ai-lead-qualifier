import { task, logger } from "@trigger.dev/sdk/v3";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface LeadPayload {
  companyName: string;
  companyUrl: string;
  industry: string;
  headcount: string;
  notes: string;
}

export interface QualificationResult {
  score: number;
  recommendation: "pursue" | "nurture" | "pass";
  reasoning: string;
  strengths: string[];
  concerns: string[];
}

export const qualifyLead = task({
  id: "qualify-lead",
  retry: { maxAttempts: 2 },
  run: async (payload: LeadPayload): Promise<QualificationResult> => {
    logger.info("Qualifying lead", { company: payload.companyName });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: buildPrompt(payload),
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    logger.info("Claude response received", { characters: text.length });

    const result = parseResult(text);

    logger.info("Lead qualified", {
      company: payload.companyName,
      score: result.score,
      recommendation: result.recommendation,
    });

    return result;
  },
});

function buildPrompt(lead: LeadPayload): string {
  return `You are an expert B2B sales qualification analyst. Evaluate the following lead and return a structured qualification report.

Lead details:
- Company name: ${lead.companyName}
- Website: ${lead.companyUrl}
- Industry / vertical: ${lead.industry}
- Headcount / company size: ${lead.headcount}
- Additional notes: ${lead.notes}

Scoring criteria:
- 8–10: Strong fit, clear pain point, decision-maker signals → pursue immediately
- 5–7: Potential fit but needs more discovery → nurture
- 1–4: Poor fit, low budget signals, or wrong profile → pass

Return ONLY a valid JSON object — no markdown, no explanation outside the JSON:

{
  "score": <integer 1–10>,
  "recommendation": <"pursue" | "nurture" | "pass">,
  "reasoning": "<2–4 sentences explaining the score and recommendation>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "concerns": ["<concern 1>", "<concern 2>"]
}`;
}

function parseResult(text: string): QualificationResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Could not find JSON in Claude response: ${text}`);
  }
  const parsed = JSON.parse(jsonMatch[0]) as QualificationResult;

  // Basic validation
  if (
    typeof parsed.score !== "number" ||
    !["pursue", "nurture", "pass"].includes(parsed.recommendation)
  ) {
    throw new Error(`Invalid qualification result shape: ${jsonMatch[0]}`);
  }

  return parsed;
}
