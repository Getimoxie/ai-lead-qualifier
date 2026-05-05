# Workflow 01: Project Setup

## Goal
Initialize the monorepo, install dependencies, and configure Trigger.dev so the project is ready for development.

---

## Steps

### 1. Initialize the repo

```bash
cd ai-lead-qualifier
git init
```

Create a root `.gitignore`:

```
node_modules/
.env
.env.local
.trigger/
.next/
```

---

### 2. Set up the backend (Trigger.dev)

```bash
mkdir backend && cd backend
npx trigger.dev@latest init
```

When prompted:
- Project name: `ai-lead-qualifier`
- Runtime: Node.js
- Choose to create a new Trigger.dev project (or link existing)

This creates `trigger.config.ts` and `src/trigger/` inside `backend/`.

Install additional deps:

```bash
npm install @anthropic-ai/sdk
```

Create `backend/.env`:

```
ANTHROPIC_API_KEY=your_key_here
TRIGGER_SECRET_KEY=your_trigger_secret_here
```

---

### 3. Set up the frontend (Next.js)

```bash
cd ..
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir no --import-alias "@/*"
cd frontend
npm install @trigger.dev/sdk
```

Create `frontend/.env.local`:

```
TRIGGER_SECRET_KEY=your_trigger_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 4. Verify setup

From the root, run:

```bash
bash tools/dev.sh
```

- Trigger.dev dev server should connect and show your project
- Next.js should start at http://localhost:3000

---

## Done when

- [ ] `backend/trigger.config.ts` exists
- [ ] `frontend/` bootstrapped with Next.js
- [ ] Both `.env` files created (values filled in)
- [ ] `bash tools/dev.sh` starts both services without errors

---

## Next step

[02-backend.md](02-backend.md) — build the AI qualification task
