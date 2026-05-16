# Development Guide

> Everything you need to set up, develop, debug, and maintain Verto AI locally. This guide covers environment setup, daily workflows, debugging techniques, code conventions, and common tasks.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Daily Development Workflow](#daily-development-workflow)
- [Database Operations](#database-operations)
- [AI Pipeline Development](#ai-pipeline-development)
- [Inngest Development](#inngest-development)
- [Common Tasks](#common-tasks)
- [Debugging Guide](#debugging-guide)
- [Code Conventions](#code-conventions)
- [Environment Variables Reference](#environment-variables-reference)

---

## Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | 18+ | Runtime |
| **bun** | Latest | Package manager (`npm install -g bun`) |
| **PostgreSQL** | 14+ | Database (local or hosted) |
| **Git** | Latest | Version control |

### External Service Accounts

| Service | Required? | Purpose | Signup |
|---------|-----------|---------|--------|
| **Clerk** | ✅ Yes | Authentication | [clerk.com](https://clerk.com) |
| **Google AI** | ✅ Yes | Gemini LLM for generation | [ai.google.dev](https://ai.google.dev) |
| **Unsplash** | ⚠️ Optional | Image search (falls back to placeholders) | [unsplash.com/developers](https://unsplash.com/developers) |
| **Lemon Squeezy** | ⚠️ Optional | Subscriptions (app works without it) | [lemonsqueezy.com](https://lemonsqueezy.com) |
| **Inngest** | ⚠️ Optional | Mobile design generation | [inngest.com](https://inngest.com) |

---

## Environment Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd verto-ai
bun install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables Reference](#environment-variables-reference) for all variables).

**Minimum viable `.env`** (for basic development):
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/verto-ai"

# Clerk Auth (from clerk.com dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Google AI (from ai.google.dev)
GOOGLE_GENERATIVE_AI_API_KEY="AIza..."

# Host URL
NEXT_PUBLIC_HOST_URL="http://localhost:3000"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create database and apply migrations
npx prisma migrate dev

# (Optional) Seed with test data
# npx prisma db seed

# (Optional) Open Prisma Studio GUI
npx prisma studio
```

### 4. Start Development Server

```bash
bun run dev
# → http://localhost:3000
```

The `predev` script automatically runs `prisma generate` before starting the dev server.

### 5. (Optional) Start Inngest Dev Server

Only needed if working on mobile design generation:

```bash
bun run inngest:dev
# → Inngest dashboard: http://localhost:8288
```

---

## Daily Development Workflow

### Starting the Day

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
bun install

# 3. Apply any new database migrations
npx prisma migrate dev

# 4. Start dev server (auto-generates Prisma client)
bun run dev
```

### Development Cycle

```mermaid
graph LR
    Code[Write Code] --> Save[Save File]
    Save --> HMR[Turbopack HMR]
    HMR --> Browser[Check Browser]
    Browser --> Code
    
    Code --> Test[Test Locally]
    Test --> Commit[Git Commit]
    
    style HMR fill:#10b981,color:#fff
```

**Turbopack HMR**: File changes are reflected instantly in the browser — no manual refresh needed for most changes. Server Actions require a fresh call to see changes.

### Before Committing

```bash
# 1. Run type checker
npx tsc --noEmit

# 2. Run linter
bun run lint

# 3. Test a production build (catches SSR issues)
bun run build
```

---

## Database Operations

### Schema Changes

```bash
# 1. Edit prisma/schema.prisma
# 2. Create and apply migration
npx prisma migrate dev --name describe_your_change

# 3. Regenerate client (automatic with migrate dev, but just in case)
npx prisma generate
```

### Inspecting Data

```bash
# Open Prisma Studio (browser-based GUI)
npx prisma studio
# → http://localhost:5555
```

### Reset Database (Destructive)

```bash
# Drop all tables and re-apply migrations
npx prisma migrate reset
```

### Common Prisma Commands

| Command | Purpose |
|---------|---------|
| `npx prisma generate` | Regenerate client after schema changes |
| `npx prisma migrate dev` | Create + apply migration |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma migrate reset` | Reset database (dev only) |
| `npx prisma studio` | Open GUI data browser |
| `npx prisma db push` | Push schema without migration (prototyping) |
| `npx prisma format` | Format schema file |

---

## AI Pipeline Development

### Testing the Generation Pipeline

1. Start the dev server (`bun run dev`)
2. Sign in with a Clerk account
3. Navigate to `/create` or the dashboard
4. Enter a topic and trigger generation
5. Monitor progress in the generation dialog

### Debugging Individual Agents

Each agent in `src/agentic-workflow-v2/agents/` can be tested by:

1. **Adding logging** — Each agent's `wrapNode()` wrapper already logs progress
2. **Checking the PresentationGenerationRun** — Open Prisma Studio and inspect the `steps` JSON to see which agent failed
3. **Inspecting LLM output** — Add `console.log` before Zod validation to see raw LLM responses

### Common AI Pipeline Issues

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Generation hangs | Gemini API rate limit | Check API key quotas, add retry logic |
| Invalid JSON from LLM | Temperature too high for structural agent | Lower temperature in `llm.ts` |
| Zod validation fails | LLM output doesn't match schema | Add `.passthrough()` or relax schema |
| Images not loading | Unsplash rate limit or missing API key | Check `UNSPLASH_ACCESS_KEY`, fallback images will be used |
| Progress stuck at X% | Agent crashed mid-execution | Check server logs for error, inspect run in DB |

### Modifying the Pipeline

To add a new agent:

1. Create agent file in `src/agentic-workflow-v2/agents/`
2. Add step definition in `src/agentic-workflow-v2/lib/progress.ts`
3. Add node + edge in `src/agentic-workflow-v2/actions/advanced-genai-graph.ts`
4. Add any new state fields to `src/agentic-workflow-v2/lib/state.ts`
5. Create Zod validator in `src/agentic-workflow-v2/lib/validators.ts`

---

## Inngest Development

### Setup

```bash
# Start Inngest dev server
bun run inngest:dev
# → Dashboard: http://localhost:8288
```

### Testing Functions

1. Open the Inngest dashboard at `http://localhost:8288`
2. Navigate to the Functions tab
3. Trigger a function manually by sending an event
4. Monitor execution in the Runs tab

### Key Files

| File | Purpose |
|------|---------|
| `src/mobile-design/inngest/client.ts` | Inngest client configuration |
| `src/mobile-design/inngest/functions/generateScreens.ts` | Screen generation function |
| `src/mobile-design/inngest/functions/regenerateFrame.ts` | Frame regeneration function |
| `src/app/api/mobile-design/inngest/route.ts` | API route for Inngest webhook |

---

## Common Tasks

### Adding a New Server Action

1. Create or edit a file in `src/actions/`
2. Add `"use server"` at the top
3. Authenticate the user:
   ```typescript
   const checkUser = await onAuthenticateUser();
   if (checkUser.status !== 200 || !checkUser.user) {
     return { status: 403, error: "Not authenticated" };
   }
   ```
4. For project mutations, use ownership enforcement:
   ```typescript
   const access = await getOwnedProject(projectId);
   if (access.status !== 200) return access;
   // access.project is now verified
   ```

### Adding a New Page

1. Create a directory under the appropriate route group:
   - Dashboard page: `src/app/(protected)/(pages)/(dashboardPages)/your-page/page.tsx`
   - Full-width page: `src/app/(protected)/your-page/page.tsx`
   - Public page: `src/app/your-page/page.tsx`
2. For public pages, add the route to the public matcher in `src/middleware.ts`

### Adding a New Zustand Store

1. Create file in `src/store/useYourStore.ts`
2. Define the interface with state + actions
3. Use `create<StoreType>()` with optional `persist` middleware
4. Export the store hook

```typescript
import { create } from 'zustand';

interface YourState {
  value: string;
  setValue: (value: string) => void;
}

export const useYourStore = create<YourState>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}));
```

### Adding a New UI Component (shadcn/ui)

```bash
# Use the shadcn CLI to add a component
npx shadcn@latest add <component-name>
# e.g., npx shadcn@latest add calendar
```

Components are installed to `src/components/ui/`.

### PDF Export

The export flow is client-side:
1. Render each slide in a hidden container at 1280×720
2. Capture each slide with `html2canvas`
3. Compile images into a PDF with `jsPDF`
4. Trigger browser download

---

## Debugging Guide

### Server-Side Debugging

| Technique | When to Use |
|-----------|-------------|
| **Server console logs** | Check terminal running `bun run dev` |
| **Prisma Studio** | Inspect database state (`npx prisma studio`) |
| **Generation Run table** | Check `PresentationGenerationRun.steps` JSON for failed agents |
| **Streaming events** | Monitor SSE events via browser DevTools → Network → EventSource |

### Client-Side Debugging

| Technique | When to Use |
|-----------|-------------|
| **React DevTools** | Inspect component tree, props, hooks |
| **Zustand DevTools** | Stores with `devtools` middleware appear in Redux DevTools |
| **localStorage** | Check persisted state under `slides-storage`, `creative-ai`, `prompt`, `scratch` |
| **Network tab** | Monitor server action calls and SSE streams |

### Common Debugging Scenarios

**"Slides not loading in editor"**
1. Check `useSlideStore.slides` in React DevTools
2. Verify `Project.slides` in Prisma Studio (is it valid JSON?)
3. Check server action response in Network tab
4. Clear localStorage: `localStorage.removeItem('slides-storage')`

**"Generation progress stuck"**
1. Open Prisma Studio → `PresentationGenerationRun` table
2. Find your run by `userId` + `createdAt`
3. Check `status` (RUNNING? FAILED?), `currentStepId`, `error`
4. Check `steps` JSON for the first step with `status: "error"`

**"LocalStorage quota exceeded"**
1. Clear old persisted stores: `localStorage.clear()`
2. Or selectively: `localStorage.removeItem('slides-storage')`
3. The `partialize` option in `useSlideStore` already excludes `past`/`future` stacks

**"Clerk auth not working"**
1. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `.env`
2. Check that Clerk domain matches your dev URL
3. Ensure `sign-in` and `sign-up` routes are in the public route matcher

---

## Code Conventions

### File Naming

| Pattern | Example | Used For |
|---------|---------|----------|
| `camelCase.ts` | `useSlideStore.tsx` | Hooks, stores, utilities |
| `PascalCase.tsx` | `MasterRecursiveComponent.tsx` | React components |
| `kebab-case.ts` | `project-access.ts` | Server actions |
| `camelCase.ts` | `imageProviders.ts` | Utility modules |

### Import Conventions

```typescript
// Path alias — always use @/ for src/ imports
import { useSlideStore } from '@/store/useSlideStore';
import { Slide } from '@/lib/types';
import prisma from '@/lib/prisma';
import { Project } from '@/generated/prisma';
```

### Server Actions

- Always start with `"use server"`
- Always authenticate with `onAuthenticateUser()` or `getAuthenticatedAppUser()`
- Use `getOwnedProject()` for any project mutation
- Return consistent shape: `{ status: number, data?: T, error?: string }`
- Use `as const` for status codes to enable narrowing

### React Components

- Use function declarations for page components
- Use arrow functions for small components
- Use `'use client'` directive only when client features are needed
- Prefer server components by default (App Router convention)

### TypeScript

- Strict mode enabled
- Prefer `interface` over `type` for object shapes
- Use Zod schemas for runtime validation of external data (LLM outputs, API responses)
- Import Prisma types from `@/generated/prisma`

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/verto-ai` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key | `pk_test_...` |
| `CLERK_SECRET_KEY` | Clerk secret key | `sk_test_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in route | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up route | `/sign-up` |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key | `AIza...` |
| `NEXT_PUBLIC_HOST_URL` | Application URL | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `UNSPLASH_ACCESS_KEY` | Unsplash API access key | Falls back to placeholder images |
| `UNSPLASH_RESULTS_PER_QUERY` | Images per search | `6` |
| `IMAGE_PROVIDER` | Image provider (`unsplash` or `fallback`) | `unsplash` |
| `LEMON_SQUEEZY_API_KEY` | LS API key | Payments disabled |
| `LEMON_SQUEEZY_STORE_ID` | LS store ID | — |
| `LEMON_SQUEEZY_VARIANT_ID` | LS variant ID | — |
| `LEMON_SQUEEZY_WEBHOOK_SECRET` | LS webhook secret | — |
| `INNGEST_EVENT_KEY` | Inngest event key | Mobile design disabled |
| `INNGEST_SIGNING_KEY` | Inngest signing key | — |

### Public vs Secret Variables

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser bundle
- All other variables are server-only and never sent to the client
- **Never** put API keys or secrets in `NEXT_PUBLIC_` variables

---

*Next: [08-deployment-guide.md](08-deployment-guide.md) — production deployment and infrastructure.*
