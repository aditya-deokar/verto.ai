# ADR-002: Clerk for Authentication

**Status**: Accepted  
**Date**: 2024  
**Decision Makers**: Core team

---

## Context

Verto AI needs user authentication for project ownership, subscription management, and access control. We needed to decide between building custom auth, using NextAuth.js, or adopting a managed identity provider.

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **Clerk** | Managed identity platform | Drop-in components, edge middleware, multi-provider, excellent DX | Vendor lock-in, monthly cost at scale |
| **NextAuth.js (Auth.js)** | Open-source auth for Next.js | Free, flexible, large community | More setup, need to manage sessions/tokens, UI build required |
| **Supabase Auth** | Auth bundled with Supabase | Free tier, integrates with Supabase DB | Ties auth to database provider |
| **Custom JWT** | Hand-built auth system | Full control | Significant security risk, maintenance burden |

## Decision

**Use Clerk** (`@clerk/nextjs`) as the authentication provider.

## Rationale

1. **Zero auth UI code**: Clerk provides pre-built sign-in/sign-up components with dark theme support, eliminating the need to build and maintain auth forms.

2. **Edge middleware integration**: `clerkMiddleware()` runs at the Edge, protecting routes before they reach Node.js. This is the fastest possible route protection.

3. **Automatic user provisioning**: Combined with our `onAuthenticateUser()` pattern, new users are seamlessly created in our database on first sign-in — no registration flow needed.

4. **Multi-provider support**: Email, Google, GitHub, and other OAuth providers are available out of the box with no additional code.

5. **Next.js App Router compatibility**: Clerk has first-class support for Server Components, Server Actions, and the App Router pattern.

## Consequences

### Positive
- Authentication implemented in < 1 day
- Professional sign-in/sign-up UI with no custom CSS
- Edge-level route protection (default-deny pattern)
- Handles password resets, email verification, session management automatically

### Negative
- Vendor dependency — migrating away from Clerk requires significant effort
- Free tier has limits (10,000 MAU for development)
- Dark theme is applied globally to all Clerk components

### Implementation Details
- User sync: `onAuthenticateUser()` creates a local `User` record from Clerk profile data
- Clerk `clerkId` is stored as a unique field for user lookup
- Middleware uses `createRouteMatcher()` for public routes pattern

## References

- `src/middleware.ts` — Route protection
- `src/actions/user.ts` — User provisioning
- `src/app/layout.tsx` — ClerkProvider setup
