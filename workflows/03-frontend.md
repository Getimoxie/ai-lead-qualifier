# Workflow 03: Frontend — Lead Form + Vercel Deploy

## Goal
Build a Next.js form that collects lead data, calls a local API route, triggers the Trigger.dev task, and displays the qualification result.

---

## Pages & Components

### `frontend/app/page.tsx` — Main page

Renders the `<LeadForm>` component. On success, renders `<QualificationResult>`.

### `frontend/app/components/LeadForm.tsx`

A form with these fields:

| Field | Input type | Name |
|-------|-----------|------|
| Company name | text | `companyName` |
| Company URL | url | `companyUrl` |
| Industry / vertical | text | `industry` |
| Headcount | select or text | `headcount` |
| Notes | textarea | `notes` |

On submit → POST to `/api/analyze` → show loading state → render result.

### `frontend/app/components/QualificationResult.tsx`

Displays:
- Score badge (1–10)
- Recommendation chip (`pursue` / `nurture` / `pass`) with color coding
- Reasoning paragraph
- Strengths list (green)
- Concerns list (red/orange)

---

## API Route

Create `frontend/app/api/analyze/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { runs } from "@trigger.dev/sdk/v3";

export async function POST(req: NextRequest) {
  const payload = await req.json();

  // Trigger the task
  const run = await runs.trigger("qualify-lead", payload, {
    accessToken: process.env.TRIGGER_SECRET_KEY!,
  });

  // Wait for completion (times out after 60s by default)
  const result = await runs.poll(run.id, {
    accessToken: process.env.TRIGGER_SECRET_KEY!,
    pollIntervalMs: 1000,
  });

  if (result.status !== "COMPLETED") {
    return NextResponse.json({ error: "Task failed", details: result.status }, { status: 500 });
  }

  return NextResponse.json(result.output);
}
```

---

## Styling Notes

- Use Tailwind for layout
- Recommendation color coding:
  - `pursue` → green
  - `nurture` → yellow
  - `pass` → red
- Show a spinner while waiting for the API response

---

## Deploy to Vercel

### One-time setup

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set **Root Directory** to `frontend`
4. Add environment variables:
   - `TRIGGER_SECRET_KEY` — your Trigger.dev secret key

### Subsequent deploys

Vercel auto-deploys on every push to `main`. No manual step needed.

### Deploy backend before going live

Before deploying frontend to production, deploy the backend:

```bash
bash tools/deploy-backend.sh
```

This ensures the `qualify-lead` task is live in Trigger.dev's production environment.

---

## Done when

- [ ] Form renders at `http://localhost:3000`
- [ ] Submitting the form triggers a Trigger.dev run and shows the result
- [ ] Result displays score, recommendation, reasoning, strengths, and concerns
- [ ] Frontend deployed to Vercel and working end-to-end with production Trigger.dev

---

## Next steps (optional enhancements)

- Save results to a database (Supabase, PlanetScale)
- Add history view of past qualifications
- Email notifications on high-score leads
