# Contributing Guide

> Guidelines for contributing to Verto AI — code style, commit conventions, pull request process, and development standards.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Documentation Standards](#documentation-standards)
- [Architecture Decision Records](#architecture-decision-records)

---

## Getting Started

1. **Read the documentation**: Start with the [README](../README.md) and [Architecture Overview](01-architecture-overview.md) to understand the system.
2. **Set up your environment**: Follow the [Development Guide](07-development-guide.md) for complete setup instructions.
3. **Understand the codebase**: Review the [Frontend Architecture](06-frontend-architecture.md) and [Agentic Workflow](03-agentic-workflow.md) docs.

---

## Development Setup

```bash
# Clone and install
git clone <repo-url> && cd verto-ai
bun install

# Environment
cp .env.example .env
# Fill in required values (see 07-development-guide.md)

# Database
npx prisma migrate dev
npx prisma generate

# Start development
bun run dev
```

See [07-development-guide.md](07-development-guide.md) for detailed setup instructions, including optional services (Inngest, Unsplash, Lemon Squeezy).

---

## Code Standards

### TypeScript

- **Strict mode** is enabled — all code must pass strict type checking
- Use `interface` for object shapes, `type` for unions/intersections
- Import Prisma types from `@/generated/prisma`
- Use `@/` path alias for all imports (never relative `../../`)

```typescript
// ✅ Good
import { Slide } from '@/lib/types';
import prisma from '@/lib/prisma';

// ❌ Bad
import { Slide } from '../../lib/types';
```

### React Components

- **Server Components by default** — only add `'use client'` when client features are needed
- Use function declarations for page components
- Keep components focused — extract sub-components when complexity grows

```typescript
// ✅ Page component
export default function DashboardPage() { ... }

// ✅ Client component (needs hooks/state)
'use client'
export function SlideEditor() { ... }
```

### Server Actions

Every server action must:

1. Start with `"use server"` directive
2. Authenticate the user via `onAuthenticateUser()` or `getAuthenticatedAppUser()`
3. Enforce project ownership via `getOwnedProject()` for any project mutation
4. Return a consistent shape: `{ status: number, data?: T, error?: string }`

```typescript
"use server";

export const myAction = async (projectId: string) => {
  const access = await getOwnedProject(projectId);
  if (access.status !== 200) return access;
  
  // ... action logic using access.project
  return { status: 200, data: result };
};
```

### Zustand Stores

- Use `create<StoreType>()` with typed interface
- Add `persist` middleware only for state that should survive page refresh
- Exclude derived/temporary state from persistence using `partialize`
- Every mutation that modifies slides must push to the undo stack

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase | `MasterRecursiveComponent.tsx` |
| Hooks | camelCase with `use` prefix | `useSlideStore.tsx` |
| Server Actions | camelCase or kebab-case | `project-access.ts` |
| Utility files | camelCase | `imageProviders.ts` |
| Types/Interfaces | PascalCase | `ContentItem`, `SlideState` |
| Constants | SCREAMING_SNAKE_CASE | `GENERATION_STEP_DEFINITIONS` |
| CSS classes | kebab-case | `slide-two-column` |

### Imports Order

```typescript
// 1. React/Next.js
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { create } from 'zustand';
import { z } from 'zod';

// 3. Internal modules (@ alias)
import { useSlideStore } from '@/store/useSlideStore';
import { Slide } from '@/lib/types';
import prisma from '@/lib/prisma';

// 4. Types (type-only imports)
import type { Project } from '@/generated/prisma';
```

---

## Git Workflow

### Branch Naming

```
feature/add-timeline-layout
fix/generation-timeout
refactor/slide-store-undo
docs/update-api-reference
chore/update-dependencies
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add timeline layout template
fix: handle empty outlines in content writer
refactor: extract ownership check into getOwnedProject
docs: add ADR for layout-first generation
chore: update LangGraph to 0.4.8
test: add unit tests for Zod validators
```

**Scope** (optional but recommended):

```
feat(agents): add image retry logic to imageFetcher
fix(editor): prevent undo stack overflow
refactor(store): split useSlideStore persistence config
docs(adr): document SSE streaming decision
```

### Branch Protection

- `main` — production branch, requires PR review
- Feature branches created from `main`
- Squash merges preferred for clean history

---

## Pull Request Process

### Before Opening a PR

```bash
# 1. Ensure code compiles
npx tsc --noEmit

# 2. Run linter
bun run lint

# 3. Test a production build
bun run build

# 4. Manual smoke test of affected features
```

### PR Template

```markdown
## What

Brief description of the change.

## Why

Context and motivation.

## How

Technical approach taken.

## Testing

- [ ] Manual smoke test of affected feature
- [ ] TypeScript compiles without errors
- [ ] Lint passes
- [ ] Production build succeeds

## Screenshots (if UI change)

Before / After screenshots.
```

### Review Checklist

- [ ] Code follows established patterns (server actions, ownership checks, store conventions)
- [ ] TypeScript types are correct (no `any` unless unavoidable)
- [ ] Server actions authenticate and authorize properly
- [ ] No secrets in `NEXT_PUBLIC_` variables
- [ ] Existing comments and docstrings preserved
- [ ] Documentation updated if architecture changed

---

## Documentation Standards

### When to Update Docs

| Change | Docs to Update |
|--------|---------------|
| New dependency | `02-technology-stack.md` |
| New agent in pipeline | `03-agentic-workflow.md`, `progress.ts` |
| Schema change | `04-data-model.md` |
| New server action | `05-api-reference.md` |
| New route or component | `06-frontend-architecture.md` |
| New env variable | `07-development-guide.md` |
| Major architectural decision | New ADR in `docs/adr/` |

### Documentation Quality Standards

Every documentation file should:

1. **Have a table of contents** for sections
2. **Include Mermaid diagrams** for non-trivial relationships
3. **Link to source files** using relative paths
4. **Be self-contained** — a reader shouldn't need to read other docs to understand the current one
5. **Use tables** for structured data over prose

---

## Architecture Decision Records

When making a significant architectural decision, create an ADR:

### When to Write an ADR

- Choosing between multiple technology options
- Changing a core data structure or pattern
- Adding or removing a major dependency
- Changing the deployment architecture
- Modifying the AI pipeline structure

### ADR Template

```markdown
# ADR-XXX: Title

**Status**: Proposed | Accepted | Deprecated | Superseded  
**Date**: YYYY-MM  
**Decision Makers**: Names

---

## Context
What is the problem? What are the constraints?

### Options Considered
| Option | Pros | Cons |

## Decision
What did we choose?

## Rationale
Why did we choose it? (numbered list)

## Consequences
### Positive
### Negative

## References
- Links to relevant source files
```

### Existing ADRs

| ADR | Decision |
|-----|----------|
| [ADR-001](adr/ADR-001-langgraph-orchestration.md) | LangGraph for AI orchestration |
| [ADR-002](adr/ADR-002-clerk-authentication.md) | Clerk for authentication |
| [ADR-003](adr/ADR-003-zustand-state-management.md) | Zustand for state management |
| [ADR-004](adr/ADR-004-sse-streaming.md) | SSE for real-time progress |
| [ADR-005](adr/ADR-005-layout-first-generation.md) | Layout-first content generation |
| [ADR-006](adr/ADR-006-recursive-content-tree.md) | Recursive ContentItem tree |
| [ADR-007](adr/ADR-007-lemon-squeezy-payments.md) | Lemon Squeezy for payments |
| [ADR-008](adr/ADR-008-inngest-background-jobs.md) | Inngest for background jobs |

---

*This guide is a living document. Update it as conventions evolve.*
