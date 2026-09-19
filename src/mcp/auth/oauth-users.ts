import { currentUser } from '@clerk/nextjs/server';
import { resolveAppUserForClerkUser } from '@/lib/user-compat';

/**
 * The app User row for the browser session driving /oauth/authorize, or null
 * when nobody is signed in.
 *
 * Row creation and the recreated-Clerk-account case live in
 * `resolveAppUserForClerkUser` so this path cannot drift from the dashboard's
 * again.
 */
export async function resolveCurrentOAuthUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  return resolveAppUserForClerkUser(clerkUser);
}
