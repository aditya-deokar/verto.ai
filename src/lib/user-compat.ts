import type { Prisma } from "@/generated/prisma";
import prisma from "@/lib/prisma";

export const AUTHENTICATED_APP_USER_SELECT = {
  id: true,
  clerkId: true,
  email: true,
  name: true,
  profileImage: true,
  subscription: true,
  PurchasedProjects: {
    select: {
      id: true,
    },
  },
} satisfies Prisma.UserSelect;

export type AuthenticatedAppUser = Prisma.UserGetPayload<{
  select: typeof AUTHENTICATED_APP_USER_SELECT;
}>;

export async function findAuthenticatedAppUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    select: AUTHENTICATED_APP_USER_SELECT,
  });
}

export async function findUserIdByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
}

/** The subset of a Clerk user this app needs to resolve its own row. */
export interface ClerkUserIdentity {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

function displayNameFor(clerkUser: ClerkUserIdentity, email: string): string {
  return [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()
    || email;
}

/**
 * Resolves the app's User row for a signed-in Clerk user, creating it when
 * this is their first visit.
 *
 * `User.email` is unique, so a plain create throws P2002 whenever a row
 * already exists under that address with a different `clerkId` — which is
 * what happens when someone recreates their Clerk account or signs in through
 * a different provider. The dashboard handled that by adopting the existing
 * row; the OAuth authorize route had its own copy of this logic without the
 * adoption branch, so connecting an MCP host failed for exactly those users
 * while the dashboard worked. Both paths now come through here.
 */
export async function resolveAppUserForClerkUser(
  clerkUser: ClerkUserIdentity
): Promise<AuthenticatedAppUser | null> {
  const existing = await findAuthenticatedAppUserByClerkId(clerkUser.id);
  if (existing) {
    return existing;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    return null;
  }

  // Same person, new Clerk identity: move the row onto the current clerkId.
  const byEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { clerkId: clerkUser.id },
      select: AUTHENTICATED_APP_USER_SELECT,
    });
  }

  try {
    return await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name: displayNameFor(clerkUser, email),
        profileImage: clerkUser.imageUrl ?? null,
      },
      select: AUTHENTICATED_APP_USER_SELECT,
    });
  } catch (error) {
    // Two concurrent sign-ins can both pass the checks above; whichever loses
    // the unique index reads the winner's row instead of failing the request.
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    return (
      await findAuthenticatedAppUserByClerkId(clerkUser.id)
      ?? await prisma.user.findUnique({
        where: { email },
        select: AUTHENTICATED_APP_USER_SELECT,
      })
    );
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return Boolean(
    error
    && typeof error === 'object'
    && (error as { code?: unknown }).code === 'P2002'
  );
}
