# API Reference

> Complete reference for all server actions, API routes, webhooks, and Inngest functions. Every backend operation in Verto AI is documented here.

---

## Table of Contents

- [Server Actions Overview](#server-actions-overview)
- [Authentication & Access Control](#authentication--access-control)
- [Project Actions](#project-actions)
- [Generation Actions](#generation-actions)
- [Generation Run Tracking](#generation-run-tracking)
- [Share & Publish Actions](#share--publish-actions)
- [Subscription Actions](#subscription-actions)
- [Payment Actions](#payment-actions)
- [Unified Project Actions](#unified-project-actions)
- [API Routes](#api-routes)
- [Inngest Functions](#inngest-functions)
- [Middleware](#middleware)

---

## Server Actions Overview

All backend operations use **Next.js Server Actions** (`"use server"`). There are no traditional REST API controllers — Server Actions are called directly from React components and hooks.

| File | Domain | Action Count |
|------|--------|-------------|
| `src/actions/user.ts` | User identity | 1 |
| `src/actions/project-access.ts` | Authorization | 2 |
| `src/actions/projects.ts` | Project CRUD | 9 |
| `src/actions/generatePresentation.ts` | AI generation | 1 |
| `src/actions/presentation-generation.ts` | Run tracking | 7 |
| `src/actions/project-share.ts` | Sharing | 4 |
| `src/actions/subscription.ts` | Subscriptions | 5 |
| `src/actions/payment.ts` | Checkout | 1 |
| `src/actions/unified-projects.ts` | Cross-type queries | 2 |
| `src/actions/genai.ts` | Legacy generation | — |
| `src/actions/genai-pre.ts` | Legacy generation | — |

---

## Authentication & Access Control

### `onAuthenticateUser()`

**File**: `src/actions/user.ts`

Authenticates the current user via Clerk and ensures they have a database record. Auto-creates the user on first authentication.

```typescript
async function onAuthenticateUser(): Promise<{
  status: 200 | 201 | 400 | 403 | 500;
  user?: User;
}>
```

| Status | Meaning |
|--------|---------|
| `200` | Existing user found |
| `201` | New user created |
| `403` | Not authenticated (no Clerk session) |
| `500` | Server error |

**Behavior**:
1. Calls `currentUser()` from Clerk
2. Looks up user by `clerkId` in database
3. If not found, auto-creates with Clerk profile data (name, email, image)
4. Returns the database `User` record

---

### `getAuthenticatedAppUser()`

**File**: `src/actions/project-access.ts`

Convenience wrapper around `onAuthenticateUser()` with consistent error shape.

```typescript
async function getAuthenticatedAppUser(): Promise<
  | { status: 200; user: User }
  | { status: 403; error: string }
>
```

---

### `getOwnedProject(projectId, options?)`

**File**: `src/actions/project-access.ts`

**The centralized ownership enforcement helper.** Used by almost every project-mutating action.

```typescript
async function getOwnedProject(
  projectId: string,
  options?: { includeDeleted?: boolean }
): Promise<
  | { status: 200; user: User; project: Project }
  | { status: 400; error: string }   // Missing projectId
  | { status: 403; error: string }   // Not authenticated
  | { status: 404; error: string }   // Not found or not owned
>
```

**Behavior**:
1. Validates `projectId` is provided
2. Authenticates user via `getAuthenticatedAppUser()`
3. Queries project with `WHERE id = projectId AND userId = user.id`
4. Optionally includes soft-deleted projects (`includeDeleted: true`)
5. Returns 404 if project doesn't exist **or** belongs to another user (no information leakage)

**Security note**: By checking ownership in the `WHERE` clause, this prevents enumeration attacks — a user cannot distinguish "project doesn't exist" from "project belongs to someone else."

---

## Project Actions

**File**: `src/actions/projects.ts`

All project actions authenticate the user and enforce ownership.

### `getAllProjects()`

Returns all non-deleted projects owned by the authenticated user.

```typescript
async function getAllProjects(): Promise<{
  status: 200 | 403 | 404 | 500;
  data?: Project[];
  error?: string;
}>
```

| Status | Meaning |
|--------|---------|
| `200` | Projects returned |
| `403` | Not authenticated |
| `404` | No projects found |
| `500` | Server error |

**Query**: `WHERE userId = user.id AND isDeleted = false ORDER BY updatedAt DESC`

---

### `getRecentProjects()`

Returns the 5 most recently updated projects for the dashboard.

```typescript
async function getRecentProjects(): Promise<{
  status: 200 | 403 | 404 | 500;
  data?: Project[];
  error?: string;
}>
```

Same as `getAllProjects()` but with `LIMIT 5`.

---

### `getProjectById(presentationId)`

Returns a single project owned by the authenticated user.

```typescript
async function getProjectById(presentationId: string): Promise<{
  status: 200 | 400 | 403 | 404 | 500;
  data?: Project;
  error?: string;
}>
```

**Uses**: `getOwnedProject()` for ownership enforcement.

---

### `createProject(title, outlines)`

Creates a new presentation project.

```typescript
async function createProject(
  title: string,
  outlines: OutlineCard[]
): Promise<{
  status: 200 | 400 | 403 | 500;
  data?: Project;
  error?: string;
}>
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | `string` | Yes | Presentation title |
| `outlines` | `OutlineCard[]` | Yes | Array of `{ title, id, order }` |

**Validation**: Title and outlines must be non-empty.

---

### `updateSlides(projectId, slides)`

Saves the current slide JSON to the project.

```typescript
async function updateSlides(
  projectId: string,
  slides: JsonValue
): Promise<{
  status: 200 | 400 | 403 | 404 | 500;
  data?: Project;
  error?: string;
}>
```

**Uses**: `getOwnedProject()` for ownership enforcement.

---

### `updateTheme(projectId, theme)`

Updates the project's theme name.

```typescript
async function updateTheme(
  projectId: string,
  theme: string
): Promise<{
  status: 200 | 400 | 403 | 404 | 500;
  data?: Project;
  error?: string;
}>
```

**Uses**: `getOwnedProject()` for ownership enforcement.

---

### `deleteProject(projectId)`

Soft-deletes a project (sets `isDeleted = true`).

```typescript
async function deleteProject(projectId: string): Promise<{
  status: 200 | 400 | 403 | 404 | 500;
  data?: Project;
  error?: string;
}>
```

**Uses**: `getOwnedProject({ includeDeleted: true })` — can delete already-soft-deleted projects.

---

### `recoverProject(projectId)`

Recovers a soft-deleted project (sets `isDeleted = false`).

```typescript
async function recoverProject(projectId: string): Promise<{
  status: 200 | 400 | 403 | 404 | 500;
  data?: Project;
  error?: string;
}>
```

**Uses**: `getOwnedProject({ includeDeleted: true })`.

---

### `deleteAllProjects(projectIds)`

**Permanently deletes** multiple projects (hard delete).

```typescript
async function deleteAllProjects(projectIds: string[]): Promise<{
  status: 200 | 400 | 403 | 404 | 500;
  message?: string;
  error?: string;
}>
```

**Security**: Only deletes projects where `userId` matches the authenticated user. Silently skips IDs belonging to other users.

---

### `getDeletedProjects()`

Returns all soft-deleted projects for the trash view.

```typescript
async function getDeletedProjects(): Promise<{
  status: 200 | 403 | 500;
  data?: Project[];
  message?: string;
  error?: string;
}>
```

**Query**: `WHERE userId = user.id AND isDeleted = true`

---

## Generation Actions

### `generatePresentationAction(topic, ...)`

**File**: `src/actions/generatePresentation.ts`

The main entry point for AI presentation generation. Wraps the V2 agentic workflow with authentication and input validation.

```typescript
async function generatePresentationAction(
  topic: string,
  additionalContext?: string,
  themePreference?: string,       // Default: "Default"
  providedOutlines?: string[],
  generationRunId?: string
): Promise<{
  success: boolean;
  projectId?: string | null;
  slides?: Slide[];
  outlines?: string[] | null;
  slideCount?: number;
  progress?: number;
  error?: string;
}>
```

| Parameter | Type | Required | Validation |
|-----------|------|----------|-----------|
| `topic` | `string` | Yes | Non-empty, max 500 chars |
| `additionalContext` | `string?` | No | No validation |
| `themePreference` | `string` | No | Default: `"Default"` |
| `providedOutlines` | `string[]?` | No | Max 30 items, trimmed |
| `generationRunId` | `string?` | No | Links to PresentationGenerationRun |

**Auth**: Uses `auth()` from `@clerk/nextjs/server` to get the Clerk `userId`.

**Delegates to**: `generateAdvancedPresentation()` in `src/agentic-workflow-v2/actions/advanced-genai-graph.ts`.

**Exported type**:
```typescript
type GeneratePresentationResult = Awaited<ReturnType<typeof generatePresentationAction>>;
```

---

## Generation Run Tracking

**File**: `src/actions/presentation-generation.ts`

These actions manage the lifecycle of a `PresentationGenerationRun` record, providing real-time progress tracking.

### `createPresentationGenerationRun(topic)`

Creates a new generation run in `PENDING` status.

```typescript
async function createPresentationGenerationRun(topic: string): Promise<{
  status: 200 | 403 | 500;
  data?: PresentationGenerationRun;
  error?: string;
}>
```

Initializes the `steps` JSON with all 8 steps in `pending` status.

---

### `getPresentationGenerationRun(runId)`

Retrieves the current state of a generation run. **This is the primary polling endpoint for the client.**

```typescript
async function getPresentationGenerationRun(runId: string): Promise<{
  status: 200 | 400 | 403 | 404 | 500;
  data?: PresentationGenerationRun & { steps: GenerationStepSnapshot[] };
  error?: string;
}>
```

**Security**: Checks `userId` match — users can only poll their own runs.

**Step normalization**: Always returns a complete set of 8 steps, merging saved state with defaults for any missing steps. This ensures backward compatibility if steps are added/removed.

---

### `startPresentationGenerationRun(runId)`

Transitions a run from `PENDING` to `RUNNING`. Called at the start of graph execution.

```typescript
async function startPresentationGenerationRun(runId: string): Promise<void>
```

Resets `progress`, `error`, `currentStepId`, and reinitializes `steps` to all-pending.

---

### `markPresentationGenerationStepRunning(runId, stepId, details?)`

Marks a specific agent step as `running`. Called by the `wrapNode()` function when an agent starts.

```typescript
async function markPresentationGenerationStepRunning(
  runId: string,
  stepId: string,
  details?: string
): Promise<void>
```

Updates `currentStepId`, `currentStepName`, and bumps `progress` to `step.progress - 5`.

---

### `markPresentationGenerationStepCompleted(runId, stepId, options?)`

Marks a specific agent step as `completed`. Called by `wrapNode()` when an agent finishes.

```typescript
async function markPresentationGenerationStepCompleted(
  runId: string,
  stepId: string,
  options?: { details?: string; projectId?: string | null }
): Promise<void>
```

Updates step status, bumps `progress` to the step's target percentage, and optionally sets `projectId`.

---

### `failPresentationGenerationRun(runId, error, stepId?)`

Marks the entire run as `FAILED` with an error message. Called when any agent throws an unrecoverable error.

```typescript
async function failPresentationGenerationRun(
  runId: string,
  error: string,
  stepId?: string
): Promise<void>
```

Sets the run status to `FAILED`, records the error, and marks the failing step as `error` status. Sets `completedAt`.

---

### `completePresentationGenerationRun(runId, options?)`

Marks the run as `COMPLETED`. Called after all agents finish successfully.

```typescript
async function completePresentationGenerationRun(
  runId: string,
  options?: { projectId?: string | null }
): Promise<void>
```

Sets `progress` to 100, `status` to `COMPLETED`, and `completedAt` to now.

---

## Share & Publish Actions

**File**: `src/actions/project-share.ts`

### `getProjectShareState(projectId)`

Returns the current publish state of a project (owner only).

```typescript
async function getProjectShareState(projectId: string): Promise<{
  status: 200 | 400 | 403 | 404 | 500;
  data?: { id: string; isPublished: boolean; publishedAt: DateTime | null };
  error?: string;
}>
```

**Uses**: `getOwnedProject()` for ownership enforcement.

---

### `publishProject(projectId)`

Makes a project publicly accessible via the share link.

```typescript
async function publishProject(projectId: string): Promise<{
  status: 200 | 400 | 403 | 404 | 500;
  data?: Project;
  error?: string;
}>
```

Sets `isPublished = true`. Preserves the original `publishedAt` if already set (re-publishing doesn't reset the date).

---

### `unpublishProject(projectId)`

Removes public access to a project.

```typescript
async function unpublishProject(projectId: string): Promise<{
  status: 200 | 400 | 403 | 404 | 500;
  data?: Project;
  error?: string;
}>
```

Sets `isPublished = false`. Does **not** clear `publishedAt`.

---

### `getSharedProjectById(projectId)`

**Public action — no authentication required.** Returns a published project for the share route.

```typescript
async function getSharedProjectById(projectId: string): Promise<{
  status: 200 | 400 | 404 | 500;
  data?: Project;
  error?: string;
}>
```

**Query**: `WHERE id = projectId AND isDeleted = false AND isPublished = true AND projectType = 'PRESENTATION'`

**Security**: Only returns published, non-deleted presentations. No ownership check needed since the owner explicitly published it.

---

## Subscription Actions

**File**: `src/actions/subscription.ts`

### `getSubscription()`

Returns the authenticated user's subscription details.

```typescript
async function getSubscription(): Promise<{
  status: 200 | 403 | 500;
  data?: Subscription | null;
  error?: string;
}>
```

---

### `getCustomerPortalUrl()`

Gets the Lemon Squeezy customer portal URL for self-service management.

```typescript
async function getCustomerPortalUrl(): Promise<{
  status: 200 | 403 | 404 | 500;
  url?: string;
  error?: string;
}>
```

Calls Lemon Squeezy API: `GET /customers/{customerId}` → extracts `urls.customer_portal`.

---

### `cancelSubscription()`

Cancels the user's subscription at end of billing period.

```typescript
async function cancelSubscription(): Promise<{
  status: 200 | 403 | 404 | 500;
  message?: string;
  error?: string;
}>
```

Calls Lemon Squeezy API: `DELETE /subscriptions/{lemonSqueezyId}`. Updates local status to `CANCELLED`. Webhook will also fire to confirm.

---

### `syncSubscriptionStatus()`

Syncs the local subscription status with Lemon Squeezy. Called on app load.

```typescript
async function syncSubscriptionStatus(): Promise<{
  status: 200 | 403 | 500;
  data?: Subscription | null;
  error?: string;
}>
```

1. Fetches latest status from LS API
2. Maps LS status string → `SubscriptionStatus` enum
3. Updates dates (`renewsAt`, `endsAt`, `trialEndsAt`)
4. Updates `user.subscription` boolean flag
5. Falls back to local data if LS API fails

---

### `hasActiveSubscription()`

Feature-gating check. Returns whether the user has an active subscription.

```typescript
async function hasActiveSubscription(): Promise<{
  status: 200 | 403 | 500;
  hasAccess: boolean;
  subscription?: Subscription;
  error?: string;
}>
```

Active statuses: `ACTIVE`, `ON_TRIAL`.

---

## Payment Actions

**File**: `src/actions/payment.ts`

### `buySubscription(buyUserId)`

Creates a Lemon Squeezy checkout session and returns the checkout URL.

```typescript
async function buySubscription(buyUserId: string): Promise<{
  status: 200 | 500;
  url?: string;
  message?: string;
  error?: string;
}>
```

**Environment variables required**:
- `LEMON_SQUEEZY_API_KEY`
- `LEMON_SQUEEZY_STORE_ID`
- `LEMON_SQUEEZY_VARIANT_ID`
- `NEXT_PUBLIC_HOST_URL` (for redirect URL)

**Checkout payload**:
```json
{
  "type": "checkouts",
  "attributes": {
    "checkout_data": { "custom": { "buyerUserId": "<userId>" } },
    "redirect_url": "{HOST_URL}/dashboard"
  },
  "relationships": {
    "store": { "data": { "type": "stores", "id": "<storeId>" } },
    "variant": { "data": { "type": "variants", "id": "<variantId>" } }
  }
}
```

---

## Unified Project Actions

**File**: `src/actions/unified-projects.ts`

Cross-type project queries that combine both Presentation and Mobile Design projects.

### `getUnifiedProjects(filter?)`

Returns all projects across types, sorted by `updatedAt`.

```typescript
async function getUnifiedProjects(
  filter?: 'all' | 'presentation' | 'mobile'
): Promise<{
  status: 200 | 403 | 500;
  data?: DashboardProject[];
  error?: string;
}>
```

**Output type**:
```typescript
interface DashboardProject {
  id: string;
  title: string;
  type: "PRESENTATION" | "MOBILE_DESIGN";
  thumbnail?: string | null;
  createdAt: Date;
  updatedAt: Date;
  slides?: any;
  frames?: any;
  theme?: string | null;
  isSellable?: boolean;
}
```

---

### `searchProjects(query, filter?, limit?)`

Full-text search across project titles/names.

```typescript
async function searchProjects(
  query: string,
  filter?: 'all' | 'presentation' | 'mobile',
  limit?: number     // Default: 10
): Promise<{
  status: 200 | 403 | 500;
  data?: DashboardProject[];
  error?: string;
}>
```

**Minimum query length**: 2 characters. Uses case-insensitive `contains` filter.

---

## API Routes

### `GET /api/generation/stream`

**File**: `src/app/api/generation/stream/route.ts`

Server-Sent Events endpoint for real-time generation progress.

| Parameter | Location | Required | Description |
|-----------|----------|----------|-------------|
| `runId` | Query string | Yes | Generation run ID |

**Response**: SSE stream with `StreamEvent` objects.

**Event format**:
```
data: {"type":"agent_start","agentId":"outlineGenerator","agentName":"Structure","timestamp":1234567890}

data: {"type":"progress","stepId":"outlineGenerator","progress":20,"timestamp":1234567891}

data: {"type":"agent_complete","agentId":"outlineGenerator","output":{...},"timestamp":1234567892}

data: {"type":"complete","projectId":"clxyz123","timestamp":1234567900}
```

**Connection lifecycle**:
1. Client opens `EventSource` connection
2. Server subscribes to `streamingEmitter` for the given `runId`
3. Events are streamed as they occur
4. On `complete` or `error`, the connection closes
5. Reconnection replays event history

---

### `POST /api/inngest`

**File**: `src/app/api/inngest/route.ts`

Inngest webhook receiver for the main Inngest client. Handles event routing for background functions.

---

### `POST /api/mobile-design/inngest`

**File**: `src/app/api/mobile-design/inngest/route.ts`

Dedicated Inngest webhook receiver for mobile design generation functions.

---

### `POST /api/webhook/lemon-squeezy`

**File**: `src/app/api/webhook/lemon-squeezy/route.ts`

Lemon Squeezy subscription webhook handler.

**Expected events**:
- `subscription_created` — New subscription
- `subscription_updated` — Status change, renewal, etc.
- `subscription_cancelled` — Cancellation
- `subscription_expired` — Expiration

**Security**: Verifies webhook signature using `LEMON_SQUEEZY_WEBHOOK_SECRET`.

**Processing**:
1. Verify signature
2. Parse event type and subscription data
3. Upsert `Subscription` record
4. Update `User.subscription` boolean flag

---

## Inngest Functions

### `generateScreens`

**File**: `src/mobile-design/inngest/functions/generateScreens.ts`

Generates multiple mobile UI screens for a project.

| Property | Value |
|----------|-------|
| **Trigger event** | `mobile.generate` (or similar) |
| **Input** | Project ID, app description, screen count, theme |
| **Processing** | Calls Gemini AI to generate HTML for each screen |
| **Output** | Creates `MobileFrame` records in database |

---

### `regenerateFrame`

**File**: `src/mobile-design/inngest/functions/regenerateFrame.ts`

Regenerates a single frame within an existing mobile design project.

| Property | Value |
|----------|-------|
| **Trigger event** | `mobile.regenerateFrame` (or similar) |
| **Input** | Frame ID, regeneration instructions |
| **Processing** | Calls Gemini AI with existing frame context |
| **Output** | Updates `MobileFrame.htmlContent` |

---

## Middleware

**File**: `src/middleware.ts`

### Route Protection Matrix

Uses `clerkMiddleware()` with a public route matcher.

**Public routes** (no authentication required):

| Route Pattern | Purpose |
|---------------|---------|
| `/sign-in(.*)` | Clerk sign-in pages |
| `/sign-up(.*)` | Clerk sign-up pages |
| `/api/webhook(.*)` | Lemon Squeezy webhooks |
| `/api/inngest(.*)` | Inngest webhooks |
| `/api/mobile-design/inngest(.*)` | Mobile design Inngest webhooks |
| `/` | Landing page |

**Protected routes** (authentication required):
- Everything under `/(protected)/` — dashboard, editor, settings, etc.
- `/api/generation/stream` — SSE endpoint (implicitly via the server action that starts generation)

**Matcher exclusions**: Static files (`.html`, `.css`, `.js`, images, fonts, etc.) and Next.js internals (`/_next/`) are excluded from middleware processing.

```typescript
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

---

*Next: [06-frontend-architecture.md](06-frontend-architecture.md) — components, state, routing, and rendering.*
