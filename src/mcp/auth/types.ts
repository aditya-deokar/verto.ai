/**
 * MCP Authentication Types
 *
 * AuthContext is the standard interface passed to every tool handler.
 * Tool handlers NEVER interact with Clerk or API key logic directly.
 */

export type UserTier = 'free' | 'pro' | 'enterprise';

/**
 * Authenticated user context passed to every MCP tool handler.
 * This is transport-agnostic — populated from either API key or Clerk session.
 */
export interface AuthContext {
  /** Internal Prisma UUID for the user */
  userId: string;
  /** Clerk user ID (e.g., "user_abc123") */
  clerkId: string;
  /** User's email address */
  email: string;
  /** Subscription tier — controls rate limits and feature access */
  tier: UserTier;
}
