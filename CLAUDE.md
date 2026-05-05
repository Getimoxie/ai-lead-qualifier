# AI Lead Qualifier

An AI-powered workflow that qualifies sales leads. A user fills out a form about a lead, clicks Analyze, and gets back a qualification result powered by Claude running on Trigger.dev.

---

## WAT Framework

This project is organized around the **WAT** framework:

| Letter | Stands for | What it means |
|--------|------------|---------------|
| **W** | Workflows | Step-by-step instructions in `workflows/` — read these before writing code |
| **A** | Agent | Claude Code (you) — the executor |
| **T** | Tools | Shell scripts in `tools/` — use these instead of ad-hoc commands |

**Rule:** Before starting any feature, read the relevant `workflows/` file. Before running any deploy or dev command, check if a script in `tools/` already does it.

---

## Project Structure

```
ai-lead-qualifier/
├── CLAUDE.md               # You are here
├── workflows/              # W: instructions per phase
│   ├── 01-setup.md         # Initial project setup
│   ├── 02-backend.md       # Trigger.dev AI task
│   └── 03-frontend.md      # Next.js form + Vercel deploy
├── tools/                  # T: scripts to run
│   ├── deploy-backend.sh   # Deploy Trigger.dev task
│   └── dev.sh              # Start both services locally
├── backend/                # Trigger.dev project
│   ├── trigger.config.ts
│   └── src/trigger/        # Task files live here
└── frontend/               # Next.js app (deployed to Vercel)
    ├── app/
    └── ...
```

---

## Architecture

```
User (browser)
    │  fills form, clicks Analyze
    ▼
Next.js frontend (Vercel)
    │  POST /api/analyze  →  calls Trigger.dev API to trigger a run
    │  polls run status until complete
    ▼
Trigger.dev (backend)
    │  runs `qualify-lead` task
    │  calls Claude API with lead data
    ▼
Returns qualification result
    │
    ▼
Frontend displays result to user
```

---

## Lead Form Fields

The form collects the following about a lead:

- **Company name** — the name of the company
- **Company URL** — their website
- **Industry / vertical** — what sector they operate in
- **Company size / headcount** — approximate number of employees
- **Notes** — free-text observations about the lead

---

## Environment Variables

### Backend (`backend/.env`)

```
ANTHROPIC_API_KEY=        # Claude API key
TRIGGER_SECRET_KEY=       # From Trigger.dev dashboard
```

### Frontend (`frontend/.env.local`)

```
TRIGGER_SECRET_KEY=       # Same Trigger.dev secret key (used server-side in API route)
NEXT_PUBLIC_APP_URL=      # Frontend URL (e.g. http://localhost:3000 locally)
```

On Vercel, set these in the project's Environment Variables settings.

---

## Communication Contract

The frontend triggers a Trigger.dev run via the Trigger.dev SDK (server-side, in a Next.js API route). It then polls the run until complete and returns the result to the client.

```
POST /api/analyze
  body: { companyName, companyUrl, industry, headcount, notes }
  response: { score, reasoning, recommendation }
```

The API route uses `@trigger.dev/sdk` to:
1. `runs.trigger("qualify-lead", payload)` — starts the task
2. `runs.poll(runId)` — waits for completion
3. Returns the task output

---

## Key Commands

Always prefer scripts in `tools/` over raw commands. See `tools/README` comments inside each script.

| Task | Script |
|------|--------|
| Start dev environment | `bash tools/dev.sh` |
| Deploy backend | `bash tools/deploy-backend.sh` |

---

## Workflow Order

Follow these in sequence:

1. [workflows/01-setup.md](workflows/01-setup.md) — initialize the repo, install deps, configure Trigger.dev
2. [workflows/02-backend.md](workflows/02-backend.md) — build the `qualify-lead` Trigger.dev task
3. [workflows/03-frontend.md](workflows/03-frontend.md) — build the Next.js form and wire up Vercel
