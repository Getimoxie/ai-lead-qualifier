# Workflow 02: Backend — AI Lead Qualifier Task

## Goal
Build the `qualify-lead` Trigger.dev task that receives lead data, calls Claude, and returns a structured qualification result.

---

## Task File

Create `backend/src/trigger/qualifyLead.ts`:

```typescript
import { task } from "@trigger.dev/sdk/v3";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export interface LeadPayload {
  companyName: string;
  companyUrl: string;
  industry: string;
  headcount: string;
  notes: string;
}

export interface QualificationResult {
  score: number;          // 1–10
  recommendation: "pursue" | "nurture" | "pass";
  reasoning: string;      // 2–4 sentence explanation
  strengths: string[];
  concerns: string[];
}

export const qualifyLead = task({
  id: "qualify-lead",
  run: async (payload: LeadPayload): Promise<QualificationResult> => {
    const prompt = buildPrompt(payload);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    return parseResult(text);
  },
});

function buildPrompt(lead: LeadPayload): string {
  return `You are a sales qualification expert. Analyze the following lead and return a JSON qualification report.

Lead information:
- Company: ${lead.companyName}
- Website: ${lead.companyUrl}
- Industry: ${lead.industry}
- Headcount: ${lead.headcount}
- Notes: ${lead.notes}

Return ONLY valid JSON matching this shape:
{
  "score": <number 1-10>,
  "recommendation": <"pursue" | "nurture" | "pass">,
  "reasoning": "<2-4 sentence explanation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "concerns": ["<concern 1>", "<concern 2>"]
}`;
}

function parseResult(text: string): QualificationResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Claude response");
  return JSON.parse(jsonMatch[0]) as QualificationResult;
}
```

---

## Trigger.dev Config

Ensure `backend/trigger.config.ts` references the task:

```typescript
import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "<your-project-ref>",
  runtime: "node",
  logLevel: "log",
  dirs: ["./src/trigger"],
});
```

---

## Test the task locally

1. Start the dev server: `bash tools/dev.sh`
2. In the Trigger.dev dashboard, open your project → Tasks → `qualify-lead`
3. Click "Test" and submit a sample payload:

```json
{
  "companyName": "Acme Corp",
  "companyUrl": "https://acme.com",
  "industry": "SaaS / B2B Software",
  "headcount": "50-200",
  "notes": "Reached out via LinkedIn, seems interested in automation tooling"
}
```

4. Confirm the run completes and returns a valid `QualificationResult`

---

## Done when

- [ ] `qualify-lead` task appears in Trigger.dev dashboard
- [ ] Test run returns valid JSON with score, recommendation, reasoning, strengths, concerns
- [ ] No unhandled errors in the run logs

---

## Next step

[03-frontend.md](03-frontend.md) — build the form and wire up the frontend
